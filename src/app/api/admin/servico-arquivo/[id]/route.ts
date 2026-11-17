import { checkAdmin } from "@/lib/server/admin";
import { readFile } from "@/lib/server/service-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Baixa um anexo de pedido. Só para a equipe. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await checkAdmin();
  if (!check.ok) return new Response("Não autorizado", { status: 403 });
  const { id } = await params;
  if (!/^\d{1,18}$/.test(id)) return new Response("Inválido", { status: 400 });
  const file = await readFile(id);
  if (!file) return new Response("Arquivo não encontrado", { status: 404 });
  const ascii = file.filename.normalize("NFD").replace(/[^\x20-\x7e]/g, "").replace(/"/g, "") || "arquivo";
  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "content-type": file.contentType,
      "content-disposition": `inline; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
      "content-security-policy": "sandbox",
    },
  });
}
