import { fileSlug, loadDelivery, verifyDeliveryToken } from "@/lib/server/delivery";
import { readFile, saveDeliveryPdf } from "@/lib/server/service-files";
import { renderBaseUrl, renderResumePdf } from "@/lib/server/pdf";
import { db } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const check = verifyDeliveryToken(token);
  if (!("id" in check)) return new Response("Link inválido ou expirado", { status: 404 });
  const delivery = await loadDelivery(check.id).catch(() => null);
  if (!delivery) return new Response("Link inválido ou expirado", { status: 404 });
  let bytes: Uint8Array | null = null;
  if (delivery.pdf) {
    const file = await readFile(delivery.pdf.id);
    if (file) bytes = new Uint8Array(file.bytes);
  }
  // Entrega sem PDF guardado (pedidos antigos): gera agora e guarda para as próximas vezes.
  if (!bytes) {
    try {
      bytes = await renderResumePdf(renderBaseUrl(_request), delivery.resume, { scale: "auto" });
      const [owner] = await db()`SELECT user_id FROM service_requests WHERE id = ${check.id}`;
      if (owner)
        await saveDeliveryPdf(
          check.id,
          String(owner.user_id),
          "Curriculo-" + fileSlug(delivery.name || delivery.resume.cv.name) + ".pdf",
          bytes,
        ).catch(() => {});
    } catch (error) {
      console.error("PDF da entrega falhou", check.id, error);
      return new Response("Não foi possível gerar o PDF agora. Tente o Word ou fale com a gente.", { status: 503 });
    }
  }
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Curriculo-${fileSlug(delivery.name || delivery.resume.cv.name)}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
      "Content-Security-Policy": "sandbox",
    },
  });
}
