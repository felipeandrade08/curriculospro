"use client";
import { useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { FileArrowUp, WhatsappLogo, Lock, CheckCircle, Warning, XCircle } from "@phosphor-icons/react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KitBlur, useKitGate } from "@/components/kit-gate";
import { parseResume, type ImportLine, type ImportResult } from "@/lib/import/parse";
import { ImportError, readResumeFile } from "@/lib/import/read-file";
import { formatGrade, gradeResume, type Grade } from "@/lib/resume-grade";
import { JOB_TARGET_KEY, emptyJobTarget } from "@/lib/resume";
import { SERVICE_PRICE_LABEL } from "@/lib/billing";
import { trackUsage } from "@/lib/analytics";
import "./nota.css";

type Read = { name: string; lines: ImportLine[]; result: ImportResult; fileSize: number };
const FREE_REASONS = 2;
const WA = "https://wa.me/5516997434009?text=";

export default function GradePage() {
  const [read, setRead] = useState<Read | null>(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasted, setPasted] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [grade, setGrade] = useState<Grade | null>(null);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const gate = useKitGate("/nota");

  const onFile = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const lines = await readResumeFile(file);
      setRead({ name: file.name, lines, result: parseResume(lines), fileSize: file.size });
      setGrade(null);
    } catch (e) {
      setError(e instanceof ImportError ? e.message : "Não foi possível ler esse arquivo. Tente colar o texto do currículo.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void onFile(e.dataTransfer.files?.[0]);
  };

  const current: Read | null =
    pasteMode && pasted.trim().length > 80
      ? (() => {
          const lines = pasted.split("\n").map((text) => ({ text }));
          return { name: "texto colado", lines, result: parseResume(lines), fileSize: pasted.length };
        })()
      : pasteMode
        ? null
        : read;
  const jobOk = desc.trim().length >= 80;
  const ready = !!current && jobOk;

  const run = () => {
    if (!current || !jobOk) return;
    const g = gradeResume(current, { title, description: desc });
    setGrade(g);
    trackUsage("grade_used");
    window.setTimeout(() => document.getElementById("nt-result")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  // Leva o currículo lido para o editor e a vaga para "Adaptar à vaga".
  const adjust = () => {
    if (!current) return;
    try {
      localStorage.setItem(JOB_TARGET_KEY, JSON.stringify({ ...emptyJobTarget(), title, description: desc }));
      sessionStorage.setItem("curriculospro.importLines", JSON.stringify({ lines: current.lines, name: current.name }));
      sessionStorage.setItem("curriculospro.afterImport", "/adaptar-vaga");
    } catch {}
    location.href = "/importar";
  };

  const waText = grade
    ? `Olá! Tirei nota ${formatGrade(grade.score)} no meu currículo${title.trim() ? " para a vaga de " + title.trim() : ""}. Quero que vocês ajustem para mim.`
    : "Olá! Quero que vocês ajustem meu currículo para uma vaga.";

  return (
    <main className="nt">
      <SiteHeader />
      <section className="shell nt-hero">
        <h1>
          Cole a vaga.
          <br />
          <span>Veja a nota do seu currículo.</span>
        </h1>
        <p>
          Uma nota de 0 a 10 para o seu currículo nesta vaga, com o motivo de cada ponto perdido. Grátis, sem
          cadastro, e o arquivo não sai do seu aparelho.
        </p>
      </section>

      <section className="shell nt-form">
        <div className="nt-card">
          <h2>
            <span className="nt-step">1</span> Seu currículo
          </h2>
          {!pasteMode ? (
            <>
              <div
                className={"nt-drop" + (dragging ? " on" : "") + (read ? " done" : "")}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => input.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
              >
                <FileArrowUp size={34} weight="duotone" aria-hidden="true" />
                <b>{busy ? "Lendo o arquivo…" : read ? read.name : "Enviar currículo em PDF ou Word"}</b>
                <small>{read ? "Toque para trocar o arquivo" : "Toque aqui ou arraste o arquivo"}</small>
              </div>
              <input
                ref={input}
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                hidden
                onChange={(e) => void onFile(e.target.files?.[0])}
              />
              <button type="button" className="nt-link" onClick={() => setPasteMode(true)}>
                Prefiro colar o texto do currículo
              </button>
            </>
          ) : (
            <>
              <textarea
                className="nt-text"
                rows={8}
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                placeholder="Cole aqui todo o texto do seu currículo"
                aria-label="Texto do currículo"
              />
              <button type="button" className="nt-link" onClick={() => setPasteMode(false)}>
                Prefiro enviar o arquivo
              </button>
            </>
          )}
          {error && <p className="nt-error">{error}</p>}
        </div>

        <div className="nt-card">
          <h2>
            <span className="nt-step">2</span> A vaga
          </h2>
          <label className="nt-field">
            <span>Cargo da vaga</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Auxiliar administrativo" />
          </label>
          <label className="nt-field">
            <span>Descrição da vaga</span>
            <textarea
              className="nt-text"
              rows={8}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Copie e cole aqui o anúncio da vaga: requisitos, atividades, o que a empresa pede."
            />
          </label>
          {!jobOk && desc.trim().length > 0 && <small className="nt-hint">Cole o anúncio completo para uma nota mais certa.</small>}
        </div>

        <button type="button" className="btn btn-primary nt-go" disabled={!ready} onClick={run}>
          Ver a nota do meu currículo
        </button>
      </section>

      {grade && (
        <section id="nt-result" className="shell nt-result">
          <div className={"nt-score " + grade.tone}>
            <span className="nt-label">Nota para esta vaga</span>
            <div className="nt-num">
              <b>{formatGrade(grade.score)}</b>
              <span>de 10</span>
            </div>
            <span className="nt-verdict">{grade.verdict}</span>
            <div className="nt-bar" aria-hidden="true">
              <i style={{ width: grade.score * 10 + "%" }} />
            </div>
            <ul className="nt-sum">
              {grade.missingTerms.length > 0 && (
                <li>
                  <XCircle size={20} weight="fill" aria-hidden="true" /> {grade.missingTerms.length}{" "}
                  {grade.missingTerms.length === 1 ? "termo da vaga ausente" : "termos da vaga ausentes"}
                </li>
              )}
              {grade.tasks.total > grade.tasks.withNumber && (
                <li>
                  <Warning size={20} weight="fill" aria-hidden="true" /> {grade.tasks.total - grade.tasks.withNumber}{" "}
                  {grade.tasks.total - grade.tasks.withNumber === 1 ? "tarefa sem número" : "tarefas sem número"}
                </li>
              )}
              {!grade.reasons.length && (
                <li>
                  <CheckCircle size={20} weight="fill" aria-hidden="true" /> Nada importante faltando
                </li>
              )}
            </ul>
          </div>

          <div className="nt-reasons">
            <h2>Por que você perdeu pontos</h2>
            {grade.reasons.slice(0, FREE_REASONS).map((r) => (
              <Reason key={r.id} r={r} />
            ))}
            {grade.reasons.length > FREE_REASONS && (
              <KitBlur
                kit={gate.kit}
                loading={gate.loading}
                onUnlock={gate.ask}
                cta={gate.cta}
                title={`Mais ${grade.reasons.length - FREE_REASONS} ${grade.reasons.length - FREE_REASONS === 1 ? "motivo" : "motivos"} e o ajuste para a vaga`}
                text="Veja todos os pontos perdidos e ajuste o currículo para esta vaga com um toque, sem inventar nada."
                height={220}
              >
                {grade.reasons.slice(FREE_REASONS).map((r) => (
                  <Reason key={r.id} r={r} />
                ))}
              </KitBlur>
            )}
          </div>

          <div className="nt-next">
            {gate.kit ? (
              <button type="button" className="btn btn-primary" onClick={adjust}>
                Ajustar meu currículo para esta vaga
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={gate.ask} disabled={gate.loading}>
                <Lock size={18} weight="bold" aria-hidden="true" /> Ajustar meu currículo para esta vaga
              </button>
            )}
            <a className="nt-wa" href={WA + encodeURIComponent(waText)} target="_blank" rel="noopener noreferrer" onClick={() => trackUsage("whatsapp_click")}>
              <WhatsappLogo size={22} weight="fill" aria-hidden="true" /> Sem tempo? A gente ajusta para você por {SERVICE_PRICE_LABEL}
            </a>
            <p className="nt-note">
              A nota é uma estimativa feita pelo nosso sistema, parecida com a triagem automática de muitas
              empresas. Cada empresa usa critérios próprios. <Link href="/teste-robo">Veja também o Teste do robô</Link>.
            </p>
          </div>
        </section>
      )}
      {gate.modal}
      <SiteFooter />
    </main>
  );
}

function Reason({ r }: { r: Grade["reasons"][number] }) {
  return (
    <div className="nt-reason">
      <div className="nt-reason-head">
        <b>{r.title}</b>
        <span>−{formatGrade(Math.max(0.1, r.lost))}</span>
      </div>
      <p>{r.detail}</p>
      {r.items && r.items.length > 0 && (
        <div className="nt-chips">
          {r.items.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
