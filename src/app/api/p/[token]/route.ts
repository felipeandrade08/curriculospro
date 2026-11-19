import { getPayment, mercadoPagoConfigured } from "@/lib/server/mercadopago";
import { applyProviderPayment, findPayment } from "@/lib/server/payments";
import { loadPayPage } from "@/lib/server/pay-page";
import { verifyPayToken } from "@/lib/server/pay-link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Confere no Mercado Pago no máximo a cada 15 s por cobrança (o aviso automático costuma chegar antes).
const lastCheck = new Map<string, number>();

/** Situação do pagamento para a página /p/<token> (o cliente vê "Pagamento confirmado" sozinho). */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const id = verifyPayToken((await params).token);
  if (!id) return Response.json({ error: "invalid" }, { status: 404 });
  let page = await loadPayPage(id);
  if (!page) return Response.json({ error: "not_found" }, { status: 404 });
  const now = Date.now();
  if (page.status === "pending" && mercadoPagoConfigured() && now - (lastCheck.get(id) || 0) > 15_000) {
    lastCheck.set(id, now);
    if (lastCheck.size > 2000) lastCheck.clear();
    try {
      const row = await findPayment(id);
      if (row) {
        await applyProviderPayment(await getPayment(id), row);
        page = (await loadPayPage(id)) || page;
      }
    } catch {}
  }
  return Response.json({ status: page.status }, { headers: { "cache-control": "no-store" } });
}
