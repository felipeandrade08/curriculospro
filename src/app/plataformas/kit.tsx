"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { readActiveResume } from "@/lib/active-resume";
import type { ResumeData } from "@/lib/resume";
import { googleJobs, platformBySlug } from "@/lib/platforms";
import { CopyButton } from "@/components/copy-button";

const clean = (s: string) => s.replace(/\(a\)|\(o\)/g, "").replace(/\s+/g, " ").trim();
const bullets = (d: string) =>
  d
    .split("\n")
    .map((l) => l.replace(/^[•\-–*]\s*/, "").trim())
    .filter(Boolean);

/** Dados do currículo prontos para colar nos campos da plataforma + busca de vagas. */
export function PlatformKit({ slug }: { slug: string }) {
  const p = platformBySlug(slug)!;
  const [cv, setCv] = useState<ResumeData | null>(null);
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    const r = readActiveResume();
    setCv(r);
    setRole(clean(r?.role || ""));
    setCity(clean((r?.city || "").split(",")[0]));
    setReady(true);
  }, []);

  const hasCv = !!cv && !!(cv.role || cv.experiences.length || cv.skills.length);
  const exps = cv?.experiences.filter((x) => x.title) || [];
  const edu = cv?.education.filter((x) => x.title) || [];

  return (
    <div className="pk">
      <section className="pk-card pk-search">
        <h2>
          Vagas para você {p.em} {p.name}
        </h2>
        <div className="pk-searchrow">
          <label>
            <span>Cargo</span>
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex.: Auxiliar Administrativo" />
          </label>
          <label>
            <span>Cidade</span>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex.: Campinas" />
          </label>
        </div>
        <div className="pk-actions">
          <a
            className="btn btn-primary"
            href={role.trim() ? p.search(role.trim(), city.trim()) : p.home}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver vagas {p.em} {p.name}
          </a>
          {role.trim() && (
            <a className="btn btn-ghost" href={googleJobs(role.trim(), city.trim())} target="_blank" rel="noopener noreferrer">
              Ver no Google Vagas
            </a>
          )}
        </div>
      </section>

      {slug === "linkedin" ? (
        <section className="pk-card">
          <h2>Seu perfil pronto para copiar</h2>
          <p>Título, Sobre, experiências e competências gerados a partir do seu currículo.</p>
          <Link className="btn btn-primary" href="/linkedin">
            Abrir o gerador de perfil do LinkedIn
          </Link>
        </section>
      ) : !ready ? null : !hasCv ? (
        <section className="pk-card">
          <h2>Seus dados prontos para copiar</h2>
          <p>Monte seu currículo primeiro e volte aqui: cada campo aparece pronto para colar {p.em} {p.name}.</p>
          <Link className="btn btn-primary" href="/comecar">
            Criar meu currículo
          </Link>
        </section>
      ) : (
        cv && (
          <section className="pk-card">
            <h2>Seus dados prontos para copiar</h2>
            <p>Copie cada bloco e cole no campo correspondente {p.em === "na" ? "da" : "do"} {p.name}.</p>
            {cv.summary.trim() && (
              <div className="pk-field">
                <header>
                  <b>Resumo / objetivo profissional</b>
                  <CopyButton value={cv.summary.trim()} />
                </header>
                <p>{cv.summary.trim()}</p>
              </div>
            )}
            {exps.map((x, i) => {
              const text = bullets(x.description)
                .map((b) => "• " + b.replace(/^•\s*/, ""))
                .join("\n");
              return (
                <div key={i} className="pk-field">
                  <header>
                    <b>
                      Experiência: {clean(x.title)}
                      {x.subtitle ? " — " + clean(x.subtitle) : ""}
                    </b>
                    {text && <CopyButton value={text} label="Copiar atividades" />}
                  </header>
                  {x.period && <small>{x.period}</small>}
                  {text ? <pre>{text}</pre> : <small>Sem atividades descritas. Complete no editor.</small>}
                </div>
              );
            })}
            {cv.skills.length > 0 && (
              <div className="pk-field">
                <header>
                  <b>Habilidades</b>
                  <CopyButton value={cv.skills.join(", ")} label="Copiar todas" />
                </header>
                <div className="pk-chips">
                  {cv.skills.map((s) => (
                    <CopyButton key={s} value={s} label={s} className="pk-chip" />
                  ))}
                </div>
                <small>Toque em cada uma para copiar e adicionar separadamente.</small>
              </div>
            )}
            {edu.length > 0 && (
              <div className="pk-field">
                <header>
                  <b>Formação</b>
                </header>
                {edu.map((x, i) => (
                  <div key={i} className="pk-line">
                    <span>
                      {clean(x.title)}
                      {x.subtitle ? " — " + clean(x.subtitle) : ""}
                      {x.period ? " (" + x.period + ")" : ""}
                    </span>
                    <CopyButton value={clean(x.title)} />
                  </div>
                ))}
              </div>
            )}
            {cv.courses.length > 0 && (
              <div className="pk-field">
                <header>
                  <b>Cursos</b>
                  <CopyButton value={cv.courses.join("\n")} label="Copiar todos" />
                </header>
                <pre>{cv.courses.join("\n")}</pre>
              </div>
            )}
            {cv.languages.length > 0 && (
              <div className="pk-field">
                <header>
                  <b>Idiomas</b>
                </header>
                <p>{cv.languages.join(" · ")}</p>
              </div>
            )}
          </section>
        )
      )}

      <section className="pk-card pk-next">
        <h2>Perguntas da candidatura</h2>
        <p>
          Muitas vagas pedem respostas como “Por que você quer trabalhar aqui?” e “Qual sua pretensão
          salarial?”. Monte as suas a partir do currículo e da vaga.
        </p>
        <Link className="btn btn-ghost" href="/respostas-candidatura">
          Montar minhas respostas
        </Link>
      </section>
    </div>
  );
}
