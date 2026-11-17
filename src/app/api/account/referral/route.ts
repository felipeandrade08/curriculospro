import { getServerSession } from "@/lib/server/session";
import { attachReferral, ensureReferralCode, referralStats } from "@/lib/server/referrals";
import { isSameOrigin } from "@/lib/server/request";
import { isReferralCode } from "@/lib/referral";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
    const code = await ensureReferralCode(session.userId);
    const stats = await referralStats(session.userId);
    return Response.json({ code, url: SITE_URL + "/?ref=" + code, ...stats });
  } catch (error) {
    console.error("Indicação indisponível", error);
    return Response.json({ error: "referral_unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  try {
    const session = await getServerSession();
    if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
    const body = (await request.json().catch(() => ({}))) as { code?: unknown };
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    if (!isReferralCode(code)) return Response.json({ error: "invalid_code" }, { status: 400 });
    const attached = await attachReferral(session.userId, code);
    // 400 = não se aplica (já comprou, já indicado ou código próprio): o navegador esquece o código.
    return Response.json({ attached }, { status: attached ? 200 : 400 });
  } catch (error) {
    console.error("Falha ao vincular indicação", error);
    return Response.json({ error: "referral_unavailable" }, { status: 503 });
  }
}
