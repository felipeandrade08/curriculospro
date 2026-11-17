import { hasActiveAccess } from "@/lib/billing";
import { defaultOrder, isResumeDocument } from "@/lib/resume";
import { resumeToDocx } from "@/lib/server/docx";
import { isSameOrigin } from "@/lib/server/request";
import { getServerSession } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const safe = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "curriculo";

/** Gera o .docx do currículo enviado. Exige conta com acesso ativo, como o PDF. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 3_000_000)
    return Response.json({ error: "too_large" }, { status: 413 });
  const session = await getServerSession().catch(() => null);
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (session.plan !== "pro" && !hasActiveAccess(session.accessUntil))
    return Response.json({ error: "payment_required" }, { status: 402 });
  const body = await request.json().catch(() => null);
  if (!isResumeDocument(body)) return Response.json({ error: "invalid_resume" }, { status: 400 });
  const buffer = await resumeToDocx(body.cv, {
    accent: body.accent,
    order: body.sectionOrder.length ? body.sectionOrder : defaultOrder,
    hidden: body.hidden,
  });
  const name = "Curriculo-" + safe(body.cv.name || body.title) + ".docx";
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
