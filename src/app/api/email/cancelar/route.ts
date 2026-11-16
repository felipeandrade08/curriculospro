import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/server/db";
import { unsubscribeToken } from "@/lib/server/email";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function optOut(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("u") || "";
  const token = Buffer.from(url.searchParams.get("t") || "");
  const expected = Buffer.from(unsubscribeToken(userId));
  if (!userId || token.length !== expected.length || !timingSafeEqual(token, expected)) return false;
  await db()`UPDATE app_users SET email_opt_out = true WHERE id = ${userId}`;
  return true;
}

const page = (ok: boolean) =>
  new Response(
    `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lembretes</title>
<body style="font-family:system-ui,sans-serif;max-width:520px;margin:80px auto;padding:0 20px;color:#0e1b2e">
<h1 style="font-size:24px">${ok ? "Pronto, você não receberá mais lembretes." : "Link inválido ou expirado."}</h1>
<p style="color:#4a5a72">${ok ? "E-mails de confirmação de pagamento continuam sendo enviados quando você comprar." : "Se quiser parar de receber lembretes, responda qualquer e-mail nosso."}</p>
<p><a href="${SITE_URL}" style="color:#1553d6">Voltar ao CurriculosPRO</a></p></body></html>`,
    { status: ok ? 200 : 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );

export async function GET(request: Request) {
  return page(await optOut(request).catch(() => false));
}

// Descadastro com um clique pelo próprio aplicativo de e-mail (List-Unsubscribe-Post).
export async function POST(request: Request) {
  const ok = await optOut(request).catch(() => false);
  return new Response(null, { status: ok ? 204 : 400 });
}
