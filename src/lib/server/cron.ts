import { timingSafeEqual } from "node:crypto";

/** Chamadas agendadas (Vercel Cron ou agendador externo) enviam "Authorization: Bearer CRON_SECRET". */
export function cronAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") || "");
  const expected = Buffer.from("Bearer " + secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
