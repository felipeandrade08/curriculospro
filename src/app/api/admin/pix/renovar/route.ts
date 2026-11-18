import { randomUUID } from "node:crypto";
import { checkAdmin } from "@/lib/server/admin";
import { db } from "@/lib/server/db";
import { createPixPayment, mercadoPagoConfigured, MercadoPagoError } from "@/lib/server/mercadopago";
import { PANEL_REFERENCE, clientStatus, insertPayment } from "@/lib/server/payments";
import { isSameOrigin, publicBaseUrl } from "@/lib/server/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPIRES_HOURS = 24;

/** Pix vencido: gera um novo para a mesma cobrança (mesmo cliente, valor e pacote). */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  const check = await checkAdmin();
  if (!check.ok) return Response.json({ error: "forbidden" }, { status: 403 });
  if (!mercadoPagoConfigured())
    return Response.json({ message: "O Mercado Pago não está configurado." }, { status: 503 });
  const body = (await request.json().catch(() => ({}))) as { id?: unknown };
  const oldId = typeof body.id === "string" && /^\d{1,20}$/.test(body.id) ? body.id : "";
  if (!oldId) return Response.json({ message: "Cobrança inválida." }, { status: 400 });

  const sql = db();
  const [old] = await sql`SELECT id, user_id, status, amount_cents, original_cents, access_days, plan, customer, expires_at,
      granted_at FROM payments WHERE id = ${oldId}`;
  if (!old?.customer) return Response.json({ message: "Cobrança não encontrada." }, { status: 404 });
  const customer = old.customer as Record<string, string>;
  if (old.granted_at) return Response.json({ message: "Esta cobrança já foi paga." }, { status: 409 });
  if (customer.replacedBy)
    return Response.json({ message: "Já existe um Pix novo para esta cobrança.", id: customer.replacedBy }, { status: 409 });
  const st = clientStatus(String(old.status), old.expires_at ? new Date(String(old.expires_at)).toISOString() : null);
  // Enquanto o Pix antigo vale, um novo deixaria o cliente pagar duas vezes.
  if (st === "pending")
    return Response.json(
      { message: "Este Pix ainda está valendo. Reenvie o mesmo código; dá para gerar outro quando ele vencer." },
      { status: 409 },
    );

  const cents = Number(old.amount_cents);
  const userId = old.user_id ? String(old.user_id) : null;
  try {
    const expiresAt = new Date(Date.now() + EXPIRES_HOURS * 3600 * 1000);
    const base = publicBaseUrl(request);
    const payment = await createPixPayment({
      amountCents: cents,
      description: customer.description || "CurriculosPRO",
      payerEmail: customer.email || check.session.email,
      externalReference: userId || PANEL_REFERENCE,
      expiresAt,
      notificationUrl: base && base.startsWith("https://") ? base + "/api/webhooks/mercadopago" : undefined,
      idempotencyKey: randomUUID(),
    });
    const data = payment.point_of_interaction?.transaction_data;
    const newId = String(payment.id);
    await insertPayment({
      id: newId,
      userId,
      status: payment.status,
      statusDetail: payment.status_detail || null,
      amountCents: cents,
      accessDays: Number(old.access_days),
      qrCode: data?.qr_code || null,
      qrCodeBase64: data?.qr_code_base64 || null,
      ticketUrl: data?.ticket_url || null,
      expiresAt: payment.date_of_expiration ? new Date(payment.date_of_expiration) : expiresAt,
      plan: String(old.plan),
      originalCents: Number(old.original_cents ?? cents),
      source: { source: "whatsapp", medium: "painel" },
      customer: { ...customer, renewedFrom: oldId, by: check.session.email },
    });
    await sql`UPDATE payments SET customer = customer || ${JSON.stringify({ replacedBy: newId })}::jsonb WHERE id = ${oldId}`;
    return Response.json({
      id: newId,
      status: clientStatus(payment.status, payment.date_of_expiration || expiresAt.toISOString()),
      qrCode: data?.qr_code || null,
      qrCodeBase64: data?.qr_code_base64 || null,
      ticketUrl: data?.ticket_url || null,
      amountCents: cents,
      description: customer.description || "CurriculosPRO",
      expiresAt: payment.date_of_expiration || expiresAt.toISOString(),
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      needsAccount: !!userId,
    });
  } catch (error) {
    if (error instanceof MercadoPagoError) console.error("Novo Pix do painel:", error.status, error.detail);
    else console.error("Novo Pix do painel falhou", error);
    return Response.json({ message: "O Mercado Pago não gerou o Pix agora. Tente de novo." }, { status: 502 });
  }
}
