import { cronAuthorized as authorized } from "@/lib/server/cron";
import { db } from "@/lib/server/db";
import { emailConfigured, expiryReminderEmail, sendEmail } from "@/lib/server/email";
import { sendPixRecoveries, sendReviewRequests, sendSignupNudges } from "@/lib/server/recovery";
import { purgeOldFiles } from "@/lib/server/service-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Rodado uma vez por dia pela Vercel (vercel.json). Avisa quem tem o acesso
 * terminando nas próximas ~36 horas, uma única vez por período de acesso.
 */
export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "unauthorized" }, { status: 401 });
  // Anexos antigos do "Fazemos para você" são apagados mesmo sem e-mail configurado.
  const purgedFiles = await purgeOldFiles();
  if (!emailConfigured()) return Response.json({ ok: true, sent: 0, purgedFiles, note: "email_not_configured" });
  const sql = db();
  // Marca antes de enviar (reserva), para não repetir se a rotina rodar duas vezes.
  const users = await sql`UPDATE app_users SET expiry_reminder_for = access_until
    WHERE id IN (
      SELECT id FROM app_users
      WHERE access_until > now() + interval '2 hours' AND access_until <= now() + interval '36 hours'
        AND NOT email_opt_out AND email NOT LIKE '%#%'
        AND (expiry_reminder_for IS NULL OR expiry_reminder_for <> access_until)
      LIMIT 200
    )
    RETURNING id, email, display_name, access_until`;
  let sent = 0;
  const failed: string[] = [];
  for (const u of users) {
    try {
      const mail = expiryReminderEmail({
        name: u.display_name ? String(u.display_name) : null,
        accessUntil: new Date(String(u.access_until)).toISOString(),
        userId: String(u.id),
      });
      await sendEmail({ to: String(u.email), ...mail });
      sent++;
    } catch (error) {
      failed.push(String(u.id));
      console.error("Lembrete falhou", u.id, error);
      await sql`UPDATE app_users SET expiry_reminder_for = NULL WHERE id = ${String(u.id)}`;
    }
  }
  const recovery = await sendPixRecoveries().catch((error) => {
    console.error("Recuperação de Pix falhou", error);
    return { sent: 0, failed: -1 };
  });
  const nudges = await sendSignupNudges().catch((error) => {
    console.error("Lembrete de cadastro falhou", error);
    return { sent: 0, failed: -1 };
  });
  const reviews = await sendReviewRequests().catch((error) => {
    console.error("Pedido de avaliação falhou", error);
    return { sent: 0, failed: -1 };
  });
  return Response.json({ ok: true, sent, failed: failed.length, recovery, nudges, reviews, purgedFiles });
}
