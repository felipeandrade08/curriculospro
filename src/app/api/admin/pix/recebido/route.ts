import { checkAdmin } from "@/lib/server/admin";
import { db } from "@/lib/server/db";
import { afterPaymentGranted } from "@/lib/server/after-payment";
import { cancelPayment, getPayment, mercadoPagoConfigured } from "@/lib/server/mercadopago";
import { applyProviderPayment, findPayment, grantAccess } from "@/lib/server/payments";
import { ensurePanelOrder } from "@/lib/server/panel-orders";
import { isSameOrigin } from "@/lib/server/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * O cliente pagou por fora (chave Pix, transferência): a equipe dá baixa na cobrança.
 * Antes, confere no Mercado Pago; se o Pix gerado ainda está aberto, cancela para não ser pago duas vezes.
 * Depois segue o mesmo caminho de uma venda paga: libera o pacote, abre o pedido e conta nas vendas.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  const check = await checkAdmin();
  if (!check.ok) return Response.json({ error: "forbidden" }, { status: 403 });
  const body = (await request.json().catch(() => ({}))) as { id?: unknown };
  const id = typeof body.id === "string" && /^\d{1,20}$/.test(body.id) ? body.id : "";
  if (!id) return Response.json({ message: "Cobrança inválida." }, { status: 400 });

  const sql = db();
  const [pay] = await sql`SELECT id, customer, granted_at, revoked_at FROM payments WHERE id = ${id}`;
  if (!pay?.customer) return Response.json({ message: "Cobrança não encontrada." }, { status: 404 });
  if (pay.granted_at) return Response.json({ ok: true, already: true });
  if (pay.revoked_at) return Response.json({ message: "Esta cobrança foi estornada." }, { status: 409 });
  const customer = pay.customer as Record<string, string>;
  if (customer.replacedBy)
    return Response.json(
      { message: "Esta cobrança tem um Pix mais novo. Dê baixa na linha mais recente.", id: customer.replacedBy },
      { status: 409 },
    );

  let cancelled = false;
  if (mercadoPagoConfigured()) {
    try {
      const row = await findPayment(id);
      const mp = await getPayment(id);
      // Pagou pelo Pix gerado mesmo: baixa automática normal.
      if (mp.status === "approved" && row) {
        await applyProviderPayment(mp, row);
        return Response.json({ ok: true, viaMercadoPago: true });
      }
      if (mp.status === "pending" || mp.status === "in_process") {
        await cancelPayment(id);
        cancelled = true;
      }
    } catch (error) {
      console.error("Baixa manual: conferência no Mercado Pago falhou", id, error);
    }
  }

  const granted = await grantAccess(id, "manual_chave_pix", null);
  await sql`UPDATE payments SET customer = customer || ${JSON.stringify({
    paidVia: "chave_pix",
    markedPaidBy: check.session.email,
    markedPaidAt: new Date().toISOString(),
  })}::jsonb WHERE id = ${id}`;
  let requestId: string | null = null;
  try {
    requestId = await ensurePanelOrder(id);
  } catch (error) {
    console.error("Pedido da baixa manual falhou", id, error);
  }
  if (granted) await afterPaymentGranted(id);
  return Response.json({ ok: true, granted, cancelled, requestId });
}
