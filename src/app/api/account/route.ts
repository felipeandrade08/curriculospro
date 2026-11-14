import { hasActiveAccess } from "@/lib/billing";
import { getServerSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
    return Response.json({
      account: {
        email: session.email,
        displayName: session.displayName,
        plan: session.plan,
        accessUntil: session.accessUntil,
        active: session.plan === "pro" || hasActiveAccess(session.accessUntil),
      },
    });
  } catch {
    return Response.json({ error: "account_unavailable" }, { status: 500 });
  }
}
