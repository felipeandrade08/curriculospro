// Vendas feitas pelo "Cobrar no Pix" viram pedidos do Fazemos para você assim que o Pix é pago:
// aparecem em Pedidos → Abertos e, depois da entrega, em Entregues.
import { db } from "@/lib/server/db";

/** Planos de cobrança do painel que são serviço (a equipe monta o currículo). */
const SERVICE_PLANS = new Set(["servico", "avulso"]);

/**
 * Garante o pedido da venda paga. Seguro para chamar mais de uma vez (webhook + consulta):
 * só quem "reserva" a cobrança cria o pedido. Devolve o id do pedido (ou null se não for serviço).
 */
export async function ensurePanelOrder(paymentId: string, ownerFallback?: string): Promise<string | null> {
  const sql = db();
  const [pay] = await sql`SELECT id, user_id, plan, amount_cents, customer, granted_at, revoked_at
    FROM payments WHERE id = ${paymentId}`;
  if (!pay?.customer || !pay.granted_at || pay.revoked_at) return null;
  const customer = pay.customer as Record<string, string>;
  if (customer.requestId && customer.requestId !== "pending") return customer.requestId;
  if (!SERVICE_PLANS.has(String(pay.plan)) && !ownerFallback) return null;

  // Reserva: evita dois pedidos para a mesma venda.
  const [claimed] = await sql`UPDATE payments SET customer = customer || '{"requestId":"pending"}'::jsonb
    WHERE id = ${paymentId} AND NOT (customer ? 'requestId') RETURNING id`;
  if (!claimed) return null;

  try {
    let owner = pay.user_id ? String(pay.user_id) : ownerFallback || "";
    if (!owner) {
      const email = (customer.by || process.env.ADMIN_EMAIL || "").toLowerCase();
      const [admin] = email ? await sql`SELECT id FROM app_users WHERE lower(email) = ${email} LIMIT 1` : [];
      owner = admin ? String(admin.id) : "";
    }
    if (!owner) throw new Error("sem dono para o pedido");
    const data = {
      name: customer.name || "",
      whatsapp: customer.phone || "",
      email: customer.email || "",
      role: "",
      city: "",
      notes: customer.description || "",
      sourceText: "",
      resume: null,
      delivery: customer.phone ? "whatsapp" : "email",
      via: "pix",
      paymentId,
      amountCents: Number(pay.amount_cents),
      inAccount: !!pay.user_id,
    };
    const [req] = await sql`INSERT INTO service_requests (user_id, status, data)
      VALUES (${owner}, 'new', ${JSON.stringify(data)}::jsonb) RETURNING id::text`;
    const requestId = String(req.id);
    await sql`UPDATE payments SET customer = customer || ${JSON.stringify({ requestId })}::jsonb WHERE id = ${paymentId}`;
    return requestId;
  } catch (error) {
    // Libera a reserva para tentar de novo na próxima consulta.
    await sql`UPDATE payments SET customer = customer - 'requestId' WHERE id = ${paymentId}`.catch(() => {});
    throw error;
  }
}
