import { isAccessPlan } from "@/lib/billing";
import { quoteCoupon } from "@/lib/server/coupons";
import { getServerSession } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Confere um cupom antes do pagamento. O preço final é recalculado no servidor ao gerar a cobrança. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan");
  if (!isAccessPlan(plan)) return Response.json({ error: "invalid_plan" }, { status: 400 });
  try {
    const session = await getServerSession().catch(() => null);
    const result = await quoteCoupon(url.searchParams.get("code"), plan, session?.userId || null);
    if (!result.ok) return Response.json({ error: "invalid_coupon", message: result.message }, { status: 400 });
    return Response.json({ quote: result.quote });
  } catch (error) {
    console.error("Cupom falhou", error);
    return Response.json({ error: "unavailable", message: "Não foi possível conferir o cupom agora." }, { status: 500 });
  }
}
