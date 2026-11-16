"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/admin";

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
