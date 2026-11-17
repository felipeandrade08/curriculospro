import { fileSlug, loadDelivery, verifyDeliveryToken } from "@/lib/server/delivery";
import { readFile } from "@/lib/server/service-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const check = verifyDeliveryToken(token);
  if (!("id" in check)) return new Response("Link inválido ou expirado", { status: 404 });
  const delivery = await loadDelivery(check.id).catch(() => null);
  if (!delivery?.pdf) return new Response("PDF não encontrado", { status: 404 });
  const file = await readFile(delivery.pdf.id);
  if (!file) return new Response("PDF não encontrado", { status: 404 });
  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Curriculo-${fileSlug(delivery.name || delivery.resume.cv.name)}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
      "Content-Security-Policy": "sandbox",
    },
  });
}
