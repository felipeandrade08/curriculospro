import { getServerSession, type ServerSession } from "@/lib/server/session";

export type AdminCheck =
  { ok: true; session: ServerSession } | { ok: false; reason: "not-configured" | "signed-out" | "forbidden" };

export function adminEmail() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";
}

export async function checkAdmin(): Promise<AdminCheck> {
  const email = adminEmail();
  if (!email) return { ok: false, reason: "not-configured" };
  const session = await getServerSession();
  if (!session) return { ok: false, reason: "signed-out" };
  if (session.email.trim().toLowerCase() !== email) return { ok: false, reason: "forbidden" };
  return { ok: true, session };
}

export async function requireAdmin() {
  const check = await checkAdmin();
  if (!check.ok) throw new Error("Acesso restrito ao administrador.");
  return check.session;
}
