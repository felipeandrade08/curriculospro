import { getPayment, MercadoPagoError, verifyWebhookSignature, type MercadoPagoPayment } from "@/lib/server/mercadopago";
import { adoptCheckoutProPayment, applyProviderPayment, findPayment, type PaymentRow } from "@/lib/server/payments";

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
    if (!valid) {
      // Registro para diagnóstico (sem dados do pagador): ajuda a ver avisos recusados nos logs da Vercel.
      console.warn("Aviso do Mercado Pago recusado: assinatura inválida", {
        dataId,
        type,
        hasSignature: !!request.headers.get("x-signature"),
        hasRequestId: !!request.headers.get("x-request-id"),
      });
      return Response.json({ error: "invalid_signature" }, { status: 401 });
    }
  }

  if (type !== "payment" || !dataId || !/^\d{1,20}$/.test(dataId)) return Response.json({ ok: true });

  try {
    let row: PaymentRow | null = await findPayment(dataId);
    let payment: MercadoPagoPayment;
    try {
      payment = await getPayment(dataId);
    } catch (error) {
      if (!row && error instanceof MercadoPagoError && error.status === 404)
        return Response.json({ ok: true, ignored: true });
      throw error;
    }
    // Pagamento com cartão (Checkout Pro): ainda não existe no banco até chegar aqui.
    if (!row) row = await adoptCheckoutProPayment(payment);
    if (!row) return Response.json({ ok: true, ignored: true });
    const result = await applyProviderPayment(payment, row);
    return Response.json({ ok: true, status: result.status });
  } catch (error) {
    console.error("Webhook Mercado Pago falhou", error);
    // 500 faz o Mercado Pago tentar novamente mais tarde.
    return Response.json({ error: "processing_failed" }, { status: 500 });
  }
}
