"use client";
import { useEffect, useState } from "react";
import { KitTag, useKitGate } from "@/components/kit-gate";

// Pergunta uma vez por página se a IA está ligada no servidor (sem chave, o botão some).
let status: Promise<boolean> | null = null;
function aiEnabled() {
  status ??= fetch("/api/ai/melhorar", { cache: "no-store" })
    .then((r) => r.json())
    .then((d: { enabled?: boolean }) => !!d.enabled)
    .catch(() => false);
  return status;
}

type Props = {
  kind: "summary" | "activities";
  text: string;
  onApply: (text: string) => void;
  role?: string;
  title?: string;
  company?: string;
};

/** Botão "Melhorar com IA" com prévia: a pessoa compara e escolhe se usa o texto novo. */
export function AiImprove(props: Props) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let alive = true;
    aiEnabled().then((v) => alive && setOn(v));
    return () => {
      alive = false;
    };
  }, []);
  return on ? <Improve {...props} /> : null;
}

function Improve({ kind, text, onApply, role, title, company }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const gate = useKitGate("/editor");

  const short = text.trim().length < 15;
  const run = async () => {
    if (!gate.kit) {
      gate.ask();
      return;
    }
    setBusy(true);
    setError("");
    setResult("");
    try {
      const response = await fetch("/api/ai/melhorar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, text, role, title, company }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        text?: string;
        message?: string;
        remaining?: number | null;
      };
      if (response.status === 402) {
        gate.ask();
        return;
      }
      if (!response.ok || !data.text)
        throw new Error(data.message || "A IA não respondeu agora. Tente de novo em instantes.");
      setResult(data.text);
      setRemaining(typeof data.remaining === "number" ? data.remaining : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "A IA não respondeu agora.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="aiImprove">
      {!result && (
        <button
          type="button"
          className="aiImproveBtn"
          onClick={run}
          disabled={busy || (gate.kit && short)}
          title={short ? "Escreva pelo menos uma frase primeiro" : undefined}
        >
          <span aria-hidden="true">✦</span>
          {busy ? "Melhorando…" : kind === "summary" ? "Melhorar objetivo com IA" : "Melhorar atividades com IA"}
          {!gate.kit && !gate.loading && <KitTag />}
        </button>
      )}
      {gate.kit && short && !result && !busy && (
        <small className="aiImproveNote">Escreva com suas palavras primeiro; a IA deixa mais profissional.</small>
      )}
      {error && (
        <p className="aiImproveError" role="alert">
          {error}
        </p>
      )}
      {result && (
        <div className="aiImproveResult">
          <b>Sugestão da IA</b>
          <p>{result}</p>
          <small>Confira se está tudo verdadeiro antes de usar. A IA só reescreve o que você informou.</small>
          <div>
            <button
              type="button"
              className="aiUse"
              onClick={() => {
                onApply(result);
                setResult("");
              }}
            >
              Usar este texto
            </button>
            <button type="button" onClick={run} disabled={busy}>
              {busy ? "Gerando…" : "Gerar outra"}
            </button>
            <button type="button" onClick={() => setResult("")}>
              Manter o meu
            </button>
          </div>
          {remaining !== null && <small>{remaining} uso(s) restante(s) hoje.</small>}
        </div>
      )}
      {gate.modal}
    </div>
  );
}
