"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { trackUsage } from "@/lib/analytics";

const CATEGORIES = [
  { id: "praise", label: "Elogio" },
  { id: "suggestion", label: "Sugestão" },
  { id: "problem", label: "Problema" },
] as const;

const RATING_LABEL = ["", "Muito ruim", "Ruim", "Regular", "Boa", "Excelente"];

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("praise");
  const [message, setMessage] = useState("");
  const [allowPublic, setAllowPublic] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [sentPublic, setSentPublic] = useState(false);
  const [error, setError] = useState("");

  const canPublish = category !== "problem";
  const publicOn = canPublish && allowPublic;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rating) return setError("Escolha uma nota de 1 a 5 estrelas.");
    if (publicOn && !authorName.trim()) return setError("Para publicar, informe como quer ser identificado.");
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          category,
          message,
          website,
          allowPublic: publicOn,
          authorName: publicOn ? authorName : "",
          authorRole: publicOn ? authorRole : "",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível enviar sua avaliação.");
      trackUsage("feedback_sent");
      setSentPublic(publicOn);
      setStatus("success");
      setMessage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tente novamente em instantes.");
      setStatus("idle");
    }
  }

  return (
    <main className="lp fb">
      <SiteHeader />
      <section className="wrap fb-wrap">
        <div className="fb-intro">
          <h1>Como foi criar seu currículo aqui?</h1>
          <p>
            Sua avaliação ajuda outras pessoas a decidir e mostra para nós o que melhorar. Leva menos de um
            minuto.
          </p>
          <Link href="/depoimentos" className="fb-link">
            Ler o que outras pessoas disseram
          </Link>
        </div>

        {status === "success" ? (
          <div className="fb-card fb-done" role="status">
            <h2>Obrigado pela avaliação!</h2>
            <p>
              {sentPublic
                ? "Recebemos seu depoimento. Assim que for revisado, ele aparece na página de depoimentos."
                : "Recebemos sua mensagem. Lemos todas e usamos para decidir as próximas melhorias."}
            </p>
            <div className="fb-done-actions">
              <Link className="btn btn-primary" href="/depoimentos">
                Ver depoimentos
              </Link>
              <button type="button" className="btn btn-ghost" onClick={() => setStatus("idle")}>
                Enviar outra mensagem
              </button>
            </div>
          </div>
        ) : (
          <form className="fb-card" onSubmit={submit} noValidate>
            <fieldset className="fb-stars">
              <legend>Sua nota</legend>
              <div>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={n + " de 5 — " + RATING_LABEL[n]}
                    aria-pressed={rating === n}
                    className={n <= rating ? "on" : ""}
                    onClick={() => setRating(n)}
                  >
                    ★
                  </button>
                ))}
                <span>{rating ? RATING_LABEL[rating] : "Toque nas estrelas"}</span>
              </div>
            </fieldset>

            <fieldset className="fb-cats">
              <legend>Sobre o que é?</legend>
              <div role="radiogroup">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={category === c.id}
                    className={category === c.id ? "on" : ""}
                    onClick={() => setCategory(c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="fb-field">
              <span>
                {category === "problem"
                  ? "O que aconteceu? Em qual tela?"
                  : category === "suggestion"
                    ? "O que poderíamos melhorar?"
                    : "Conte como o site ajudou você"}
              </span>
              <textarea
                required
                minLength={3}
                maxLength={2000}
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  category === "praise"
                    ? "Ex.: Consegui montar meu currículo pelo celular em 15 minutos e já mandei para 3 vagas."
                    : ""
                }
              />
              <small>{message.length}/2000</small>
            </label>

            {canPublish ? (
              <div className="fb-public">
                <label className="fb-check">
                  <input
                    type="checkbox"
                    checked={allowPublic}
                    onChange={(e) => setAllowPublic(e.target.checked)}
                  />
                  <span>Autorizo publicar meu comentário na página de depoimentos</span>
                </label>
                {allowPublic && (
                  <div className="fb-who">
                    <label className="fb-field">
                      <span>Como quer aparecer</span>
                      <input
                        value={authorName}
                        maxLength={60}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Ex.: Ana P., Ribeirão Preto"
                      />
                    </label>
                    <label className="fb-field">
                      <span>Profissão (opcional)</span>
                      <input
                        value={authorRole}
                        maxLength={60}
                        onChange={(e) => setAuthorRole(e.target.value)}
                        placeholder="Ex.: Recepcionista"
                      />
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <p className="fb-note">
                Relatos de problema não são publicados. Se precisar de ajuda rápida, fale com a gente pelo
                WhatsApp no rodapé.
              </p>
            )}

            <label aria-hidden="true" className="fb-hp">
              Deixe este campo vazio
              <input
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>

            {error && (
              <p role="alert" className="fb-error">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-primary btn-lg" disabled={status === "sending"}>
              {status === "sending" ? "Enviando…" : "Enviar avaliação"}
            </button>
            <p className="fb-note">
              Depoimentos passam por revisão antes de aparecer. Não coloque telefone, e-mail ou documentos no
              texto.
            </p>
          </form>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
