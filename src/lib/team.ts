// "Modo equipe": este navegador é usado pela conta da equipe (ADMIN_EMAIL).
// Só muda a interface e as métricas; as permissões são sempre conferidas no servidor.
const KEY = "curriculospro.team.v1";
export const TEAM_EVENT = "curriculospro:team";

export function isTeamBrowser() {
  try {
    return typeof window !== "undefined" && localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setTeamBrowser(on: boolean) {
  try {
    if (on === isTeamBrowser()) return;
    if (on) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(TEAM_EVENT));
  } catch {}
}
