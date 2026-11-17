// Origem da venda: canal (anúncio, Instagram, Google...) e, com consentimento, os dados que a
// API de Conversões da Meta usa para ligar a compra ao anúncio.
import { cookies } from "next/headers";

export type SaleSource = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  referrer?: string;
  landing?: string;
  gclid?: string;
  /** Só com consentimento de cookies. */
  meta?: { fbp?: string; fbc?: string; ip?: string; ua?: string };
};

const text = (v: unknown, n = 80) =>
  typeof v === "string" && v.trim() ? v.trim().replace(/[\u0000-\u001f<>]/g, "").slice(0, n) : undefined;

function compact<T extends Record<string, unknown>>(o: T) {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

/** Monta a origem a partir do que o navegador mandou + cookies/IP do pedido. */
export async function readSaleSource(request: Request, body: { origin?: unknown; consent?: unknown }) {
  const o = (body.origin && typeof body.origin === "object" ? body.origin : {}) as Record<string, unknown>;
  const source: SaleSource = compact({
    source: text(o.source)?.toLowerCase(),
    medium: text(o.medium)?.toLowerCase(),
    campaign: text(o.campaign),
    content: text(o.content),
    referrer: text(o.referrer)?.toLowerCase(),
    landing: text(o.landing, 120),
    gclid: text(o.gclid, 200),
  });
  if (body.consent === true) {
    const jar = await cookies();
    const fbclid = text(o.fbclid, 200);
    const fbp = text(jar.get("_fbp")?.value, 120);
    const fbc =
      text(jar.get("_fbc")?.value, 300) ||
      (fbclid && typeof o.at === "number" ? `fb.1.${Math.floor(o.at)}.${fbclid}` : undefined);
    const ip = text((request.headers.get("x-forwarded-for") || "").split(",")[0], 64);
    const ua = text(request.headers.get("user-agent"), 400);
    const meta = compact({ fbp, fbc, ip, ua });
    if (Object.keys(meta).length) source.meta = meta;
  }
  return Object.keys(source).length ? source : null;
}

/** Nome do canal para o painel. */
export function channelOf(s: SaleSource | null | undefined) {
  if (!s) return "Direto";
  const src = s.source || "",
    med = s.medium || "",
    ref = s.referrer || "";
  if (/(facebook|instagram|fb|ig|meta)/.test(src) && /(cpc|paid|ads?|pago)/.test(med)) return "Anúncio Meta";
  if (s.meta?.fbc && !src) return "Anúncio Meta";
  if (s.gclid || (src === "google" && /(cpc|paid|ads?)/.test(med))) return "Google Ads";
  if (/instagram|^ig$/.test(src) || /instagram/.test(ref)) return "Instagram";
  if (/facebook|^fb$/.test(src) || /facebook|fb\.com/.test(ref)) return "Facebook";
  if (/whats/.test(src) || /whatsapp/.test(ref)) return "WhatsApp";
  if (/tiktok/.test(src + ref)) return "TikTok";
  if (/google\./.test(ref) || /bing\.|duckduckgo|yahoo/.test(ref)) return "Busca (Google)";
  if (/linkedin/.test(src + ref)) return "LinkedIn";
  if (/(mail|resend)/.test(src + med)) return "E-mail";
  if (src) return src.charAt(0).toUpperCase() + src.slice(1);
  if (ref) return ref;
  return "Direto";
}
