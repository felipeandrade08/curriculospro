import { adminEmail } from "@/lib/server/admin";
import { emailConfigured, sendEmail, serviceAdminEmail, serviceReceivedEmail } from "@/lib/server/email";
import { isSameOrigin } from "@/lib/server/request";
import { canRequest, createRequest, listMyRequests, parseServiceInput, serviceCredit } from "@/lib/server/service";
import { getServerSession } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
    return Response.json({ requests: await listMyRequests(session.userId) });
  } catch (error) {
    console.error("Pedidos indisponíveis", error);
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 3_000_000)
    return Response.json({ error: "too_large", message: "Envio grande demais." }, { status: 413 });
  try {
    const session = await getServerSession();
    if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
    // Precisa de uma compra do "Fazemos para você" (ou Kit) ainda não usada; a equipe não paga.
    const credit = session.plan === "pro" ? null : await serviceCredit(session.userId);
    if (session.plan !== "pro" && !credit)
      return Response.json(
        { error: "payment_required", message: "Libere o Fazemos para você para enviar o pedido." },
        { status: 402 },
      );
    const input = parseServiceInput(await request.json().catch(() => null));
    if (typeof input === "string")
      return Response.json({ error: "invalid", message: input }, { status: 400 });
    const blocked = await canRequest(session.userId);
    if (blocked) return Response.json({ error: "limit", message: blocked }, { status: 429 });
    const created = await createRequest(session.userId, input, credit);
    if (emailConfigured()) {
      const admin = adminEmail();
      await Promise.allSettled([
        sendEmail({
          to: session.email,
          ...serviceReceivedEmail({ name: input.name, role: input.role }),
          idempotencyKey: "svc-received-" + created.id,
        }),
        admin
          ? sendEmail({
              to: admin,
              ...serviceAdminEmail({
                name: input.name,
                role: input.role,
                whatsapp: input.whatsapp,
                email: session.email,
              }),
              idempotencyKey: "svc-admin-" + created.id,
            })
          : Promise.resolve(),
      ]);
    }
    return Response.json({ request: created }, { status: 201 });
  } catch (error) {
    console.error("Pedido falhou", error);
    return Response.json(
      { error: "unavailable", message: "Não foi possível enviar agora. Tente de novo ou fale no WhatsApp." },
      { status: 503 },
    );
  }
}
