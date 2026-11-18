// Entrega do "Fazemos para você" sem login: link assinado que vale 30 dias.
import { createHmac, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/server/db";
import { SITE_URL } from "@/lib/site";
import type { ResumeDocument } from "@/lib/resume";

export const DELIVERY_LINK_DAYS = 30;
const secret = () => process.env.EMAIL_LINK_SECRET || process.env.MERCADOPAGO_WEBHOOK_SECRET || "dev-secret";
const sign = (id: string, exp: number) =>
  createHmac("sha256", secret()).update(`delivery:${id}:${exp}`).digest("base64url").slice(0, 32);

export function deliveryToken(requestId: string, deliveredAt: string | Date) {
  const exp = Math.floor(new Date(deliveredAt).getTime() / 1000) + DELIVERY_LINK_DAYS * 86_400;
  return `${requestId}.${exp}.${sign(requestId, exp)}`;
}

export const deliveryUrl = (requestId: string, deliveredAt: string | Date) =>
  SITE_URL + "/entrega/" + deliveryToken(requestId, deliveredAt);

/** Confere o link. Devolve o id do pedido ou um motivo. */
export function verifyDeliveryToken(token: string): { id: string } | { error: "invalid" | "expired" } {
  const m = /^(\d{1,18})\.(\d{9,11})\.([A-Za-z0-9_-]{32})$/.exec(token || "");
  if (!m) return { error: "invalid" };
  const [, id, expRaw, sig] = m;
  const exp = Number(expRaw);
  const expected = Buffer.from(sign(id, exp));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { error: "invalid" };
  if (exp * 1000 < Date.now()) return { error: "expired" };
  return { id };
}

export type Delivery = {
  requestId: string;
  name: string;
  role: string;
  note: string | null;
  deliveredAt: string;
  resume: ResumeDocument;
  pdf: { id: string; filename: string } | null;
  /** Falso quando o cliente não tem conta (venda pelo Cobrar no Pix): não falar em Meus currículos. */
  inAccount: boolean;
};

export async function loadDelivery(requestId: string): Promise<Delivery | null> {
  const sql = db();
  const [s] = await sql`SELECT s.id, s.data, s.admin_note, s.delivered_at, r.id AS rid, r.title, r.template, r.accent, r.density,
      r.payload, r.section_order, r.hidden_sections, r.created_at AS rcreated, r.updated_at AS rupdated
    FROM service_requests s JOIN resumes r ON r.id = s.delivered_resume_id AND r.user_id = s.user_id
    WHERE s.id = ${requestId} AND s.status = 'delivered' AND r.deleted_at IS NULL`;
  if (!s) return null;
  let pdf: Delivery["pdf"] = null;
  try {
    const [f] = await sql`SELECT id, filename FROM service_files WHERE request_id = ${requestId} AND kind = 'delivery'
      ORDER BY id DESC LIMIT 1`;
    if (f) pdf = { id: String(f.id), filename: String(f.filename) };
  } catch {}
  const data = (s.data || {}) as { name?: string; role?: string; inAccount?: boolean };
  return {
    inAccount: data.inAccount !== false,
    requestId: String(s.id),
    name: String(data.name || ""),
    role: String(data.role || ""),
    note: s.admin_note ? String(s.admin_note) : null,
    deliveredAt: new Date(String(s.delivered_at)).toISOString(),
    pdf,
    resume: {
      id: String(s.rid),
      title: String(s.title),
      template: s.template,
      accent: String(s.accent),
      density: s.density,
      cv: s.payload,
      sectionOrder: s.section_order,
      hidden: s.hidden_sections,
      createdAt: new Date(String(s.rcreated)).toISOString(),
      updatedAt: new Date(String(s.rupdated)).toISOString(),
    } as ResumeDocument,
  };
}

export const fileSlug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "curriculo";
