import { getServerSession } from "@/lib/server/session";
import { getPayment } from "@/lib/server/mercadopago";
import { applyProviderPayment, findPayment, getAccessUntil, toCheckout } from "@/lib/server/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

/** Consulta o status do Pix. Também libera o acesso caso o webhook ainda não tenha chegado. */
export async function GET(_: Request, { params }: Context) {
  try {
    const session = await getServerSession();
    if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
    const { id } = await params;
    let row = await findPayment(id);
    if (!row || row.user_id !== session.userId) return Response.json({ error: "not_found" }, { status: 404 });

    if (!row.granted_at && row.status !== "rejected") {
      try {
        const payment = await getPayment(row.id);
        await applyProviderPayment(payment, row);
        row = (await findPayment(id)) || row;
      } catch (error) {
        // Mantém o último estado conhecido; o navegador tentará de novo.
        console.error("Consulta de pagamento falhou", error);
      }
    }
    const accessUntil = await getAccessUntil(session.userId);
    return Response.json({ checkout: toCheckout(row, accessUntil) });
  } catch (error) {
    console.error("Status do checkout falhou", error);
    return Response.json({ error: "status_unavailable" }, { status: 500 });
  }
}
