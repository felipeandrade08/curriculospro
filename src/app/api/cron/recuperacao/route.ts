import { cronAuthorized as authorized } from "@/lib/server/cron";
import { sendPixRecoveries } from "@/lib/server/recovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Pode ser chamada de hora em hora por um agendador externo (ex.: cron-job.org) com o CRON_SECRET. */
export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json({ ok: true, ...(await sendPixRecoveries()) });
}
