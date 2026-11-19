// Serviço "Fazemos para você": pedidos de quem tem acesso ativo, montados pela equipe.
import { randomUUID } from "node:crypto";
import { db } from "@/lib/server/db";
import { isResumeDocument, type ResumeDocument } from "@/lib/resume";
import { deliveryUrl } from "@/lib/server/delivery";

export const SERVICE_HOURS = 24;

export type ServiceInput = {
  name: string;
  whatsapp: string;
  role: string;
  city: string;
  notes: string;
  sourceText: string;
  resume: ResumeDocument | null;
  /** Como o cliente prefere receber: e-mail (com anexos) ou WhatsApp (com link). */
  delivery: "email" | "whatsapp";
};

export type ServiceRequestRow = {
  id: string;
  status: "new" | "in_progress" | "delivered" | "cancelled";
  data: ServiceInput;
  createdAt: string;
  deliveredAt: string | null;
  deliveredResumeId: string | null;
  adminNote: string | null;
  /** Link de download sem login (só para pedidos entregues). */
  downloadUrl: string | null;
};

const text = (v: unknown, max: number) =>
  typeof v === "string"
    ? v
        .replace(/\u0000/g, "")
        .trim()
        .slice(0, max)
    : "";

export function parseServiceInput(body: unknown): ServiceInput | string {
  const b = (body || {}) as Record<string, unknown>;
  const input: ServiceInput = {
    name: text(b.name, 80),
    whatsapp: text(b.whatsapp, 30).replace(/[^\d()+\s-]/g, ""),
    role: text(b.role, 80),
    city: text(b.city, 80),
    notes: text(b.notes, 4000),
    sourceText: text(b.sourceText, 12000),
    resume: isResumeDocument(b.resume) ? (b.resume as ResumeDocument) : null,
    delivery: b.delivery === "whatsapp" ? "whatsapp" : "email",
  };
  if (input.name.length < 3) return "Informe seu nome completo.";
  if (input.whatsapp.replace(/\D/g, "").length < 10)
    return "Informe um WhatsApp com DDD para combinarmos os detalhes.";
  if (input.role.length < 2) return "Diga qual vaga ou cargo você procura.";
  if (!b.hasFiles && !input.resume && input.sourceText.length < 30 && input.notes.length < 30)
    return "Anexe seu currículo antigo, cole o texto dele ou conte um pouco da sua experiência.";
  return input;
}

const toRow = (r: Record<string, unknown>): ServiceRequestRow => ({
  id: String(r.id),
  status: r.status as ServiceRequestRow["status"],
  data: r.data as ServiceInput,
  createdAt: new Date(String(r.created_at)).toISOString(),
  deliveredAt: r.delivered_at ? new Date(String(r.delivered_at)).toISOString() : null,
  deliveredResumeId: r.delivered_resume_id ? String(r.delivered_resume_id) : null,
  adminNote: r.admin_note ? String(r.admin_note) : null,
  downloadUrl:
    r.status === "delivered" && r.delivered_at ? deliveryUrl(String(r.id), String(r.delivered_at)) : null,
});

export async function listMyRequests(userId: string) {
  const rows = await db()`SELECT id, status, data, created_at, delivered_at, delivered_resume_id, admin_note
    FROM service_requests WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 20`;
  return rows.map(toRow);
}

/** Um pedido em aberto por vez e no máximo um por semana. */
export async function canRequest(userId: string) {
  const [r] = await db()`SELECT
      count(*) FILTER (WHERE status IN ('new', 'in_progress'))::int AS open,
      count(*) FILTER (WHERE status <> 'cancelled' AND created_at > now() - interval '7 days')::int AS week
    FROM service_requests WHERE user_id = ${userId}`;
  if (Number(r?.open || 0) > 0)
    return "Você já tem um pedido em andamento. Assim que entregarmos, você pode pedir outro.";
  return null;
}

/**
 * Compra que dá direito a um "Fazemos para você" e ainda não foi usada (a mais antiga primeiro):
 * o pacote Fazemos para você (R$ 9,90), o Kit Emprego, ou o pacote Currículo de R$ 9,90 comprado
 * antes da promoção (que incluía o serviço). Devolve o id do pagamento ou null.
 */
export async function serviceCredit(userId: string): Promise<string | null> {
  const [row] = await db()`SELECT p.id FROM payments p
    WHERE p.user_id = ${userId} AND p.granted_at IS NOT NULL AND p.revoked_at IS NULL
      AND (p.plan IN ('servico', 'mes', 'upgrade') OR (p.plan = 'semana' AND p.original_cents >= 990))
      AND p.access_until_after > now()
      AND NOT EXISTS (SELECT 1 FROM service_requests r WHERE r.user_id = p.user_id AND r.status <> 'cancelled'
        AND (r.data->>'paymentId' = p.id OR (r.data->>'paymentId' IS NULL AND r.created_at >= p.granted_at)))
    ORDER BY p.granted_at ASC LIMIT 1`.catch(() => []);
  return row ? String(row.id) : null;
}

export async function createRequest(userId: string, input: ServiceInput, paymentId?: string | null) {
  const data = paymentId ? { ...input, paymentId } : input;
  const [row] =
    await db()`INSERT INTO service_requests (user_id, data) VALUES (${userId}, ${JSON.stringify(data)}::jsonb)
    RETURNING id, status, data, created_at, delivered_at, delivered_resume_id, admin_note`;
  return toRow(row);
}

export async function deliveredResume(userId: string, requestId: string) {
  const [r] =
    await db()`SELECT r.id, r.title, r.template, r.accent, r.density, r.payload, r.section_order, r.hidden_sections, r.created_at, r.updated_at
    FROM service_requests s JOIN resumes r ON r.id = s.delivered_resume_id AND r.user_id = s.user_id
    WHERE s.id = ${requestId} AND s.user_id = ${userId} AND s.status = 'delivered' AND r.deleted_at IS NULL`;
  if (!r) return null;
  return {
    id: String(r.id),
    title: String(r.title),
    template: r.template,
    accent: String(r.accent),
    density: r.density,
    cv: r.payload,
    sectionOrder: r.section_order,
    hidden: r.hidden_sections,
    createdAt: new Date(String(r.created_at)).toISOString(),
    updatedAt: new Date(String(r.updated_at)).toISOString(),
  } as ResumeDocument;
}

/**
 * Entrega: copia um currículo da conta do administrador para a conta do cliente
 * (aparece em Meus currículos dele e no link do pedido) e marca o pedido como entregue.
 */
export async function deliverRequest(
  requestId: string,
  adminUserId: string,
  source: { resumeId: string } | { doc: ResumeDocument },
  note: string | null,
) {
  const sql = db();
  const [req] = await sql`SELECT id, user_id, status FROM service_requests WHERE id = ${requestId}`;
  if (!req) throw new Error("Pedido não encontrado.");
  if (req.status === "delivered" || req.status === "cancelled")
    throw new Error("Este pedido já foi encerrado.");
  let src: Record<string, unknown> | undefined;
  if ("doc" in source) {
    // Currículo montado no navegador da equipe: não precisa estar sincronizado.
    const d = source.doc;
    src = {
      // "Pedido #12 — Ana" é o nome interno da equipe; o cliente vê "Currículo de Ana Souza".
      title: !d.title || d.title.startsWith("Pedido #") ? "Currículo de " + (d.cv.name || "você") : d.title,
      template: d.template,
      accent: d.accent,
      density: d.density,
      payload: d.cv,
      section_order: d.sectionOrder,
      hidden_sections: d.hidden,
    };
  } else {
    [src] =
      await sql`SELECT * FROM resumes WHERE id = ${source.resumeId} AND user_id = ${adminUserId} AND deleted_at IS NULL`;
  }
  if (!src) throw new Error("Currículo não encontrado. Escolha de novo na lista.");
  const newId = randomUUID();
  await sql`INSERT INTO resumes (id, user_id, title, template, accent, density, payload, section_order, hidden_sections, revision, created_at, updated_at)
    VALUES (${newId}, ${String(req.user_id)}, ${String(src.title).slice(0, 140) + " — feito pela equipe"}, ${src.template}, ${src.accent}, ${src.density},
      ${JSON.stringify(src.payload)}::jsonb, ${JSON.stringify(src.section_order)}::jsonb, ${JSON.stringify(src.hidden_sections)}::jsonb, 1, now(), now())`;
  const [done] =
    await sql`UPDATE service_requests SET status = 'delivered', delivered_resume_id = ${newId}, delivered_at = now(),
      admin_note = COALESCE(${note}, admin_note), updated_at = now()
    WHERE id = ${requestId} RETURNING user_id, delivered_at, data`;
  const [u] = await sql`SELECT email, display_name FROM app_users WHERE id = ${String(done.user_id)}`;
  const data = (done.data || {}) as Partial<ServiceInput> & { via?: string; email?: string };
  return {
    // Pedido criado pela cobrança Pix do painel: o e-mail é o que a equipe informou (pode não ter conta).
    email: String((data.via === "pix" ? data.email : u?.email) || ""),
    name: data.name || (u?.display_name ? String(u.display_name) : null),
    userId: String(done.user_id),
    deliveredAt: new Date(String(done.delivered_at)).toISOString(),
    resumeId: newId,
  };
}
