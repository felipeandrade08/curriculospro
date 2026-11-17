"use client";
import { useEffect, useState } from "react";
import { TEAM_EVENT, isTeamBrowser, setTeamBrowser } from "@/lib/team";

/** Marca este navegador como da equipe (usado na página do painel, que já confere o acesso no servidor). */
export function TeamFlag() {
  useEffect(() => setTeamBrowser(true), []);
  return null;
}

/** true quando o navegador é da equipe; atualiza ao entrar ou sair. */
export function useTeam() {
  const [team, setTeam] = useState(false);
  useEffect(() => {
    const sync = () => setTeam(isTeamBrowser());
    sync();
    window.addEventListener(TEAM_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(TEAM_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return team;
}

/** Mostra o conteúdo só para clientes (esconde da equipe). */
export function CustomerOnly({ children }: { children: React.ReactNode }) {
  return useTeam() ? null : <>{children}</>;
}

/** Botão "Painel" no cabeçalho, só para a equipe. */
export function TeamHeaderLink({ mobile = false }: { mobile?: boolean }) {
  const team = useTeam();
  if (!team) return null;
  return (
    <a href="/admin" className={mobile ? "sh-team-m" : "sh-team"}>
      Painel da equipe
    </a>
  );
}
