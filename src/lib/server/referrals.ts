import { randomInt } from "node:crypto";
import { db } from "@/lib/server/db";
import { REFERRED_BONUS_DAYS, REFERRER_BONUS_DAYS } from "@/lib/billing";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sem 0/O, 1/I/L

function newCode() {
  return Array.from({ length: 7 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
}

/** Código de indicação da conta (criado na primeira vez). */
export async function ensureReferralCode(userId: string): Promise<string> {
  const sql = db();
  const [row] = await sql`SELECT referral_code FROM app_users WHERE id = ${userId}`;
  if (row?.referral_code) return String(row.referral_code);
  for (let i = 0; i < 5; i++) {
    try {
      const [u] = await sql`UPDATE app_users SET referral_code = COALESCE(referral_code, ${newCode()})
        WHERE id = ${userId} RETURNING referral_code`;
      if (u?.referral_code) return String(u.referral_code);
    } catch (error) {
      if ((error as { code?: string }).code !== "23505") throw error;
    }
  }
  throw new Error("Não foi possível criar o código de indicação.");
}

export async function referralStats(userId: string) {
  const sql = db();
  const [r] = await sql`SELECT count(*) FILTER (WHERE revoked_at IS NULL)::int AS friends,
      COALESCE(sum(referrer_days) FILTER (WHERE revoked_at IS NULL), 0)::int AS days
    FROM referral_rewards WHERE referrer_id = ${userId}`;
  const [p] = await sql`SELECT count(*)::int AS pending FROM app_users u
    WHERE u.referred_by = ${userId} AND NOT EXISTS (SELECT 1 FROM referral_rewards r WHERE r.referred_id = u.id)`;
  return {
    friends: Number(r?.friends || 0),
    daysEarned: Number(r?.days || 0),
    pending: Number(p?.pending || 0),
  };
}

/**
 * Liga a conta a quem indicou. Só vale para quem ainda não comprou nada,
 * não foi indicado antes e não está usando o próprio código.
 */
export async function attachReferral(userId: string, code: string) {
  const sql = db();
  const rows = await sql`UPDATE app_users AS me SET referred_by = ref.id, referred_at = now()
    FROM app_users AS ref
    WHERE me.id = ${userId} AND ref.referral_code = ${code} AND ref.id <> me.id
      AND lower(split_part(ref.email, '#', 1)) <> lower(split_part(me.email, '#', 1))
      AND me.referred_by IS NULL
      AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.user_id = me.id AND p.granted_at IS NOT NULL)
    RETURNING ref.id`;
  return rows.length > 0;
}

/** Quem foi indicado e ainda não fez a primeira compra recebe dias extras ao pagar. */
export async function pendingReferralBonus(userId: string) {
  const sql = db();
  const [row] = await sql`SELECT 1 AS ok FROM app_users u WHERE u.id = ${userId} AND u.referred_by IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM referral_rewards r WHERE r.referred_id = u.id)
    AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.user_id = u.id AND p.granted_at IS NOT NULL)`;
  return !!row;
}

/**
 * Chamado depois de liberar um pagamento. Na primeira compra de quem foi indicado,
 * soma dias para os dois lados (uma única vez por pessoa indicada).
 */
export async function rewardReferral(paymentId: string) {
  const sql = db();
  const rows =
    await sql`INSERT INTO referral_rewards (referrer_id, referred_id, payment_id, referrer_days, referred_days)
    SELECT u.referred_by, u.id, p.id, ${REFERRER_BONUS_DAYS}, ${REFERRED_BONUS_DAYS}
    FROM payments p JOIN app_users u ON u.id = p.user_id
    WHERE p.id = ${paymentId} AND p.granted_at IS NOT NULL AND p.revoked_at IS NULL AND u.referred_by IS NOT NULL
      AND (SELECT count(*) FROM payments q WHERE q.user_id = u.id AND q.granted_at IS NOT NULL) = 1
    ON CONFLICT (referred_id) DO NOTHING
    RETURNING referrer_id, referred_id`;
  if (!rows.length) return null;
  const { referrer_id, referred_id } = rows[0] as { referrer_id: string; referred_id: string };
  await sql`UPDATE app_users SET access_until = access_until + make_interval(days => ${REFERRED_BONUS_DAYS}), updated_at = now()
    WHERE id = ${referred_id}`;
  const [ref] = await sql`UPDATE app_users
    SET access_until = GREATEST(COALESCE(access_until, now()), now()) + make_interval(days => ${REFERRER_BONUS_DAYS}), updated_at = now()
    WHERE id = ${referrer_id} RETURNING email, display_name, access_until, email_opt_out`;
  return {
    referrerEmail: String(ref?.email || ""),
    referrerName: ref?.display_name ? String(ref.display_name) : null,
    referrerAccessUntil: ref?.access_until ? new Date(String(ref.access_until)).toISOString() : null,
  };
}

/** Estorno da compra que gerou a recompensa: retira os dias extras dos dois lados. */
export async function revokeReferralReward(paymentId: string) {
  const sql = db();
  const rows = await sql`UPDATE referral_rewards SET revoked_at = now()
    WHERE payment_id = ${paymentId} AND revoked_at IS NULL RETURNING referrer_id, referred_id, referrer_days, referred_days`;
  for (const r of rows) {
    await sql`UPDATE app_users SET access_until = access_until - make_interval(days => ${Number(r.referred_days)}) WHERE id = ${String(r.referred_id)}`;
    await sql`UPDATE app_users SET access_until = access_until - make_interval(days => ${Number(r.referrer_days)}) WHERE id = ${String(r.referrer_id)}`;
  }
}
