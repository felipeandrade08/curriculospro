"use client";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  ACTIVE_RESUME_KEY,
  JOB_TARGET_KEY,
  RESUME_LIBRARY_KEY,
  emptyJobTarget,
  type JobTarget,
  type ResumeDocument,
} from "@/lib/resume";
import { readLibrary } from "@/lib/start";
import { addRequirement, analyzeJob, type JobRequirement, type MatchKind } from "@/lib/job-match";
import { SiteHeader } from "@/components/site-header";
import { trackUsage } from "@/lib/analytics";
import { KitBlur, KitTag, useKitGate } from "@/components/kit-gate";
import { SiteFooter } from "@/components/site-footer";

const KIND: Record<MatchKind, string> = {
  license: "Habilitação",
  education: "Formação",
  language: "Idioma",
  course: "Curso",
  skill: "Competência",
  soft: "Comportamento",
};

function verdict(score: number) {
  if (score >= 75) return { text: "Combina bem", tone: "good" };
  if (score >= 50) return { text: "Combina em parte", tone: "mid" };
  return { text: "Precisa de ajustes", tone: "low" };
}

export default function JobMatchPage() {
  const [target, setTarget] = useState<JobTarget>(emptyJobTarget()),
    [docs, setDocs] = useState<ResumeDocument[]>([]),
    [docId, setDocId] = useState(""),
    [ready, setReady] = useState(false),
    [added, setAdded] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(JOB_TARGET_KEY) || "null");
      if (saved?.version === 1) setTarget(saved);
    } catch {}
    const lib = readLibrary();
    setDocs(lib);
    const active = localStorage.getItem(ACTIVE_RESUME_KEY);
    setDocId(lib.find((d) => d.id === active)?.id || lib[0]?.id || "");
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(JOB_TARGET_KEY, JSON.stringify(target));
  }, [target, ready]);

  const gate = useKitGate("/adaptar-vaga");
  const doc = docs.find((d) => d.id === docId) || null;
  const description = useDeferredValue(target.description),
    title = useDeferredValue(target.title);
  const result = useMemo(
    () => (doc && description.trim().length > 40 ? analyzeJob(description, title, doc.cv) : null),
    [doc, description, title],
  );

  const hasResult = !!result;
  useEffect(() => {
    if (hasResult) trackUsage("job_match_used");
  }, [hasResult]);

  const change = (key: "title" | "company" | "description", value: string) =>
    setTarget({ ...target, [key]: value, updatedAt: new Date().toISOString() });

  const saveDoc = (next: ResumeDocument) => {
    const lib = readLibrary().map((d) => (d.id === next.id ? next : d));
    localStorage.setItem(RESUME_LIBRARY_KEY, JSON.stringify(lib));
    localStorage.setItem(ACTIVE_RESUME_KEY, next.id);
    setDocs(lib);
  };
  const add = (r: JobRequirement) => {
    if (!doc) return;
    saveDoc({ ...doc, cv: addRequirement(doc.cv, r), updatedAt: new Date().toISOString() });
    setAdded((a) => [...a, r.label]);
  };
  const useRole = () => {
    if (!doc || !target.title.trim()) return;
    saveDoc({ ...doc, cv: { ...doc.cv, role: target.title.trim() }, updatedAt: new Date().toISOString() });
    setAdded((a) => [...a, "Objetivo: " + target.title.trim()]);
  };
  const openEditor = () => {
    if (doc) localStorage.setItem(ACTIVE_RESUME_KEY, doc.id);
    location.href = "/editor";
  };

  const has = result?.requirements.filter((r) => r.has) || [],
    missing = result?.requirements.filter((r) => !r.has) || [],
    v = result ? verdict(result.score) : null;

  return (
    <main className="jm">
      <SiteHeader active="curriculos" />
      <section className="jm-head shell">
        <h1>Seu currículo combina com a vaga?</h1>
        <p>
          Cole o anúncio da vaga. Mostramos o que ela pede, o que já está no seu currículo e o que dá para
          melhorar antes de enviar.
        </p>
      </section>

      {ready && !docs.length ? (
        <section className="jm-empty shell">
          <b>Você ainda não tem um currículo neste aparelho</b>
          <p>Crie o seu primeiro (leva poucos minutos) e volte aqui para comparar com a vaga.</p>
          <a className="btn btn-primary" href="/comecar">
            Criar meu currículo
          </a>
        </section>
      ) : (
        <section className="jm-grid shell">
          <div className="jm-input">
            {docs.length > 1 && (
              <label>
                <span>Currículo que você vai enviar</span>
                <select value={docId} onChange={(e) => setDocId(e.target.value)}>
                  {docs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title || d.cv.name || "Currículo sem nome"}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              <span>Cargo da vaga</span>
              <input
                value={target.title}
                onChange={(e) => change("title", e.target.value)}
                placeholder="Ex.: Auxiliar Administrativo"
              />
            </label>
            <label>
              <span>Anúncio da vaga</span>
              <textarea
                rows={14}
                value={target.description}
                onChange={(e) => change("description", e.target.value)}
                placeholder="Copie o texto da vaga (requisitos, atividades, diferenciais) do site, LinkedIn, Indeed ou WhatsApp e cole aqui."
              />
            </label>
            <p className="jm-note">
              O texto fica só neste aparelho. Nada é adicionado ao seu currículo sem você tocar em
              &ldquo;Eu tenho&rdquo;.
            </p>
          </div>

          <div className="jm-result" aria-live="polite">
            {!result || !v ? (
              <div className="jm-wait">
                <b>Cole a vaga ao lado</b>
                <p>A comparação aparece aqui na hora.</p>
              </div>
            ) : (
              <>
                <div className={"jm-score jm-" + v.tone}>
                  <div className="jm-num">
                    {result.requirements.length ? result.score : "–"}
                    {result.requirements.length > 0 && <small>%</small>}
                  </div>
                  <div>
                    <b>{result.requirements.length ? v.text : "Não reconhecemos requisitos"}</b>
                    <span>
                      {result.requirements.length
                        ? `Você já tem ${has.length} de ${result.requirements.length} itens que a vaga pede.`
                        : "Confira as palavras que a vaga repete abaixo."}
                    </span>
                  </div>
                </div>

                {missing.length > 0 && (
                  <section className="jm-list">
                    <h2>Falta no seu currículo</h2>
                    {missing.map((r) => (
                      <div key={r.key} className="jm-row miss">
                        <span className="jm-ic" aria-hidden>
                          !
                        </span>
                        <span className="jm-label">
                          <b>{r.label}</b>
                          <small>
                            {KIND[r.kind]}
                            {r.mentions > 1 ? `, citado ${r.mentions} vezes` : ""}
                          </small>
                        </span>
                        {r.addable ? (
                          <button type="button" onClick={() => (gate.kit ? add(r) : gate.ask())}>
                            Eu tenho, adicionar
                            {!gate.kit && <KitTag />}
                          </button>
                        ) : (
                          <button type="button" className="ghost" onClick={openEditor}>
                            Ajustar formação
                          </button>
                        )}
                      </div>
                    ))}
                    <p className="jm-note">Adicione só o que é verdade. Na entrevista eles vão perguntar.</p>
                  </section>
                )}

                {has.length > 0 && (
                  <section className="jm-list">
                    <h2>Você já tem</h2>
                    {has.map((r) => (
                      <div key={r.key} className="jm-row ok">
                        <span className="jm-ic" aria-hidden>
                          ✓
                        </span>
                        <span className="jm-label">
                          <b>{r.label}</b>
                          <small>{KIND[r.kind]}</small>
                        </span>
                      </div>
                    ))}
                  </section>
                )}

                {!result.requirements.length && result.repeated.length > 0 && (
                  <section className="jm-list">
                    <h2>Palavras que a vaga repete</h2>
                    <div className="jm-chips">
                      {result.repeated.map((w) => (
                        <span key={w}>{w}</span>
                      ))}
                    </div>
                    <p className="jm-note">Se fizerem sentido para você, use essas palavras no resumo e nas experiências.</p>
                  </section>
                )}

                {result.tips.length > 0 && (
                  <section className="jm-tips">
                    <h2>Dicas para esta vaga</h2>
                    <KitBlur
                      kit={gate.kit}
                      loading={gate.loading}
                      onUnlock={gate.ask}
                      cta={gate.cta}
                      title={`${result.tips.length} dica${result.tips.length > 1 ? "s" : ""} para esta vaga`}
                      text="Veja o que mudar no currículo para esta vaga e adicione com um toque o que você já tem."
                      height={120}
                    >
                    <ul>
                      {result.tips.map((t) => (
                        <li key={t.text}>
                          {t.text}
                          {t.action === "role" && (
                            <button type="button" onClick={useRole}>
                              Usar como objetivo
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                    </KitBlur>
                  </section>
                )}

                <div className="jm-foot">
                  {added.length > 0 && (
                    <span>
                      Adicionado: {added.join(", ")}
                    </span>
                  )}
                  <button type="button" className="btn btn-primary" onClick={openEditor}>
                    Abrir currículo no editor
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      )}
      {gate.modal}
      <SiteFooter />
    </main>
  );
}
