import { randomUUID } from "node:crypto";
import { ACCESS_PLANS, PIX_EXPIRATION_MINUTES, isAccessPlan } from "@/lib/billing";
import { priceFor } from "@/lib/server/coupons";
import { getServerSession } from "@/lib/server/session";
import { createPixPayment, mercadoPagoConfigured, MercadoPagoError } from "@/lib/server/mercadopago";
import {
  countRecentPayments,
  findReusablePending,
  insertPayment,
  toCheckout,
  type PaymentRow,
  canUpgrade,
} from "@/lib/server/payments";
import { isSameOrigin, publicBaseUrl } from "@/lib/server/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PIX_PER_DAY = 8;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  if (!mercadoPagoConfigured())
    return Response.json(
      { error: "payments_unavailable", message: "Pagamentos ainda não foram configurados." },
      { status: 503 },
    );
  try {
    const session = await getServerSession();
    if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });

    const body = (await request.json().catch(() => ({}))) as { plan?: unknown; coupon?: unknown };
    const plan = ACCESS_PLANS[isAccessPlan(body.plan) ? body.plan : "semana"];
    if (plan.id === "upgrade" && !(await canUpgrade(session.userId)))
      return Response.json(
        { error: "upgrade_unavailable", message: "O upgrade é para quem está com o pacote Currículo ativo." },
        { status: 400 },
      );
    const price = await priceFor(plan.id, body.coupon, session.userId);
    if (!price.ok) return Response.json({ error: "invalid_coupon", message: price.message }, { status: 400 });

    const reusable = await findReusablePending(session.userId, price.amountCents, plan.days, price.couponCode);
    if (reusable) return Response.json({ checkout: toCheckout(reusable) });

    if ((await countRecentPayments(session.userId)) >= MAX_PIX_PER_DAY)
      return Response.json(
        {
          error: "too_many_payments",
          message: "Você gerou muitos códigos Pix hoje. Tente novamente amanhã ou fale com o suporte.",
        },
        { status: 429 },
      );

    const expiresAt = new Date(Date.now() + PIX_EXPIRATION_MINUTES * 60 * 1000);
    const base = publicBaseUrl(request);
    const notificationUrl =
      base && base.startsWith("https://") ? base + "/api/webhooks/mercadopago" : undefined;

    const payment = await createPixPayment({
      amountCents: price.amountCents,
      description: plan.product,
      payerEmail: session.email,
      externalReference: session.userId,
      expiresAt,
      notificationUrl,
      idempotencyKey: randomUUID(),
    });
    const data = payment.point_of_interaction?.transaction_data;
    const row: PaymentRow = {
      id: String(payment.id),
      user_id: session.userId,
      status: payment.status,
      amount_cents: price.amountCents,
      access_days: plan.days,
      qr_code: data?.qr_code || null,
      qr_code_base64: data?.qr_code_base64 || null,
      ticket_url: data?.ticket_url || null,
      expires_at: (payment.date_of_expiration
        ? new Date(payment.date_of_expiration)
        : expiresAt
      ).toISOString(),
      granted_at: null,
      plan: plan.id,
      coupon_code: price.couponCode,
    };
    await insertPayment({
      id: row.id,
      userId: row.user_id,
      status: row.status,
      statusDetail: payment.status_detail || null,
      amountCents: row.amount_cents,
      accessDays: row.access_days,
      qrCode: row.qr_code,
      qrCodeBase64: row.qr_code_base64,
      ticketUrl: row.ticket_url,
      expiresAt: new Date(row.expires_at!),
      plan: plan.id,
      couponCode: price.couponCode,
      originalCents: price.originalCents,
    });
    return Response.json({ checkout: toCheckout(row) }, { status: 201 });
  } catch (error) {
    if (error instanceof MercadoPagoError) {
      console.error("Mercado Pago:", error.status, error.detail);
      return Response.json(
        {
          error: "provider_error",
          message: "Não foi possível gerar o Pix agora. Tente novamente em instantes.",
        },
        { status: 502 },
      );
    }
    console.error("Checkout Pix falhou", error);
    return Response.json(
      { error: "checkout_failed", message: "Não foi possível iniciar o pagamento agora." },
      { status: 500 },
    );
  }
}
