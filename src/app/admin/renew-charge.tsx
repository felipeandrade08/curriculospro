"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/** Na lista de cobranças: Pix vencido → gera outro para a mesma cobrança e mostra lá em cima. */
export function RenewCharge({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <button
        type="button"
        className="cpa-btn small"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const r = await fetch("/api/admin/pix/renovar", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ id }),
            });
            const d = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(d.message || "Não foi possível gerar o novo Pix.");
            window.dispatchEvent(new CustomEvent("cpa-pix-renewed", { detail: d }));
            router.refresh();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Não foi possível gerar o novo Pix.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Gerando…" : "Gerar novo Pix"}
      </button>
      {error && <small className="cpa-pix-error">{error}</small>}
    </>
  );
}
