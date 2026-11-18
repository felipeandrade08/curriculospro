import { hasActiveAccess } from "@/lib/billing";
import { isResumeDocument, type ResumeSection } from "@/lib/resume";
import { renderBaseUrl, renderResumePdf } from "@/lib/server/pdf";
import { isSameOrigin } from "@/lib/server/request";
import { getServerSession } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Cada PDF abre um Chrome no servidor: limite por pessoa para evitar abuso (por instância).
const recent = new Map<string, number[]>();
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 20;
function tooMany(userId: string) {
  const now = Date.now();
  const list = (recent.get(userId) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) return true;
  list.push(now);
  recent.set(userId, list);
  if (recent.size > 5000) for (const [k, v] of recent) if (!v.some((t) => now - t < WINDOW_MS)) recent.delete(k);
  return false;
}

const SECTIONS = new Set(["summary", "experiences", "education", "skills", "languages", "courses"]);
const safe = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "curriculo";

/** Gera o PDF do currículo enviado, já pronto para baixar. Exige acesso ativo, como o Word. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 3_000_000)
    return Response.json({ error: "too_large" }, { status: 413 });
  const session = await getServerSession().catch(() => null);
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (session.plan !== "pro" && !hasActiveAccess(session.accessUntil))
    return Response.json({ error: "payment_required" }, { status: 402 });
  if (tooMany(session.userId))
    return Response.json({ error: "rate_limited", message: "Muitos PDFs seguidos. Espere alguns minutos." }, { status: 429 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!isResumeDocument(body)) return Response.json({ error: "invalid_resume" }, { status: 400 });
  const raw = body as unknown as { sections?: unknown; scale?: unknown };
  const sections = Array.isArray(raw.sections)
    ? (raw.sections.filter((s) => typeof s === "string" && SECTIONS.has(s)) as ResumeSection[])
    : undefined;
  const scale =
    typeof raw.scale === "number" && raw.scale >= 0.7 && raw.scale <= 1 ? raw.scale : raw.scale === "auto" ? "auto" : 1;
  try {
    const pdf = await renderResumePdf(renderBaseUrl(request), body, { sections, scale });
    const name = "Curriculo-" + safe(body.cv.name || body.title) + ".pdf";
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF falhou", error);
    return Response.json({ error: "pdf_failed" }, { status: 500 });
  }
}
