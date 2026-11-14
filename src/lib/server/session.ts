import { auth } from "@/lib/auth/server";
import { db } from "@/lib/server/db";

export type ServerSession = {
  userId: string;
  email: string;
  displayName: string | null;
  plan: "free" | "pro";
  accessUntil: string | null;
};

export async function getServerSession(): Promise<ServerSession | null> {
  const result = await auth.getSession();
  const user = result.data?.user;
  if (!user?.id || !user.email) return null;
  const sql = db();
  const upsert = () =>
    sql`INSERT INTO app_users(id,email,display_name) VALUES(${user.id},${user.email},${user.name || null}) ON CONFLICT(id) DO UPDATE SET email=EXCLUDED.email,display_name=COALESCE(EXCLUDED.display_name,app_users.display_name),updated_at=now() RETURNING plan,access_until`;
  let rows;
  try {
    rows = await upsert();
  } catch (error) {
    // O mesmo e-mail pode reaparecer com outro ID quando a conta é excluída e criada de novo
    // no provedor de login. O registro antigo é preservado, apenas com o e-mail liberado.
    if ((error as { code?: string }).code !== "23505") throw error;
    await sql`UPDATE app_users SET email = email || '#substituido:' || id, updated_at = now()
      WHERE lower(email) = lower(${user.email}) AND id <> ${user.id}`;
    rows = await upsert();
  }
  const accessUntil = rows[0]?.access_until ? new Date(String(rows[0].access_until)).toISOString() : null;
  return {
    userId: user.id,
    email: user.email,
    displayName: user.name || null,
    plan: rows[0]?.plan === "pro" ? "pro" : "free",
    accessUntil,
  };
}

export async function requireServerSession() {
  const session = await getServerSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}
