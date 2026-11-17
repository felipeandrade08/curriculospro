import { hasActiveAccess, hasKit } from "@/lib/billing";
import { getKitUntil } from "@/lib/server/payments";
import { getServerSession } from "@/lib/server/session";
import { pendingReferralBonus } from "@/lib/server/referrals";
import { adminEmail } from "@/lib/server/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
    const [referralBonus, kitUntil] = await Promise.all([
      pendingReferralBonus(session.userId).catch(() => false),
      getKitUntil(session.userId),
    ]);
    return Response.json({
      account: {
        email: session.email,
        displayName: session.displayName,
        plan: session.plan,
        accessUntil: session.accessUntil,
        active: session.plan === "pro" || hasActiveAccess(session.accessUntil),
        referralBonus,
        kitUntil,
        kit: session.plan === "pro" || hasKit(kitUntil),
        team: !!adminEmail() && session.email.trim().toLowerCase() === adminEmail(),
      },
    });
  } catch {
    return Response.json({ error: "account_unavailable" }, { status: 500 });
  }
}
