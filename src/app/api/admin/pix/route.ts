import { randomUUID } from "node:crypto";
import { ACCESS_PLANS } from "@/lib/billing";
import { checkAdmin } from "@/lib/server/admin";
import { db } from "@/lib/server/db";
import { createPixPayment, getPayment, mercadoPagoConfigured, MercadoPagoError } from "@/lib/server/mercadopago";
import {
  PANEL_REFERENCE,
  applyProviderPayment,
  clientStatus,
  findPayment,
  insertPayment,
} from "@/lib/server/payments";
import { isSameOrigin, publicBaseUrl } from "@/lib/server/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Pix gerado pela equipe vale 24 h: dá tempo de o cliente pagar pelo WhatsApp. */
const EXPIRES_HOURS = 24;
const text = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

/** Gera uma cobrança Pix pelo painel (venda pelo WhatsApp). */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  const check = await checkAdmin();
  if (!check.ok) return Response.json({ error: "forbidden" }, { status: 403 });
  if (!mercadoPagoConfigured())
    return Response.json({ message: "O Mercado Pago não está configurado." }, { status: 503 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const kind = text(body.kind, 20);
  const email = text(body.email, 160).toLowerCase();
  const name = text(body.name, 80);
  const phone = text(body.phone, 30).replace(/[^\d+() -]/g, "");
  const description = text(body.description, 120);
  const cents = Math.round(Number(String(body.amount || "").replace(",", ".")) * 100);
  if (!Number.isFinite(cents) || cents < 100 || cents > 500_000)
    return Response.json({ message: "Informe um valor entre R$ 1,00 e R$ 5.000,00." }, { status: 400 });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return Response.json({ message: "O e-mail do cliente parece incompleto." }, { status: 400 });

  // Pacote: libera o acesso na conta do cliente quando o Pix for pago.
  const plan = kind === "semana" || kind === "mes" ? ACCESS_PLANS[kind] : null;
  let userId: string | null = null;
  if (plan) {
    if (!email)
      return Response.json({ message: "Para liberar o pacote, informe o e-mail da conta do cliente." }, { status: 400 });
    const [user] = await db()`SELECT id FROM app_users WHERE lower(email) = ${email} LIMIT 1`;
    if (!user)
      return Response.json(
        {
          message:
            "Não achamos uma conta com esse e-mail. Peça para o cliente criar a conta antes, ou cobre como “Outro valor” e libere depois na aba Clientes.",
        },
        { status: 404 },
      );
    userId = String(user.id);
  }
  const title =
    description ||
    (plan ? plan.product : kind === "servico" ? "Fazemos para você — currículo pronto" : "CurriculosPRO");

  try {
    const expiresAt = new Date(Date.now() + EXPIRES_HOURS * 3600 * 1000);
    const base = publicBaseUrl(request);
    const payment = await createPixPayment({
      amountCents: cents,
      description: title,
      payerEmail: email || check.session.email,
      externalReference: userId || PANEL_REFERENCE,
      expiresAt,
      notificationUrl: base && base.startsWith("https://") ? base + "/api/webhooks/mercadopago" : undefined,
      idempotencyKey: randomUUID(),
    });
    const data = payment.point_of_interaction?.transaction_data;
    await insertPayment({
      id: String(payment.id),
      userId,
      status: payment.status,
      statusDetail: payment.status_detail || null,
      amountCents: cents,
      accessDays: plan ? plan.days : 0,
      qrCode: data?.qr_code || null,
      qrCodeBase64: data?.qr_code_base64 || null,
      ticketUrl: data?.ticket_url || null,
      expiresAt: payment.date_of_expiration ? new Date(payment.date_of_expiration) : expiresAt,
      plan: plan ? plan.id : kind === "servico" ? "servico" : "avulso",
      originalCents: plan ? plan.cents : cents,
      source: { source: "whatsapp", medium: "painel" },
      customer: { name, email, phone, description: title, by: check.session.email },
    });
    return Response.json({
      id: String(payment.id),
      status: clientStatus(payment.status, payment.date_of_expiration || expiresAt.toISOString()),
      qrCode: data?.qr_code || null,
      qrCodeBase64: data?.qr_code_base64 || null,
      ticketUrl: data?.ticket_url || null,
      amountCents: cents,
      description: title,
      expiresAt: payment.date_of_expiration || expiresAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof MercadoPagoError) console.error("Pix do painel:", error.status, error.detail);
    else console.error("Pix do painel falhou", error);
    return Response.json({ message: "O Mercado Pago não gerou o Pix agora. Tente de novo." }, { status: 502 });
  }
}

/** Situação de uma cobrança do painel (confere no Mercado Pago enquanto estiver aguardando). */
export async function GET(request: Request) {
  const check = await checkAdmin();
  if (!check.ok) return Response.json({ error: "forbidden" }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!/^\d{1,20}$/.test(id)) return Response.json({ error: "invalid" }, { status: 400 });
  let row = await findPayment(id);
  if (!row) return Response.json({ error: "not_found" }, { status: 404 });
  if (!row.granted_at && ["pending", "in_process"].includes(row.status)) {
    try {
      const payment = await getPayment(id);
      await applyProviderPayment(payment, row);
      row = (await findPayment(id)) || row;
    } catch {}
  }
  const expires = row.expires_at ? new Date(row.expires_at).toISOString() : null;
  return Response.json({ id, status: row.granted_at ? "approved" : clientStatus(row.status, expires) });
}
