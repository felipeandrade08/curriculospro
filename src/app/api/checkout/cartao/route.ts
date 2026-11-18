import { ACCESS_PLANS, isAccessPlan } from "@/lib/billing";
import { getServerSession } from "@/lib/server/session";
import { createCardPreference, getPayment, mercadoPagoConfigured, MercadoPagoError } from "@/lib/server/mercadopago";
import { priceFor } from "@/lib/server/coupons";
import {
  adoptCheckoutProPayment,
  applyProviderPayment,
  countRecentPayments,
  createCheckoutIntent,
  findPayment,
  getAccessUntil,
  setIntentPreference,
  toCheckout,
  type PaymentRow,
  canUpgrade,
} from "@/lib/server/payments";
import { isSameOrigin, publicBaseUrl } from "@/lib/server/request";
import { readSaleSource } from "@/lib/server/sales-source";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Cria o checkout do Mercado Pago para pagar com cartão e devolve o link para onde a pessoa vai. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  if (!mercadoPagoConfigured())
    return Response.json({ error: "payments_unavailable", message: "Pagamentos ainda não foram configurados." }, { status: 503 });
  try {
    const session = await getServerSession();
    if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
    if ((await countRecentPayments(session.userId)) >= 12)
      return Response.json(
        { error: "too_many_payments", message: "Muitas tentativas de pagamento hoje. Fale com o suporte." },
        { status: 429 },
      );
    const body = (await request.json().catch(() => ({}))) as {
      plan?: unknown;
      coupon?: unknown;
      origin?: unknown;
      consent?: unknown;
    };
    const plan = ACCESS_PLANS[isAccessPlan(body.plan) ? body.plan : "semana"];
    if (plan.id === "upgrade" && !(await canUpgrade(session.userId)))
      return Response.json(
        { error: "upgrade_unavailable", message: "O upgrade é para quem está com o pacote Currículo ativo." },
        { status: 400 },
      );
    const price = await priceFor(plan.id, body.coupon, session.userId);
    if (!price.ok) return Response.json({ error: "invalid_coupon", message: price.message }, { status: 400 });

    const intentId = await createCheckoutIntent({
      user_id: session.userId,
      plan: plan.id,
      amount_cents: price.amountCents,
      original_cents: price.originalCents,
      access_days: plan.days,
      coupon_code: price.couponCode,
      source: await readSaleSource(request, body),
    });
    const base = publicBaseUrl(request) || "";
    const preference = await createCardPreference({
      intentId,
      amountCents: price.amountCents,
      title: plan.product,
      planId: plan.id,
      payerEmail: session.email,
      externalReference: session.userId,
      returnUrl: base + "/pagamento",
      notificationUrl: base.startsWith("https://") ? base + "/api/webhooks/mercadopago?source_news=webhooks" : undefined,
    });
    await setIntentPreference(intentId, preference.id);
    return Response.json({ url: preference.init_point }, { status: 201 });
  } catch (error) {
    if (error instanceof MercadoPagoError) console.error("Mercado Pago cartão:", error.status, error.detail);
    else console.error("Checkout cartão falhou", error);
    return Response.json(
      { error: "checkout_failed", message: "Não foi possível abrir o pagamento com cartão agora." },
      { status: 502 },
    );
  }
}

/** Ao voltar do Mercado Pago: confere o pagamento e libera o acesso se aprovado. */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("payment_id") || "";
  if (!/^\d{1,20}$/.test(id)) return Response.json({ error: "invalid_payment" }, { status: 400 });
  try {
    const session = await getServerSession();
    if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
    let row: PaymentRow | null = await findPayment(id);
    if (!row || !row.granted_at) {
      const payment = await getPayment(id);
      if (!row) row = await adoptCheckoutProPayment(payment);
      if (!row || row.user_id !== session.userId) return Response.json({ error: "not_found" }, { status: 404 });
      await applyProviderPayment(payment, row);
      row = (await findPayment(id)) || row;
    }
    if (row.user_id !== session.userId) return Response.json({ error: "not_found" }, { status: 404 });
    return Response.json({ checkout: toCheckout(row, await getAccessUntil(session.userId)) });
  } catch (error) {
    console.error("Retorno do cartão falhou", error);
    return Response.json({ error: "status_unavailable" }, { status: 500 });
  }
}
