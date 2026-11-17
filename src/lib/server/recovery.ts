// Recuperação de vendas: avisa quem gerou o Pix e não pagou e quem criou conta e não comprou.
import { db } from "@/lib/server/db";
import { emailConfigured, pixRecoveryEmail, sendEmail, signupNudgeEmail } from "@/lib/server/email";
import { quoteCoupon } from "@/lib/server/coupons";
import { formatBRL } from "@/lib/billing";

/**
 * Um e-mail por pessoa: Pix criado entre 40 minutos e 2 dias atrás, não pago,
 * sem nenhuma compra aprovada depois dele e sem outro lembrete nos últimos 7 dias.
 */
export async function sendPixRecoveries(limit = 100) {
  if (!emailConfigured()) return { sent: 0, failed: 0, note: "email_not_configured" };
  const sql = db();
  const rows = await sql`UPDATE payments SET recovery_sent_at = now()
    WHERE id IN (
      SELECT DISTINCT ON (p.user_id) p.id
      FROM payments p JOIN app_users u ON u.id = p.user_id
      WHERE p.granted_at IS NULL AND p.recovery_sent_at IS NULL AND p.method = 'pix'
        AND p.created_at < now() - interval '40 minutes' AND p.created_at > now() - interval '2 days'
        AND NOT u.email_opt_out AND u.email NOT LIKE '%#%'
        AND (u.access_until IS NULL OR u.access_until < now())
        AND NOT EXISTS (SELECT 1 FROM payments q WHERE q.user_id = p.user_id AND q.granted_at IS NOT NULL AND q.created_at >= p.created_at)
        AND NOT EXISTS (SELECT 1 FROM payments r WHERE r.user_id = p.user_id AND r.recovery_sent_at > now() - interval '7 days')
      ORDER BY p.user_id, p.created_at DESC
      LIMIT ${limit}
    )
    RETURNING id, user_id`;
  let sent = 0,
    failed = 0;
  for (const r of rows) {
    try {
      const [u] = await sql`SELECT email, display_name FROM app_users WHERE id = ${String(r.user_id)}`;
      const mail = pixRecoveryEmail({
        name: u?.display_name ? String(u.display_name) : null,
        userId: String(r.user_id),
      });
      await sendEmail({ to: String(u.email), ...mail, idempotencyKey: "recovery-" + String(r.id) });
      sent++;
    } catch (error) {
      failed++;
      console.error("Recuperação de Pix falhou", r.id, error);
      await sql`UPDATE payments SET recovery_sent_at = NULL WHERE id = ${String(r.id)}`;
    }
  }
  return { sent, failed };
}

/**
 * Lembrete único para quem criou conta há mais de 3 horas (e até 10 dias) e nunca comprou.
 * Inclui o cupom NUDGE_COUPON (padrão PRIMEIRO) se ele estiver ativo.
 */
export async function sendSignupNudges(limit = 100) {
  if (!emailConfigured()) return { sent: 0, failed: 0, note: "email_not_configured" };
  const sql = db();
  const rows = await sql`UPDATE app_users SET nudge_sent_at = now()
    WHERE id IN (
      SELECT u.id FROM app_users u
      WHERE u.nudge_sent_at IS NULL AND NOT u.email_opt_out AND u.email NOT LIKE '%#%'
        AND u.created_at < now() - interval '3 hours' AND u.created_at > now() - interval '10 days'
        AND (u.access_until IS NULL OR u.access_until < now())
        AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.user_id = u.id AND p.granted_at IS NOT NULL)
        AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.user_id = u.id AND p.created_at > now() - interval '2 days')
      ORDER BY u.created_at
      LIMIT ${limit}
    )
    RETURNING id, email, display_name`;
  if (!rows.length) return { sent: 0, failed: 0 };
  const code = (process.env.NUDGE_COUPON || "PRIMEIRO").toUpperCase();
  const quote = await quoteCoupon(code, "semana", null).catch(() => null);
  const coupon = quote?.ok ? { code: quote.quote.code, finalLabel: formatBRL(quote.quote.finalCents) } : null;
  let sent = 0,
    failed = 0;
  for (const u of rows) {
    try {
      const mail = signupNudgeEmail({
        name: u.display_name ? String(u.display_name) : null,
        userId: String(u.id),
        coupon,
      });
      await sendEmail({ to: String(u.email), ...mail, idempotencyKey: "nudge-" + String(u.id) });
      sent++;
    } catch (error) {
      failed++;
      console.error("Lembrete de cadastro falhou", u.id, error);
      await sql`UPDATE app_users SET nudge_sent_at = NULL WHERE id = ${String(u.id)}`;
    }
  }
  return { sent, failed };
}
