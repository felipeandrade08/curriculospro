// Cupons de desconto: validação no servidor (o navegador nunca decide o preço).
import { db } from "@/lib/server/db";
import { ACCESS_PLANS, discounted, formatBRL, type AccessPlanId, type CouponQuote } from "@/lib/billing";

export type CouponRow = {
  code: string;
  description: string | null;
  percent_off: number | null;
  amount_off_cents: number | null;
  plan: AccessPlanId | null;
  max_uses: number | null;
  first_purchase_only: boolean;
  expires_at: string | null;
  active: boolean;
  created_at: string;
  uses?: number;
};

export const normalizeCode = (value: unknown) =>
  typeof value === "string" ? value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20) : "";

export const couponLabel = (c: Pick<CouponRow, "percent_off" | "amount_off_cents">) =>
  c.percent_off ? `${c.percent_off}% de desconto` : `${formatBRL(c.amount_off_cents || 0)} de desconto`;

type QuoteResult = { ok: true; quote: CouponQuote } | { ok: false; message: string };

/** Confere se o cupom vale para este plano e esta pessoa e calcula o preço final. */
export async function quoteCoupon(rawCode: unknown, plan: AccessPlanId, userId: string | null): Promise<QuoteResult> {
  const code = normalizeCode(rawCode);
  if (code.length < 3) return { ok: false, message: "Digite o código do cupom." };
  if (plan === "upgrade") return { ok: false, message: "Cupons não valem para o upgrade, que já sai pela diferença." };
  const sql = db();
  const rows = (await sql`SELECT c.*, (
      SELECT count(*)::int FROM payments p WHERE p.coupon_code=c.code AND p.granted_at IS NOT NULL AND p.revoked_at IS NULL
    ) AS uses
    FROM coupons c WHERE c.code=${code}`) as CouponRow[];
  const c = rows[0];
  if (!c || !c.active) return { ok: false, message: "Cupom não encontrado." };
  if (c.expires_at && new Date(c.expires_at).getTime() < Date.now())
    return { ok: false, message: "Este cupom expirou." };
  if (c.plan && c.plan !== plan)
    return {
      ok: false,
      message: `Este cupom vale só para o pacote ${ACCESS_PLANS[c.plan].title} (${ACCESS_PLANS[c.plan].name}).`,
    };
  if (c.max_uses && Number(c.uses || 0) >= c.max_uses)
    return { ok: false, message: "Este cupom já atingiu o limite de usos." };
  if (userId) {
    const used =
      await sql`SELECT 1 FROM payments WHERE user_id=${userId} AND coupon_code=${code} AND granted_at IS NOT NULL LIMIT 1`;
    if (used.length) return { ok: false, message: "Você já usou este cupom." };
    if (c.first_purchase_only) {
      const bought = await sql`SELECT 1 FROM payments WHERE user_id=${userId} AND granted_at IS NOT NULL LIMIT 1`;
      if (bought.length) return { ok: false, message: "Este cupom vale só para a primeira compra." };
    }
  }
  const original = ACCESS_PLANS[plan].cents;
  return {
    ok: true,
    quote: {
      code,
      plan,
      originalCents: original,
      finalCents: discounted(original, { percentOff: c.percent_off, amountOffCents: c.amount_off_cents }),
      label: couponLabel(c),
    },
  };
}

/** Preço final do plano, com ou sem cupom. Cupom inválido vira erro para a pessoa corrigir. */
export async function priceFor(plan: AccessPlanId, rawCode: unknown, userId: string) {
  const original = ACCESS_PLANS[plan].cents;
  if (!normalizeCode(rawCode)) return { ok: true as const, amountCents: original, originalCents: original, couponCode: null };
  const q = await quoteCoupon(rawCode, plan, userId);
  if (!q.ok) return q;
  return { ok: true as const, amountCents: q.quote.finalCents, originalCents: original, couponCode: q.quote.code };
}

export async function listCoupons() {
  const sql = db();
  return (await sql`SELECT c.*, (
      SELECT count(*)::int FROM payments p WHERE p.coupon_code=c.code AND p.granted_at IS NOT NULL AND p.revoked_at IS NULL
    ) AS uses
    FROM coupons c ORDER BY c.active DESC, c.created_at DESC`) as CouponRow[];
}
