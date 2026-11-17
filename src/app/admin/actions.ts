"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/admin";
import { deliverRequest } from "@/lib/server/service";
import { emailConfigured, sendEmail, serviceDeliveredEmail } from "@/lib/server/email";

const STATUSES = new Set(["new", "read", "published", "hidden"]);

function back(params: Record<string, string>): never {
  const qs = new URLSearchParams(params).toString();
  redirect("/admin" + (qs ? "?" + qs : ""));
}

function refreshPublic() {
  revalidatePath("/admin");
  revalidatePath("/depoimentos");
  revalidatePath("/");
}

export async function setFeedbackStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!/^\d+$/.test(id) || !STATUSES.has(status)) return;
  const sql = db();
  if (status === "published")
    await sql`UPDATE user_feedback SET status = 'published', published_at = COALESCE(published_at, now())
      WHERE id = ${id} AND allow_public AND author_name IS NOT NULL`;
  else await sql`UPDATE user_feedback SET status = ${status} WHERE id = ${id}`;
  refreshPublic();
}

export async function replyFeedback(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const reply = String(formData.get("reply") || "")
    .trim()
    .slice(0, 1000);
  if (!/^\d+$/.test(id)) return;
  const sql = db();
  await sql`UPDATE user_feedback SET admin_reply = ${reply || null}, replied_at = ${reply ? new Date().toISOString() : null},
    status = CASE WHEN status = 'new' THEN 'read' ELSE status END WHERE id = ${id}`;
  refreshPublic();
}

export async function deleteFeedback(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!/^\d+$/.test(id)) return;
  await db()`DELETE FROM user_feedback WHERE id = ${id}`;
  refreshPublic();
}

export async function markAllFeedbackRead() {
  await requireAdmin();
  await db()`UPDATE user_feedback SET status = 'read' WHERE status = 'new'`;
  revalidatePath("/admin");
}

export async function grantAccess(formData: FormData) {
  const admin = await requireAdmin();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const days = Math.round(Number(formData.get("days") || 0));
  const reason =
    String(formData.get("reason") || "")
      .trim()
      .slice(0, 200) || null;
  if (!email || !Number.isFinite(days) || days < 1 || days > 365)
    back({ aba: "clientes", q: email, msg: "Informe um e-mail e de 1 a 365 dias." });
  const sql = db();
  const [user] = await sql`SELECT id FROM app_users WHERE lower(email) = ${email} LIMIT 1`;
  if (!user)
    back({
      aba: "clientes",
      q: email,
      msg: "Nenhuma conta com esse e-mail. A pessoa precisa entrar no site uma vez antes da liberação.",
    });
  const [updated] = await sql`UPDATE app_users
    SET access_until = GREATEST(COALESCE(access_until, now()), now()) + make_interval(days => ${days}), updated_at = now()
    WHERE id = ${user.id} RETURNING access_until`;
  await sql`INSERT INTO access_grants (user_id, days, reason, granted_by, access_until_after)
    VALUES (${user.id}, ${days}, ${reason}, ${admin.email}, ${updated.access_until})`;
  revalidatePath("/admin");
  back({ aba: "clientes", q: email, msg: "Acesso liberado por " + days + " dia(s)." });
}

export async function revokeAccess(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("userId") || "");
  const q = String(formData.get("q") || "");
  if (!id) return;
  await db()`UPDATE app_users SET access_until = now(), updated_at = now() WHERE id = ${id}`;
  revalidatePath("/admin");
  back({ aba: "clientes", q, msg: "Acesso encerrado." });
}

const SERVICE_STATUSES = new Set(["new", "in_progress", "cancelled"]);

export async function setServiceStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!/^\d+$/.test(id) || !SERVICE_STATUSES.has(status)) return;
  await db()`UPDATE service_requests SET status = ${status}, updated_at = now() WHERE id = ${id} AND status <> 'delivered'`;
  revalidatePath("/admin");
}

export async function deliverService(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const resumeId = String(formData.get("resumeId") || "");
  const note =
    String(formData.get("note") || "")
      .trim()
      .slice(0, 500) || null;
  if (!/^\d+$/.test(id) || !resumeId) back({ aba: "pedidos", msg: "Escolha o currículo que será entregue." });
  let result: { email: string; name: string | null };
  try {
    result = await deliverRequest(id, admin.userId, resumeId, note);
  } catch (error) {
    back({ aba: "pedidos", msg: error instanceof Error ? error.message : "Não foi possível entregar." });
  }
  if (emailConfigured() && result.email)
    await sendEmail({
      to: result.email,
      ...serviceDeliveredEmail({ name: result.name, note }),
      idempotencyKey: "svc-delivered-" + id,
    }).catch((error) => console.error("Aviso de entrega falhou", id, error));
  revalidatePath("/admin");
  back({ aba: "pedidos", msg: "Pedido entregue. O cliente foi avisado por e-mail." });
}

/* ── Cupons ── */

export async function createCoupon(formData: FormData) {
  await requireAdmin();
  const code = String(formData.get("code") || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const kind = String(formData.get("kind") || "percent");
  const value = Number(String(formData.get("value") || "").replace(",", "."));
  const plan = String(formData.get("plan") || "");
  const maxUses = Number(formData.get("max_uses") || 0);
  const days = Number(formData.get("days") || 0);
  const first = formData.get("first") === "on";
  const description = String(formData.get("description") || "").trim().slice(0, 200) || null;
  if (!/^[A-Z0-9]{3,20}$/.test(code)) back({ aba: "cupons", msg: "Código inválido: use de 3 a 20 letras ou números." });
  if (!(value > 0)) back({ aba: "cupons", msg: "Informe o valor do desconto." });
  const percent = kind === "percent" ? Math.round(value) : null;
  const amount = kind === "amount" ? Math.round(value * 100) : null;
  if (percent !== null && (percent < 1 || percent > 90)) back({ aba: "cupons", msg: "Percentual entre 1% e 90%." });
  const expires = days > 0 ? new Date(Date.now() + days * 86_400_000).toISOString() : null;
  const sql = db();
  try {
    await sql`INSERT INTO coupons(code, description, percent_off, amount_off_cents, plan, max_uses, first_purchase_only, expires_at)
      VALUES(${code}, ${description}, ${percent}, ${amount}, ${plan === "semana" || plan === "mes" ? plan : null},
        ${maxUses > 0 ? Math.round(maxUses) : null}, ${first}, ${expires})`;
  } catch (error) {
    if ((error as { code?: string }).code === "23505") back({ aba: "cupons", msg: "Já existe um cupom com o código " + code + "." });
    throw error;
  }
  revalidatePath("/admin");
  back({ aba: "cupons", msg: "Cupom " + code + " criado." });
}

export async function toggleCoupon(formData: FormData) {
  await requireAdmin();
  const code = String(formData.get("code") || "").toUpperCase();
  if (!/^[A-Z0-9]{3,20}$/.test(code)) return;
  await db()`UPDATE coupons SET active = NOT active WHERE code = ${code}`;
  revalidatePath("/admin");
}
