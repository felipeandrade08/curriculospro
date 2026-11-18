import { checkAdmin } from "@/lib/server/admin";
import { db } from "@/lib/server/db";
import { deliverFromForm } from "@/lib/server/deliver";
import { ensurePanelOrder } from "@/lib/server/panel-orders";
import { isSameOrigin } from "@/lib/server/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Entrega do currículo de uma venda feita pelo "Cobrar no Pix": cria o pedido ligado ao pagamento
 * e gera o link para o cliente baixar em PDF e Word (e envia por e-mail, se tiver).
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  const check = await checkAdmin();
  if (!check.ok) return Response.json({ error: "forbidden" }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 5_000_000)
    return Response.json({ ok: false, message: "Envio grande demais (máximo 4 MB de PDF)." }, { status: 413 });
  const form = await request.formData().catch(() => null);
  if (!form) return Response.json({ ok: false, message: "Envio inválido." }, { status: 400 });
  const paymentId = String(form.get("paymentId") || "");
  if (!/^\d{1,20}$/.test(paymentId)) return Response.json({ ok: false, message: "Cobrança inválida." }, { status: 400 });

  const sql = db();
  const [pay] = await sql`SELECT id, user_id, customer, granted_at, revoked_at FROM payments WHERE id = ${paymentId}`;
  if (!pay?.customer) return Response.json({ ok: false, message: "Cobrança não encontrada." }, { status: 404 });
  if (!pay.granted_at || pay.revoked_at)
    return Response.json({ ok: false, message: "Esta cobrança ainda não foi paga." }, { status: 409 });

  // Um pedido por venda (criado quando o Pix foi pago); vendas antigas ganham o pedido agora.
  const requestId = await ensurePanelOrder(paymentId, check.session.userId).catch(() => null);
  if (!requestId)
    return Response.json({ ok: false, message: "Não foi possível abrir o pedido desta venda. Tente de novo." }, { status: 500 });
  const [req] = await sql`SELECT status FROM service_requests WHERE id = ${requestId}`;
  if (req?.status === "delivered")
    return Response.json({ ok: false, message: "O currículo desta venda já foi entregue." }, { status: 409 });

  form.set("id", requestId);
  const result = await deliverFromForm(form, check.session.userId);
  return Response.json({ ...result, requestId, inAccount: !!pay.user_id }, { status: result.ok ? 200 : 400 });
}
