import { hasActiveAccess, hasKit } from "@/lib/billing";
import { getKitUntil } from "@/lib/server/payments";
import { getServerSession } from "@/lib/server/session";
import { pendingReferralBonus } from "@/lib/server/referrals";

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
        kit: hasKit(kitUntil),
      },
    });
  } catch {
    return Response.json({ error: "account_unavailable" }, { status: 500 });
  }
}
