/** Bloqueia chamadas de outros sites (CSRF) em rotas que alteram dados. */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!origin) return true;
  try {
    return !!host && new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** URL pública do site, usada para o endereço de notificação do Mercado Pago. */
export function publicBaseUrl(request: Request) {
  const configured = process.env.SITE_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  return host ? proto + "://" + host : null;
}
