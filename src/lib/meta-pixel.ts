// Meta Pixel (Facebook/Instagram Ads). Só carrega com o ID configurado e depois do aceite de cookies.
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "";
export const CONSENT_KEY = "curriculospro.consent.v1";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...a: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: unknown;
};
declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

export function consentGiven() {
  try {
    return localStorage.getItem(CONSENT_KEY) === "granted";
  } catch {
    return false;
  }
}

export function loadMetaPixel() {
  if (!META_PIXEL_ID || typeof window === "undefined" || window.fbq) return;
  const fbq: Fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue!.push(args);
  } as Fbq;
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.push = fbq;
  window.fbq = fbq;
  window._fbq = fbq;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
  fbq("init", META_PIXEL_ID);
}

/** Envia um evento padrão do Meta. eventID evita contar duas vezes a mesma compra. */
export function metaTrack(event: string, params?: Record<string, unknown>, eventID?: string) {
  if (typeof window === "undefined" || !window.fbq || !consentGiven()) return;
  try {
    if (eventID) window.fbq("track", event, params || {}, { eventID });
    else window.fbq("track", event, params || {});
  } catch {}
}
