// De onde a pessoa veio na primeira visita (anúncio, Instagram, Google...), guardado por 60 dias.
// Vai junto com o pagamento para o painel mostrar quais canais vendem.
const KEY = "curriculospro.origin.v1";
const TTL = 60 * 86_400_000;

export type Origin = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  referrer?: string;
  landing?: string;
  fbclid?: string;
  gclid?: string;
  at?: number;
};

const clip = (v: string | null | undefined, n = 80) => (v ? v.trim().slice(0, n) : undefined);

export function captureOrigin() {
  try {
    const params = new URLSearchParams(location.search);
    const stored = storedOrigin();
    const fresh: Origin = {
      source: clip(params.get("utm_source")),
      medium: clip(params.get("utm_medium")),
      campaign: clip(params.get("utm_campaign")),
      content: clip(params.get("utm_content")),
      fbclid: clip(params.get("fbclid"), 200),
      gclid: clip(params.get("gclid"), 200),
    };
    const hasCampaign = Object.values(fresh).some(Boolean);
    // Primeiro toque vence, a não ser que agora chegue uma campanha nova (anúncio clicado).
    if (stored && !hasCampaign) return;
    let referrer: string | undefined;
    try {
      const ref = document.referrer ? new URL(document.referrer) : null;
      if (ref && ref.host !== location.host) referrer = ref.host.replace(/^www\./, "");
    } catch {}
    const origin: Origin = { ...fresh, referrer, landing: clip(location.pathname, 120), at: Date.now() };
    // Mantém o fbclid antigo se a nova visita não trouxe um.
    if (stored?.fbclid && !origin.fbclid) origin.fbclid = stored.fbclid;
    localStorage.setItem(KEY, JSON.stringify(origin));
  } catch {}
}

export function storedOrigin(): Origin | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null") as Origin | null;
    if (!v || !v.at || Date.now() - v.at > TTL) return null;
    return v;
  } catch {
    return null;
  }
}
