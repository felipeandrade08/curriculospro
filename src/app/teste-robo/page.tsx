"use client";
import { useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { parseResume, type ImportLine, type ImportResult } from "@/lib/import/parse";
import { ImportError, readResumeFile } from "@/lib/import/read-file";
import { robotChecks, robotScore, type Check } from "@/lib/robot-check";
import { trackUsage } from "@/lib/analytics";

type Done = { name: string; lines: ImportLine[]; result: ImportResult; checks: Check[]; score: number };

export default function RobotTestPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showText, setShowText] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const run = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    setError("");
    setDone(null);
    try {
      const lines = await readResumeFile(file);
      const result = parseResume(lines);
      const checks = robotChecks(lines, result, file.size);
      setDone({ name: file.name, lines, result, checks, score: robotScore(checks) });
      trackUsage("robot_test_used");
      window.setTimeout(() => document.getElementById("rb-result")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e) {
      setError(
        e instanceof ImportError
          ? e.message + " Para um robô, isso significa que o currículo chega vazio."
          : "Não foi possível ler esse arquivo. Tente exportar de novo em PDF.",
      );
    } finally {
      setBusy(false);
    }
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void run(e.dataTransfer.files?.[0]);
  };
  const fix = () => {
    if (!done) return;
    try {
      sessionStorage.setItem("curriculospro.importLines", JSON.stringify({ lines: done.lines, name: done.name }));
    } catch {}
    location.href = "/importar";
  };

  const verdict = !done
    ? null
    : done.score >= 85
      ? { tone: "good", text: "Seu currículo é bem lido" }
      : done.score >= 60
        ? { tone: "mid", text: "Lido em parte: dá para melhorar" }
        : { tone: "low", text: "O robô tem dificuldade para ler" };
  const cv = done?.result.cv;

  return (
    <main className="rb">
      <SiteHeader />
      <section className="rb-head shell">
        <h1>O robô de seleção consegue ler seu currículo?</h1>
        <p>
          Muitas empresas usam sistemas que leem o currículo antes de uma pessoa. Se o sistema não entende o
          arquivo, você pode ser descartado sem ninguém ver. Envie o seu e veja o que uma leitura automática
          consegue extrair.
        </p>
      </section>

      <section className="shell">
        <div
          className={"rb-drop" + (dragging ? " on" : "")}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <b>{busy ? "Lendo seu currículo…" : "Envie seu currículo em PDF ou Word"}</b>
          <p>O arquivo é lido aqui no seu aparelho e não é enviado para nenhum servidor.</p>
          <button type="button" className="btn btn-primary btn-lg" disabled={busy} onClick={() => input.current?.click()}>
            {done ? "Testar outro arquivo" : "Escolher arquivo"}
          </button>
          <input
            ref={input}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            hidden
            onChange={(e) => {
              void run(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
        {error && (
          <div className="rb-error" role="alert">
            <b>O robô não conseguiu ler este arquivo</b>
            <p>{error}</p>
            <Link className="btn btn-primary" href="/comecar">
              Fazer um currículo que os robôs leem
            </Link>
          </div>
        )}
      </section>

      {done && verdict && cv && (
        <section id="rb-result" className="rb-result shell">
          <div className={"jm-score jm-" + verdict.tone}>
            <div className="jm-num">
              {done.score}
              <small>%</small>
            </div>
            <div>
              <b>{verdict.text}</b>
              <span>{done.name}</span>
            </div>
          </div>

          <div className="rb-grid">
            <div className="rb-checks">
              <h2>O que conferimos</h2>
              {done.checks.map((c) => (
                <div key={c.id} className={"rb-check " + (c.ok === true ? "ok" : c.ok === "warn" ? "warn" : "bad")}>
                  <span aria-hidden>{c.ok === true ? "✓" : "!"}</span>
                  <div>
                    <b>{c.title}</b>
                    <p>{c.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rb-seen">
              <h2>O que o robô entendeu</h2>
              <dl>
                <dt>Cargo</dt>
                <dd>{cv.role || "—"}</dd>
                <dt>Experiências</dt>
                <dd>
                  {cv.experiences.filter((x) => x.title || x.subtitle).length ? (
                    <ul>
                      {cv.experiences
                        .filter((x) => x.title || x.subtitle)
                        .map((x, i) => (
                          <li key={i}>
                            {[x.title, x.subtitle].filter(Boolean).join(" — ")}
                            {x.period ? " (" + x.period + ")" : ""}
                          </li>
                        ))}
                    </ul>
                  ) : (
                    "—"
                  )}
                </dd>
                <dt>Formação</dt>
                <dd>{cv.education.filter((x) => x.title).map((x) => x.title).join("; ") || "—"}</dd>
                <dt>Habilidades</dt>
                <dd>{cv.skills.join(", ") || "—"}</dd>
                <dt>Idiomas</dt>
                <dd>{cv.languages.join(", ") || "—"}</dd>
              </dl>
              <button type="button" className="linkish" onClick={() => setShowText(!showText)}>
                {showText ? "Esconder o texto lido" : "Ver o texto exatamente como foi lido"}
              </button>
              {showText && <pre className="rb-raw">{done.lines.map((l) => l.text).join("\n")}</pre>}
            </div>
          </div>

          <div className="rb-cta">
            <div>
              <b>Corrija em poucos minutos</b>
              <p>
                Importamos o que foi lido para um modelo em uma coluna, com títulos padrão que os sistemas
                entendem. Você revisa, ajusta e baixa.
              </p>
            </div>
            <button type="button" className="btn btn-primary btn-lg" onClick={fix}>
              Arrumar meu currículo
            </button>
          </div>
          <p className="rb-note">
            Este teste simula uma leitura automática comum. Cada empresa usa um sistema diferente, então use o
            resultado como orientação.
          </p>
        </section>
      )}
      <SiteFooter />
    </main>
  );
}
