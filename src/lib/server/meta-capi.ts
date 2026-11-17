// API de Conversões da Meta: avisa o Purchase pelo servidor, que não é bloqueado por
// navegador ou bloqueador de anúncios. Usa o mesmo event_id do Pixel ("pix-<id>"),
// então a Meta conta uma compra só. Só roda com META_CAPI_TOKEN configurado na Vercel.
import { createHash } from "node:crypto";
import { db } from "@/lib/server/db";
import type { SaleSource } from "@/lib/server/sales-source";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "";
const TOKEN = () => process.env.META_CAPI_TOKEN?.trim() || "";
const API = "https://graph.facebook.com/v21.0/";

export const metaCapiConfigured = () => !!PIXEL_ID && !!TOKEN();
const sha = (v: string) => createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

export async function sendMetaPurchase(paymentId: string) {
  if (!metaCapiConfigured()) return;
  const sql = db();
  // Marca antes de enviar: sai uma vez só, mesmo com webhook e consulta ao mesmo tempo.
  const [row] = await sql`UPDATE payments p SET capi_sent_at = now()
    FROM app_users u
    WHERE p.id = ${paymentId} AND u.id = p.user_id AND p.capi_sent_at IS NULL
      AND p.source ? 'meta'
    RETURNING u.email, u.id AS user_id, p.amount_cents, p.plan, p.source,
      EXTRACT(EPOCH FROM COALESCE(p.approved_at, now()))::bigint AS at`;
  if (!row) return;
  const meta = ((row.source as SaleSource | null)?.meta || {}) as NonNullable<SaleSource["meta"]>;
  const site = (process.env.SITE_URL || "https://www.curriculospro.site").replace(/\/+$/, "");
  const event = {
    event_name: "Purchase",
    event_time: Number(row.at),
    event_id: "pix-" + paymentId,
    action_source: "website",
    event_source_url: site + "/pagamento",
    user_data: {
      em: row.email ? [sha(String(row.email))] : undefined,
      external_id: [sha(String(row.user_id))],
      client_ip_address: meta.ip,
      client_user_agent: meta.ua,
      fbp: meta.fbp,
      fbc: meta.fbc,
    },
    custom_data: {
      currency: "BRL",
      value: Number(row.amount_cents) / 100,
      content_name: String(row.plan || "semana"),
      order_id: paymentId,
    },
  };
  try {
    const response = await fetch(API + PIXEL_ID + "/events?access_token=" + encodeURIComponent(TOKEN()), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: [event] }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.error("Meta CAPI recusou", response.status, (await response.text()).slice(0, 300));
      await sql`UPDATE payments SET capi_sent_at = NULL WHERE id = ${paymentId}`;
    }
  } catch (error) {
    console.error("Meta CAPI falhou", error);
    await sql`UPDATE payments SET capi_sent_at = NULL WHERE id = ${paymentId}`;
  }
}
