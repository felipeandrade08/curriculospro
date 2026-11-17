import { defaultOrder } from "@/lib/resume";
import { resumeToDocx } from "@/lib/server/docx";
import { fileSlug, loadDelivery, verifyDeliveryToken } from "@/lib/server/delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const check = verifyDeliveryToken(token);
  if (!("id" in check)) return new Response("Link inválido ou expirado", { status: 404 });
  const delivery = await loadDelivery(check.id).catch(() => null);
  if (!delivery) return new Response("Currículo não encontrado", { status: 404 });
  const r = delivery.resume;
  const buffer = await resumeToDocx(r.cv, {
    accent: r.accent,
    order: r.sectionOrder.length ? r.sectionOrder : defaultOrder,
    hidden: r.hidden,
  });
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="Curriculo-${fileSlug(delivery.name || r.cv.name)}.docx"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
