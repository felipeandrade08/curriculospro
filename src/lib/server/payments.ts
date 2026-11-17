import { db } from "@/lib/server/db";
import type { CheckoutPix } from "@/lib/billing";
import type { MercadoPagoPayment } from "@/lib/server/mercadopago";
import { afterPaymentGranted, afterPaymentRevoked } from "@/lib/server/after-payment";

export type PaymentRow = {
  id: string;
  user_id: string;
  status: string;
  amount_cents: number;
  access_days: number;
  qr_code: string | null;
  qr_code_base64: string | null;
  ticket_url: string | null;
  expires_at: string | null;
  granted_at: string | null;
};

const iso = (value: unknown) => (value ? new Date(String(value)).toISOString() : null);

export async function insertPayment(row: {
  id: string;
  userId: string;
  status: string;
  statusDetail: string | null;
  amountCents: number;
  accessDays: number;
  qrCode: string | null;
  qrCodeBase64: string | null;
  ticketUrl: string | null;
  expiresAt: Date;
}) {
  const sql = db();
  await sql`INSERT INTO payments(id,user_id,status,status_detail,amount_cents,access_days,qr_code,qr_code_base64,ticket_url,expires_at)
    VALUES(${row.id},${row.userId},${row.status},${row.statusDetail},${row.amountCents},${row.accessDays},${row.qrCode},${row.qrCodeBase64},${row.ticketUrl},${row.expiresAt.toISOString()})
`;
}

export async function findPayment(id: string) {
  const sql = db();
  const rows =
    (await sql`SELECT id,user_id,status,amount_cents,access_days,qr_code,qr_code_base64,ticket_url,expires_at,granted_at
    FROM payments WHERE id=${id}`) as PaymentRow[];
  return rows[0] || null;
}

/** Um Pix ainda válido do mesmo usuário é reaproveitado para não gerar cobranças duplicadas. */
export async function findReusablePending(userId: string) {
  const sql = db();
  const rows =
    (await sql`SELECT id,user_id,status,amount_cents,access_days,qr_code,qr_code_base64,ticket_url,expires_at,granted_at
    FROM payments
    WHERE user_id=${userId} AND status='pending' AND expires_at > now() + interval '3 minutes' AND qr_code IS NOT NULL
    ORDER BY created_at DESC LIMIT 1`) as PaymentRow[];
  return rows[0] || null;
}

export async function countRecentPayments(userId: string) {
  const sql = db();
  const rows =
    await sql`SELECT count(*)::int AS total FROM payments WHERE user_id=${userId} AND created_at > now() - interval '1 day'`;
  return Number(rows[0]?.total || 0);
}

export async function getAccessUntil(userId: string) {
  const sql = db();
  const rows = await sql`SELECT access_until FROM app_users WHERE id=${userId}`;
  return iso(rows[0]?.access_until);
}

/**
 * Concede o período de acesso uma única vez por pagamento (idempotente e seguro
 * contra webhook e consulta simultâneos). O tempo é somado a um acesso ainda ativo.
 */
export async function grantAccess(paymentId: string, statusDetail: string | null, approvedAt: string | null) {
  const sql = db();
  const rows = await sql`WITH p AS (
      UPDATE payments
      SET status='approved', status_detail=${statusDetail}, approved_at=COALESCE(${approvedAt}::timestamptz, now()),
          granted_at=now(), updated_at=now()
      WHERE id=${paymentId} AND granted_at IS NULL
      RETURNING user_id, access_days
    )
    UPDATE app_users
    SET access_until = GREATEST(COALESCE(app_users.access_until, now()), now()) + make_interval(days => p.access_days),
        updated_at = now()
    FROM p WHERE app_users.id = p.user_id
    RETURNING app_users.access_until`;
  const granted = rows.length > 0;
  if (granted)
    await sql`UPDATE payments SET access_until_after=${iso(rows[0].access_until)} WHERE id=${paymentId}`;
  return granted;
}

/** Estorno ou contestação: remove os dias concedidos por este pagamento (uma única vez). */
export async function revokeAccess(paymentId: string, status: string, statusDetail: string | null) {
  const sql = db();
  const rows = await sql`WITH p AS (
      UPDATE payments
      SET status=${status}, status_detail=${statusDetail}, revoked_at=now(), updated_at=now()
      WHERE id=${paymentId} AND granted_at IS NOT NULL AND revoked_at IS NULL
      RETURNING user_id, access_days
    )
    UPDATE app_users
    SET access_until = app_users.access_until - make_interval(days => p.access_days), updated_at = now()
    FROM p WHERE app_users.id = p.user_id
    RETURNING app_users.access_until`;
  return rows.length > 0;
}

export type ClientStatus = CheckoutPix["status"];

export function clientStatus(status: string, expiresAt: string | null): ClientStatus {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  const expired = !!expiresAt && new Date(expiresAt).getTime() < Date.now();
  if (status === "cancelled") return expired ? "expired" : "cancelled";
  if (["pending", "in_process", "authorized"].includes(status)) return expired ? "expired" : "pending";
  return "cancelled";
}

/**
 * Aplica no banco o estado oficial informado pelo Mercado Pago.
 * Nunca confie no corpo do webhook: chame com o pagamento consultado na API.
 */
export async function applyProviderPayment(payment: MercadoPagoPayment, row: PaymentRow) {
  const amountCents = Math.round(Number(payment.transaction_amount) * 100);
  const sameOwner = String(payment.external_reference || "") === row.user_id;
  const sameAmount = amountCents === Number(row.amount_cents);
  if (!sameOwner || !sameAmount) {
    console.error("Pagamento divergente ignorado", { id: row.id, sameOwner, sameAmount });
    return { status: clientStatus(row.status, iso(row.expires_at)), granted: false };
  }
  if (payment.status === "refunded" || payment.status === "charged_back") {
    const revoked = await revokeAccess(row.id, payment.status, payment.status_detail || null);
    if (revoked) await afterPaymentRevoked(row.id);
    if (!revoked) {
      // Estornado antes de o acesso ser liberado: só registra o status.
      const sql = db();
      await sql`UPDATE payments SET status=${payment.status}, status_detail=${payment.status_detail || null}, updated_at=now()
        WHERE id=${row.id} AND granted_at IS NULL`;
    }
    return { status: "cancelled" as const, granted: false };
  }
  if (payment.status === "approved") {
    const granted = await grantAccess(row.id, payment.status_detail || null, payment.date_approved || null);
    if (granted) await afterPaymentGranted(row.id);
    return { status: "approved" as const, granted };
  }
  const sql = db();
  await sql`UPDATE payments SET status=${payment.status}, status_detail=${payment.status_detail || null}, updated_at=now()
    WHERE id=${row.id} AND granted_at IS NULL`;
  return { status: clientStatus(payment.status, iso(row.expires_at)), granted: false };
}

export function toCheckout(row: PaymentRow, accessUntil?: string | null): CheckoutPix {
  return {
    paymentId: row.id,
    status: clientStatus(row.status, iso(row.expires_at)),
    qrCode: row.qr_code,
    qrCodeBase64: row.qr_code_base64,
    ticketUrl: row.ticket_url,
    expiresAt: iso(row.expires_at),
    amountCents: Number(row.amount_cents),
    accessUntil: accessUntil ?? null,
  };
}
