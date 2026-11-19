// Dados públicos (mínimos) de uma cobrança do painel para a página de pagamento /p/<token>.
import { db } from "@/lib/server/db";
import { clientStatus } from "@/lib/server/payments";

export type PayPage = {
  id: string;
  status: "pending" | "approved" | "expired" | "cancelled" | "rejected";
  amountCents: number;
  description: string;
  firstName: string;
  qrCode: string | null;
  qrCodeBase64: string | null;
  expiresAt: string | null;
  replacedBy: string | null;
};

export async function loadPayPage(id: string): Promise<PayPage | null> {
  const [r] = await db()`SELECT id, status, amount_cents, qr_code, qr_code_base64, expires_at, customer, granted_at, revoked_at
    FROM payments WHERE id = ${id} AND customer IS NOT NULL`;
  if (!r) return null;
  const c = (r.customer || {}) as Record<string, string>;
  const expiresAt = r.expires_at ? new Date(String(r.expires_at)).toISOString() : null;
  const status = r.revoked_at
    ? "cancelled"
    : r.granted_at
      ? "approved"
      : (clientStatus(String(r.status), expiresAt) as PayPage["status"]);
  return {
    id: String(r.id),
    status,
    amountCents: Number(r.amount_cents),
    description: c.description || "CurriculosPRO",
    firstName: (c.name || "").trim().split(/\s+/)[0] || "",
    qrCode: r.qr_code ? String(r.qr_code) : null,
    qrCodeBase64: r.qr_code_base64 ? String(r.qr_code_base64) : null,
    expiresAt,
    replacedBy: c.replacedBy || null,
  };
}
