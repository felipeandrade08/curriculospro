"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * O cliente pagou pela chave Pix (ou transferência) em vez do código: dá baixa na cobrança.
 * Pede confirmação em dois toques para não marcar por engano.
 */
export function MarkPaid({ id, onDone, small = true }: { id: string; onDone?: () => void; small?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "confirm" | "busy">("idle");
  const [error, setError] = useState("");
  const cls = "cpa-btn ghost" + (small ? " small" : "");
  if (step === "idle")
    return (
      <button type="button" className={cls} onClick={() => setStep("confirm")}>
        Recebi pela chave Pix
      </button>
    );
  return (
    <span className="cpa-markpaid">
      <small>O dinheiro já caiu na sua conta?</small>
      <button
        type="button"
        className={"cpa-btn" + (small ? " small" : "")}
        disabled={step === "busy"}
        onClick={async () => {
          setStep("busy");
          setError("");
          try {
            const r = await fetch("/api/admin/pix/recebido", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ id }),
            });
            const d = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(d.message || "Não foi possível dar baixa agora.");
            onDone?.();
            router.refresh();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Não foi possível dar baixa agora.");
            setStep("confirm");
          }
        }}
      >
        {step === "busy" ? "Dando baixa…" : "Sim, dar baixa"}
      </button>
      <button type="button" className={cls} onClick={() => setStep("idle")} disabled={step === "busy"}>
        Cancelar
      </button>
      {error && <small className="cpa-pix-error">{error}</small>}
    </span>
  );
}
