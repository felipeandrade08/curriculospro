import { deliveredResume } from "@/lib/server/service";
import { getServerSession } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Currículo entregue pela equipe, para abrir no editor do cliente. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession().catch(() => null);
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return Response.json({ error: "not_found" }, { status: 404 });
  const resume = await deliveredResume(session.userId, id).catch(() => null);
  if (!resume) return Response.json({ error: "not_found" }, { status: 404 });
  return Response.json({ resume });
}
