"use client";
import { useCallback, useEffect, useState } from "react";
import { hasActiveAccess } from "@/lib/billing";

export type AccessInfo = {
  loading: boolean;
  signedIn: boolean;
  email: string | null;
  accessUntil: string | null;
  active: boolean;
};

const initial: AccessInfo = { loading: true, signedIn: false, email: null, accessUntil: null, active: false };

/** Estado da conta e do acesso pago. Sem conta ou com falha de rede, o download fica bloqueado. */
export function useAccess() {
  const [access, setAccess] = useState<AccessInfo>(initial);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/account", { cache: "no-store" });
      if (response.status === 401) {
        setAccess({ ...initial, loading: false });
        return;
      }
      if (!response.ok) throw new Error("account");
      const data = (await response.json()) as {
        account: { email: string; accessUntil: string | null; active: boolean };
      };
      setAccess({
        loading: false,
        signedIn: true,
        email: data.account.email,
        accessUntil: data.account.accessUntil,
        active: data.account.active || hasActiveAccess(data.account.accessUntil),
      });
    } catch {
      setAccess({ ...initial, loading: false });
    }
  }, []);
  useEffect(() => {
    void refresh();
    // Ao voltar para a aba (ex.: depois de pagar no app do banco), confere se o acesso foi liberado.
    let last = Date.now();
    const onVisible = () => {
      if (document.visibilityState !== "visible" || Date.now() - last < 5000) return;
      last = Date.now();
      void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);
  // O acesso expira sozinho no horário certo, mesmo com a página aberta.
  useEffect(() => {
    if (!access.active || !access.accessUntil) return;
    const remaining = new Date(access.accessUntil).getTime() - Date.now();
    if (remaining <= 0 || remaining > 2_147_000_000) return;
    const timer = window.setTimeout(() => void refresh(), remaining + 1000);
    return () => window.clearTimeout(timer);
  }, [access.active, access.accessUntil, refresh]);
  const unlock = useCallback(
    (accessUntil: string | null) =>
      setAccess((current) => ({ ...current, accessUntil, active: hasActiveAccess(accessUntil) })),
    [],
  );
  return { access, refresh, unlock };
}
