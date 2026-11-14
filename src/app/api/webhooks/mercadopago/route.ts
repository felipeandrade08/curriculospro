import { getPayment, verifyWebhookSignature } from "@/lib/server/mercadopago";
import { applyProviderPayment, findPayment } from "@/lib/server/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Notificações do Mercado Pago. O corpo é usado apenas para saber QUAL pagamento mudou;
 * o status oficial é sempre consultado na API do Mercado Pago antes de liberar acesso.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const raw = await request.text();
  let body: { type?: string; topic?: string; action?: string; data?: { id?: string | number } } = {};
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {}

  const dataId = url.searchParams.get("data.id") || (body.data?.id != null ? String(body.data.id) : null);
  const type = url.searchParams.get("type") || url.searchParams.get("topic") || body.type || body.topic;

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (secret) {
    const valid = verifyWebhookSignature({
      secret,
      signatureHeader: request.headers.get("x-signature"),
      requestId: request.headers.get("x-request-id"),
      dataId,
    });
    if (!valid) return Response.json({ error: "invalid_signature" }, { status: 401 });
  }

  if (type !== "payment" || !dataId || !/^\d{1,20}$/.test(dataId)) return Response.json({ ok: true });

  try {
    const row = await findPayment(dataId);
    if (!row) return Response.json({ ok: true, ignored: true });
    const payment = await getPayment(dataId);
    const result = await applyProviderPayment(payment, row);
    return Response.json({ ok: true, status: result.status });
  } catch (error) {
    console.error("Webhook Mercado Pago falhou", error);
    // 500 faz o Mercado Pago tentar novamente mais tarde.
    return Response.json({ error: "processing_failed" }, { status: 500 });
  }
}
