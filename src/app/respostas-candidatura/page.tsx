"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CopyButton } from "@/components/copy-button";
import { readActiveResume } from "@/lib/active-resume";
import { JOB_TARGET_KEY, emptyJobTarget, type JobTarget, type ResumeData } from "@/lib/resume";
import { analyzeJob } from "@/lib/job-match";
import { formAnswers, type FormAnswer } from "@/lib/form-answers";
import { KitBlur, useKitGate } from "@/components/kit-gate";

export default function AnswersPage() {
  const gate = useKitGate("/respostas-candidatura");
  const [cv, setCv] = useState<ResumeData | null>(null);
  const [ready, setReady] = useState(false);
  const [job, setJob] = useState<JobTarget>(emptyJobTarget());
  const [edits, setEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    setCv(readActiveResume());
    try {
      const saved = JSON.parse(localStorage.getItem(JOB_TARGET_KEY) || "null");
      if (saved?.version === 1) setJob(saved);
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(JOB_TARGET_KEY, JSON.stringify(job));
  }, [job, ready]);

  const answers = useMemo(() => {
    if (!cv) return [];
    const match = job.description.trim().length > 40 ? analyzeJob(job.description, job.title, cv) : null;
    return formAnswers({ cv, jobTitle: job.title, company: job.company, match });
  }, [cv, job]);

  const set = (k: "title" | "company" | "description", v: string) => {
    setJob({ ...job, [k]: v, updatedAt: new Date().toISOString() });
    setEdits({});
  };
  const hasCv = !!cv && !!(cv.role || cv.experiences.length || cv.skills.length);

  return (
    <main className="ra">
      <SiteHeader />
      <section className="ra-head shell">
        <h1>Respostas para as perguntas da candidatura</h1>
        <p>
          Informe a vaga e receba respostas montadas com o que está no seu currículo. Ajuste os trechos entre
          colchetes, revise e cole no formulário.
        </p>
      </section>
      {ready && !hasCv ? (
        <section className="ra-empty shell">
          <b>Primeiro, monte seu currículo</b>
          <p>As respostas são montadas a partir dele.</p>
          <Link className="btn btn-primary" href="/comecar">
            Criar meu currículo
          </Link>
        </section>
      ) : (
        <section className="ra-grid shell">
          <form className="ra-form" onSubmit={(e) => e.preventDefault()}>
            <label>
              <span>Cargo da vaga</span>
              <input value={job.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex.: Assistente Administrativo" />
            </label>
            <label>
              <span>Empresa</span>
              <input value={job.company} onChange={(e) => set("company", e.target.value)} placeholder="Ex.: Grupo Alfa" />
            </label>
            <label>
              <span>Anúncio da vaga (opcional)</span>
              <textarea
                rows={8}
                value={job.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Cole o texto da vaga para as respostas citarem os requisitos que você já tem."
              />
            </label>
            <p className="ra-note">Nada aqui é inventado: as respostas usam só o que está no seu currículo.</p>
          </form>
          <div className="ra-list">
            {answers.slice(0, 1).map(renderAnswer)}
            {answers.length > 1 && (
              <KitBlur
                kit={gate.kit}
                loading={gate.loading}
                onUnlock={gate.ask}
                cta={gate.cta}
                title={`Mais ${answers.length - 1} respostas prontas`}
                text="Por que quer trabalhar aqui, por que você é a pessoa certa, conquista, pretensão salarial e disponibilidade, montadas com o seu currículo e a vaga."
                height={300}
              >
                <div className="ra-list">{answers.slice(1).map(renderAnswer)}</div>
              </KitBlur>
            )}
          </div>
        </section>
      )}
      {gate.modal}
      <SiteFooter />
    </main>
  );

  function renderAnswer(a: FormAnswer) {

    const text = edits[a.id] ?? a.text;
              return (
                <article key={a.id} className="ra-item">
                  <header>
                    <h2>{a.question}</h2>
                    <CopyButton value={text} />
                  </header>
                  <p className="ra-hint">{a.hint}</p>
                  <textarea
                    rows={Math.min(9, Math.max(3, Math.ceil(text.length / 80)))}
                    value={text}
                    maxLength={a.max}
                    onChange={(e) => setEdits({ ...edits, [a.id]: e.target.value })}
                  />
                  <small className={/\[[^\]]+\]/.test(text) ? "ra-warn" : ""}>
                    {/\[[^\]]+\]/.test(text) ? "Troque os trechos entre colchetes antes de enviar. " : ""}
                    {text.length}
                    {a.max ? "/" + a.max : ""} caracteres
                  </small>
                </article>
              );
  }
}
