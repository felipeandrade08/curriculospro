import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/server/db";
import { emailConfigured, expiryReminderEmail, sendEmail } from "@/lib/server/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") || "");
  const expected = Buffer.from("Bearer " + secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Rodado uma vez por dia pela Vercel (vercel.json). Avisa quem tem o acesso
 * terminando nas próximas ~36 horas, uma única vez por período de acesso.
 */
export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!emailConfigured()) return Response.json({ ok: true, sent: 0, note: "email_not_configured" });
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
  return Response.json({ ok: true, sent, failed: failed.length });
}
