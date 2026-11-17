import { db } from "@/lib/server/db";
import type { CheckoutPix } from "@/lib/billing";
import type { MercadoPagoPayment } from "@/lib/server/mercadopago";
import type { SaleSource } from "@/lib/server/sales-source";
import { afterPaymentGranted, afterPaymentRevoked } from "@/lib/server/after-payment";

export type PaymentRow = {
  id: string;
  /** Vazio em venda avulsa feita pelo painel (sem conta ligada). */
  user_id: string | null;
  status: string;
  amount_cents: number;
  access_days: number;
  qr_code: string | null;
  qr_code_base64: string | null;
  ticket_url: string | null;
  expires_at: string | null;
  granted_at: string | null;
  plan?: string | null;
  coupon_code?: string | null;
};

const iso = (value: unknown) => (value ? new Date(String(value)).toISOString() : null);

export const PANEL_REFERENCE = "painel";

export async function insertPayment(row: {
  id: string;
  userId: string | null;
  status: string;
  statusDetail: string | null;
  amountCents: number;
  accessDays: number;
  qrCode: string | null;
  qrCodeBase64: string | null;
  ticketUrl: string | null;
  expiresAt: Date | null;
  method?: "pix" | "card";
  plan?: string;
  couponCode?: string | null;
  originalCents?: number;
  source?: SaleSource | null;
  customer?: Record<string, string> | null;
}) {
  const sql = db();
  await sql`INSERT INTO payments(id,user_id,status,status_detail,amount_cents,access_days,qr_code,qr_code_base64,ticket_url,expires_at,method,plan,coupon_code,original_cents,source,customer)
    VALUES(${row.id},${row.userId},${row.status},${row.statusDetail},${row.amountCents},${row.accessDays},${row.qrCode},${row.qrCodeBase64},${row.ticketUrl},${row.expiresAt ? row.expiresAt.toISOString() : null},${row.method || "pix"},${row.plan || "semana"},${row.couponCode || null},${row.originalCents ?? row.amountCents},${row.source ? JSON.stringify(row.source) : null}::jsonb,${row.customer ? JSON.stringify(row.customer) : null}::jsonb)
    ON CONFLICT (id) DO NOTHING`;
}

export async function findPayment(id: string) {
  const sql = db();
  const rows =
    (await sql`SELECT id,user_id,status,amount_cents,access_days,qr_code,qr_code_base64,ticket_url,expires_at,granted_at,plan,coupon_code
    FROM payments WHERE id=${id}`) as PaymentRow[];
  return rows[0] || null;
}

/** Um Pix ainda válido do mesmo usuário é reaproveitado para não gerar cobranças duplicadas. */
export async function findReusablePending(
  userId: string,
  amountCents: number,
  accessDays: number,
  couponCode: string | null,
) {
  const sql = db();
  const rows =
    (await sql`SELECT id,user_id,status,amount_cents,access_days,qr_code,qr_code_base64,ticket_url,expires_at,granted_at,plan,coupon_code
    FROM payments
    WHERE user_id=${userId} AND status='pending' AND expires_at > now() + interval '3 minutes' AND qr_code IS NOT NULL
      AND amount_cents=${amountCents} AND access_days=${accessDays} AND coupon_code IS NOT DISTINCT FROM ${couponCode}
    ORDER BY created_at DESC LIMIT 1`) as PaymentRow[];
  return rows[0] || null;
}

export async function countRecentPayments(userId: string) {
  const sql = db();
  const rows =
    await sql`SELECT count(*)::int AS total FROM payments WHERE user_id=${userId} AND created_at > now() - interval '1 day'`;
  return Number(rows[0]?.total || 0);
}

/** Upgrade para o Kit: só para quem tem acesso ativo e ainda não tem o Kit. */
export async function canUpgrade(userId: string) {
  try {
    const rows = await db()`SELECT 1 FROM app_users WHERE id=${userId} AND access_until > now()
      AND (kit_until IS NULL OR kit_until <= now())`;
    return rows.length > 0;
  } catch {
    return false;
  }
}

/** Até quando a pessoa tem o Kit Emprego (null se nunca teve ou se o banco ainda não foi migrado). */
export async function getKitUntil(userId: string) {
  try {
    const rows = await db()`SELECT kit_until FROM app_users WHERE id=${userId}`;
    return iso(rows[0]?.kit_until);
  } catch {
    return null;
  }
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
      RETURNING user_id, access_days, plan
    )
    UPDATE app_users
    SET access_until = GREATEST(COALESCE(app_users.access_until, now()), now()) + make_interval(days => p.access_days),
        kit_until = CASE WHEN p.plan IN ('mes', 'upgrade')
          THEN GREATEST(COALESCE(app_users.access_until, now()), now()) + make_interval(days => p.access_days)
          ELSE app_users.kit_until END,
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
      RETURNING id, user_id, access_days, plan
    )
    UPDATE app_users
    SET access_until = app_users.access_until - make_interval(days => p.access_days),
        -- Estorno do Kit: sem outra compra do Kit válida, o Kit acaba; com outra, perde só os dias deste pagamento.
        kit_until = CASE
          WHEN p.plan IN ('mes', 'upgrade') THEN CASE
            WHEN EXISTS (SELECT 1 FROM payments q WHERE q.user_id = p.user_id AND q.id <> p.id AND q.plan IN ('mes', 'upgrade')
                         AND q.granted_at IS NOT NULL AND q.revoked_at IS NULL)
            THEN app_users.kit_until - make_interval(days => p.access_days)
            ELSE NULL END
          WHEN app_users.kit_until IS NULL THEN NULL
          ELSE LEAST(app_users.kit_until, app_users.access_until - make_interval(days => p.access_days)) END,
        updated_at = now()
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
  // Venda avulsa do painel usa "painel" como referência; as demais, o id da conta.
  const sameOwner = String(payment.external_reference || "") === (row.user_id ?? PANEL_REFERENCE);
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
    plan: row.plan === "mes" || row.plan === "upgrade" ? row.plan : "semana",
    couponCode: row.coupon_code ?? null,
  };
}

type IntentRow = {
  id: string;
  user_id: string;
  plan: string;
  amount_cents: number;
  original_cents: number;
  access_days: number;
  coupon_code: string | null;
  source?: SaleSource | null;
};

export async function createCheckoutIntent(i: Omit<IntentRow, "id">) {
  const sql = db();
  const id = crypto.randomUUID();
  await sql`INSERT INTO checkout_intents(id,user_id,plan,amount_cents,original_cents,access_days,coupon_code,source)
    VALUES(${id},${i.user_id},${i.plan},${i.amount_cents},${i.original_cents},${i.access_days},${i.coupon_code},${i.source ? JSON.stringify(i.source) : null}::jsonb)`;
  return id;
}

export async function setIntentPreference(id: string, preferenceId: string) {
  const sql = db();
  await sql`UPDATE checkout_intents SET preference_id=${preferenceId} WHERE id=${id}`;
}

/**
 * Pagamentos do Checkout Pro (cartão) só ganham ID depois que a pessoa paga.
 * Aqui o pagamento consultado na API é ligado à intenção de compra criada no site.
 */
export async function adoptCheckoutProPayment(payment: MercadoPagoPayment): Promise<PaymentRow | null> {
  const intentId = payment.metadata?.intent_id;
  if (!intentId || typeof intentId !== "string") return null;
  const sql = db();
  const intent = ((await sql`SELECT id,user_id,plan,amount_cents,original_cents,access_days,coupon_code,source
    FROM checkout_intents WHERE id=${intentId}`) as IntentRow[])[0];
  if (!intent || String(payment.external_reference || "") !== intent.user_id) return null;
  await insertPayment({
    id: String(payment.id),
    userId: intent.user_id,
    status: payment.status,
    statusDetail: payment.status_detail || null,
    amountCents: Number(intent.amount_cents),
    accessDays: Number(intent.access_days),
    qrCode: null,
    qrCodeBase64: null,
    ticketUrl: null,
    expiresAt: null,
    method: payment.payment_type_id === "bank_transfer" ? "pix" : "card",
    plan: intent.plan,
    couponCode: intent.coupon_code,
    originalCents: Number(intent.original_cents),
    source: intent.source || null,
  });
  await sql`UPDATE checkout_intents SET payment_id=${String(payment.id)} WHERE id=${intent.id}`;
  return findPayment(String(payment.id));
}
