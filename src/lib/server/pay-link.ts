// Página de pagamento do "Cobrar no Pix": link curto e assinado para mandar no WhatsApp.
import { createHmac, timingSafeEqual } from "node:crypto";
import { linkSecret } from "@/lib/server/secrets";
import { SITE_URL } from "@/lib/site";

const sign = (id: string) => createHmac("sha256", linkSecret()).update(`pay:${id}`).digest("base64url").slice(0, 16);

export const payToken = (paymentId: string) => `${paymentId}-${sign(paymentId)}`;
export const payUrl = (paymentId: string) => SITE_URL + "/p/" + payToken(paymentId);

export function verifyPayToken(token: string): string | null {
  const m = /^(\d{1,20})-([A-Za-z0-9_-]{16})$/.exec(token || "");
  if (!m) return null;
  const a = Buffer.from(sign(m[1]));
  const b = Buffer.from(m[2]);
  return a.length === b.length && timingSafeEqual(a, b) ? m[1] : null;
}
