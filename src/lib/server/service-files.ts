// Anexos do "Fazemos para você": guardados no banco, vistos só pelo dono do pedido e pela equipe.
import { db } from "@/lib/server/db";

export const MAX_FILE_BYTES = 4 * 1024 * 1024;
export const MAX_FILES_PER_REQUEST = 3;

const TYPES: Record<string, (b: Uint8Array) => boolean> = {
  "application/pdf": (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (b) => b[0] === 0x50 && b[1] === 0x4b,
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8,
  "image/png": (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  "image/webp": (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45,
};

/** Confere o tipo pelo conteúdo do arquivo, não só pelo nome. */
export function detectType(bytes: Uint8Array, declared: string): string | null {
  if (TYPES[declared]?.(bytes)) return declared;
  for (const [type, test] of Object.entries(TYPES)) if (test(bytes)) return type;
  return null;
}

export const safeName = (raw: string) =>
  (raw || "arquivo")
    .normalize("NFC")
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "")
    .trim()
    .slice(0, 120) || "arquivo";

export async function addFile(input: {
  requestId: string;
  userId: string;
  filename: string;
  contentType: string;
  bytes: Uint8Array;
}): Promise<string | null> {
  const sql = db();
  const [req] = await sql`SELECT status FROM service_requests WHERE id = ${input.requestId} AND user_id = ${input.userId}`;
  if (!req) return "Pedido não encontrado.";
  if (req.status !== "new" && req.status !== "in_progress") return "Este pedido já foi encerrado.";
  const [c] = await sql`SELECT count(*)::int AS n FROM service_files WHERE request_id = ${input.requestId}`;
  if (Number(c?.n || 0) >= MAX_FILES_PER_REQUEST) return `Envie no máximo ${MAX_FILES_PER_REQUEST} arquivos por pedido.`;
  const hex = "\\x" + Buffer.from(input.bytes).toString("hex");
  await sql`INSERT INTO service_files (request_id, user_id, filename, content_type, size_bytes, data)
    VALUES (${input.requestId}, ${input.userId}, ${input.filename}, ${input.contentType}, ${input.bytes.byteLength}, ${hex}::bytea)`;
  return null;
}

export type FileMeta = { id: string; requestId: string; filename: string; contentType: string; size: number };

export async function filesFor(requestIds: string[]): Promise<FileMeta[]> {
  if (!requestIds.length) return [];
  try {
    const rows = await db()`SELECT id, request_id, filename, content_type, size_bytes FROM service_files
      WHERE request_id = ANY(${requestIds.map(Number)}::bigint[]) ORDER BY id`;
    return rows.map((r) => ({
      id: String(r.id),
      requestId: String(r.request_id),
      filename: String(r.filename),
      contentType: String(r.content_type),
      size: Number(r.size_bytes),
    }));
  } catch {
    return [];
  }
}

export async function readFile(fileId: string) {
  const [r] = await db()`SELECT filename, content_type, encode(data, 'base64') AS b64 FROM service_files WHERE id = ${fileId}`;
  if (!r) return null;
  return { filename: String(r.filename), contentType: String(r.content_type), bytes: Buffer.from(String(r.b64), "base64") };
}

/** Apaga anexos de pedidos encerrados há mais de 60 dias. */
export async function purgeOldFiles() {
  try {
    const rows = await db()`DELETE FROM service_files f USING service_requests s
      WHERE s.id = f.request_id AND s.status IN ('delivered', 'cancelled')
        AND COALESCE(s.delivered_at, s.updated_at) < now() - interval '60 days'
      RETURNING f.id`;
    return rows.length;
  } catch {
    return 0;
  }
}
