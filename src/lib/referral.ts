// Guarda no navegador o código de quem indicou (?ref=CODIGO) por 30 dias.
const KEY = "curriculospro.ref.v1";
const TTL = 30 * 86_400_000;

export const isReferralCode = (v: string) => /^[A-Z0-9]{6,10}$/.test(v);

export function captureReferral() {
  try {
    const ref = new URLSearchParams(location.search).get("ref")?.trim().toUpperCase();
    if (!ref || !isReferralCode(ref)) return false;
    localStorage.setItem(KEY, JSON.stringify({ code: ref, at: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

export function storedReferral(): string | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null") as { code?: string; at?: number } | null;
    if (!v?.code || !v.at || Date.now() - v.at > TTL || !isReferralCode(v.code)) return null;
    return v.code;
  } catch {
    return null;
  }
}

export function clearReferral() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
