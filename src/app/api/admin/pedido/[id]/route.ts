import { checkAdmin } from "@/lib/server/admin";
import { db } from "@/lib/server/db";
import { filesFor } from "@/lib/server/service-files";
import { deliveryUrl } from "@/lib/server/delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Dados de um pedido para a barra da equipe no editor. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await checkAdmin();
  if (!check.ok) return Response.json({ error: "forbidden" }, { status: 403 });
  const { id } = await params;
  if (!/^\d{1,18}$/.test(id)) return Response.json({ error: "invalid" }, { status: 400 });
  const [r] = await db()`SELECT s.id::text, s.status, s.data, s.created_at, s.delivered_at, u.email
    FROM service_requests s JOIN app_users u ON u.id = s.user_id WHERE s.id = ${id}`;
  if (!r) return Response.json({ error: "not_found" }, { status: 404 });
  const files = await filesFor([String(r.id)]);
  const d = (r.data || {}) as Record<string, unknown>;
  return Response.json({
    order: {
      id: String(r.id),
      status: String(r.status),
      email: String(r.email),
      createdAt: new Date(String(r.created_at)).toISOString(),
      name: String(d.name || ""),
      role: String(d.role || ""),
      city: String(d.city || ""),
      whatsapp: String(d.whatsapp || ""),
      notes: String(d.notes || ""),
      sourceText: String(d.sourceText || ""),
      delivery: d.delivery === "whatsapp" ? "whatsapp" : "email",
      link: r.delivered_at ? deliveryUrl(String(r.id), String(r.delivered_at)) : null,
      files: files.map((f) => ({ id: f.id, filename: f.filename, kind: f.kind, size: f.size })),
    },
  });
}
