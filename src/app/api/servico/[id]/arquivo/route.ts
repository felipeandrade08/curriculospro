import { getServerSession } from "@/lib/server/session";
import { isSameOrigin } from "@/lib/server/request";
import { MAX_FILE_BYTES, addFile, detectType, safeName } from "@/lib/server/service-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Recebe um anexo do pedido. Corpo: o arquivo em si; nome no cabeçalho x-file-name. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  const { id } = await params;
  if (!/^\d{1,18}$/.test(id)) return Response.json({ error: "invalid" }, { status: 400 });
  if (Number(request.headers.get("content-length") || 0) > MAX_FILE_BYTES)
    return Response.json({ error: "too_large", message: "O arquivo passa de 4 MB." }, { status: 413 });
  try {
    const session = await getServerSession();
    if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
    const bytes = new Uint8Array(await request.arrayBuffer());
    if (!bytes.byteLength) return Response.json({ error: "empty", message: "Arquivo vazio." }, { status: 400 });
    if (bytes.byteLength > MAX_FILE_BYTES)
      return Response.json({ error: "too_large", message: "O arquivo passa de 4 MB." }, { status: 413 });
    const type = detectType(bytes, request.headers.get("content-type") || "");
    if (!type)
      return Response.json(
        { error: "type", message: "Envie PDF, Word (.docx) ou foto (JPG, PNG)." },
        { status: 415 },
      );
    let name = "arquivo";
    try {
      name = safeName(decodeURIComponent(request.headers.get("x-file-name") || "arquivo"));
    } catch {}
    const problem = await addFile({ requestId: id, userId: session.userId, filename: name, contentType: type, bytes });
    if (problem) return Response.json({ error: "invalid", message: problem }, { status: 400 });
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Anexo do pedido falhou", error);
    return Response.json({ error: "unavailable", message: "Não foi possível enviar o arquivo agora." }, { status: 500 });
  }
}
