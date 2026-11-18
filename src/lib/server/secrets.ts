// Segredo dos links assinados (entrega do currículo, descadastro de e-mail).
// Em produção nunca cai num valor conhecido: sem segredo configurado, os links não são gerados nem aceitos.
export function linkSecret() {
  const value = (process.env.EMAIL_LINK_SECRET || process.env.MERCADOPAGO_WEBHOOK_SECRET || "").trim();
  if (value) return value;
  if (process.env.VERCEL_ENV === "production")
    throw new Error("EMAIL_LINK_SECRET não configurado");
  return "dev-secret";
}
