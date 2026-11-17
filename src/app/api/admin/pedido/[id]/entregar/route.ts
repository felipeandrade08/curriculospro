import { checkAdmin } from "@/lib/server/admin";
import { deliverFromForm } from "@/lib/server/deliver";
import { isSameOrigin } from "@/lib/server/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Entrega pelo editor: currículo aberto + PDF + recado. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  const check = await checkAdmin();
  if (!check.ok) return Response.json({ error: "forbidden" }, { status: 403 });
  const { id } = await params;
  if (!/^\d{1,18}$/.test(id)) return Response.json({ error: "invalid" }, { status: 400 });
  if (Number(request.headers.get("content-length") || 0) > 5_000_000)
    return Response.json({ ok: false, message: "Envio grande demais (máximo 4 MB de PDF)." }, { status: 413 });
  const form = await request.formData().catch(() => null);
  if (!form) return Response.json({ ok: false, message: "Envio inválido." }, { status: 400 });
  form.set("id", id);
  const result = await deliverFromForm(form, check.session.userId);
  return Response.json(result, { status: result.ok ? 200 : 400 });
}
