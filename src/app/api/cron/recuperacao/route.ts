import { cronAuthorized as authorized } from "@/lib/server/cron";
import { sendPixRecoveries, sendSignupNudges } from "@/lib/server/recovery";
import { syncPanelCharges } from "@/lib/server/panel-orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Pode ser chamada de hora em hora por um agendador externo (ex.: cron-job.org) com o CRON_SECRET. */
export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const panelPix = await syncPanelCharges().catch(() => null);
  const recovery = await sendPixRecoveries();
  const nudges = await sendSignupNudges().catch((error) => {
    console.error("Lembrete de cadastro falhou", error);
    return { sent: 0, failed: -1 };
  });
  return Response.json({ ok: true, ...recovery, nudges, panelPix });
}
