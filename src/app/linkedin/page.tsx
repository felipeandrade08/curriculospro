"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { readActiveResume } from "@/lib/active-resume";
import type { ResumeData } from "@/lib/resume";
import { ABOUT_MAX, HEADLINE_MAX, aboutText, experienceTexts, headlines } from "@/lib/linkedin";
import { trackUsage } from "@/lib/analytics";

const CHECK_KEY = "curriculospro.linkedinCheck.v1";
const CHECKS = [
  ["foto", "Foto de rosto, com fundo neutro e boa luz"],
  ["capa", "Imagem de capa (pode ser uma cor lisa ou uma foto da sua área)"],
  ["titulo", "Título com o cargo que você procura e 2 ou 3 habilidades"],
  ["sobre", "Seção Sobre preenchida"],
  ["exp", "Experiências com as atividades, iguais às do currículo"],
  ["comp", "Pelo menos 5 competências adicionadas"],
  ["local", "Cidade e estado corretos (recrutadores filtram por local)"],
  ["opentowork", "“Tenho interesse” ligado com os cargos que você busca"],
  ["url", "URL personalizada (linkedin.com/in/seu-nome)"],
] as const;

export default function LinkedinPage() {
  const [cv, setCv] = useState<ResumeData | null>(null);
  const [ready, setReady] = useState(false);
  const [style, setStyle] = useState<"texto" | "topicos">("texto");
  const [about, setAbout] = useState("");
  const [copied, setCopied] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const r = readActiveResume();
    setCv(r);
    try {
      setChecks(JSON.parse(localStorage.getItem(CHECK_KEY) || "{}"));
    } catch {}
    setReady(true);
    if (r) trackUsage("linkedin_used");
  }, []);
  useEffect(() => {
    if (cv) setAbout(aboutText(cv, style));
  }, [cv, style]);

  const copy = async (value: string, id: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
      window.setTimeout(() => setCopied(""), 2000);
    } catch {}
  };
  const toggle = (id: string) => {
    const next = { ...checks, [id]: !checks[id] };
    setChecks(next);
    try {
      localStorage.setItem(CHECK_KEY, JSON.stringify(next));
    } catch {}
  };
  const CopyBtn = ({ value, id }: { value: string; id: string }) => (
    <button type="button" className="li-copy" onClick={() => copy(value, id)}>
      {copied === id ? "Copiado ✓" : "Copiar"}
    </button>
  );

  const hasContent = !!cv && !!(cv.role || cv.experiences.length || cv.skills.length);
  const heads = cv ? headlines(cv) : [];
  const exps = cv ? experienceTexts(cv) : [];
  const done = CHECKS.filter(([id]) => checks[id]).length;

  return (
    <main className="li">
      <SiteHeader />
      <section className="li-head shell">
        <h1>Seu LinkedIn pronto a partir do currículo</h1>
        <p>
          Copie o título, o texto do Sobre e as experiências e cole no seu perfil. Recrutadores procuram
          candidatos no LinkedIn todos os dias, e um perfil completo aparece mais nas buscas.
        </p>
      </section>

      {ready && !hasContent ? (
        <section className="li-empty shell">
          <b>Primeiro, monte seu currículo</b>
          <p>O LinkedIn é montado com as informações do currículo deste aparelho.</p>
          <Link className="btn btn-primary" href="/comecar">
            Criar meu currículo
          </Link>
        </section>
      ) : (
        cv && (
          <section className="li-grid shell">
            <div className="li-main">
              <article className="li-card">
                <header>
                  <h2>Título</h2>
                  <span>Aparece embaixo do seu nome e nas buscas. Escolha um.</span>
                </header>
                {heads.map((h, i) => (
                  <div key={h} className="li-row">
                    <p>{h}</p>
                    <small>
                      {h.length}/{HEADLINE_MAX}
                    </small>
                    <CopyBtn value={h} id={"h" + i} />
                  </div>
                ))}
              </article>

              <article className="li-card">
                <header>
                  <h2>Sobre</h2>
                  <div className="li-toggle" role="tablist" aria-label="Estilo do texto">
                    <button type="button" role="tab" aria-selected={style === "texto"} onClick={() => setStyle("texto")}>
                      Texto corrido
                    </button>
                    <button type="button" role="tab" aria-selected={style === "topicos"} onClick={() => setStyle("topicos")}>
                      Em tópicos
                    </button>
                  </div>
                </header>
                <textarea rows={12} value={about} onChange={(e) => setAbout(e.target.value.slice(0, ABOUT_MAX))} />
                <div className="li-foot">
                  <small>
                    {about.length}/{ABOUT_MAX} caracteres. Pode editar aqui antes de copiar.
                  </small>
                  <CopyBtn value={about} id="about" />
                </div>
              </article>

              {exps.length > 0 && (
                <article className="li-card">
                  <header>
                    <h2>Experiências</h2>
                    <span>Em Perfil, toque em + na seção Experiência e cole a descrição de cada uma.</span>
                  </header>
                  {exps.map((x, i) => (
                    <div key={i} className="li-exp">
                      <div>
                        <b>{x.title}</b>
                        <span>{[x.company, x.period].filter(Boolean).join(" · ")}</span>
                      </div>
                      {x.text ? (
                        <>
                          <pre>{x.text}</pre>
                          <CopyBtn value={x.text} id={"e" + i} />
                        </>
                      ) : (
                        <small>Sem atividades no currículo. Descreva o que você fazia no editor.</small>
                      )}
                    </div>
                  ))}
                </article>
              )}

              {cv.skills.length > 0 && (
                <article className="li-card">
                  <header>
                    <h2>Competências</h2>
                    <span>Adicione uma por uma em Perfil → Competências. Fixe as 3 mais importantes no topo.</span>
                  </header>
                  <div className="li-chips">
                    {cv.skills.slice(0, 15).map((s, i) => (
                      <button key={s} type="button" onClick={() => copy(s, "s" + i)}>
                        {copied === "s" + i ? "Copiado ✓" : s}
                      </button>
                    ))}
                  </div>
                </article>
              )}
            </div>

            <aside className="li-side">
              <h2>Checklist do perfil</h2>
              <p>
                {done} de {CHECKS.length} feitos
              </p>
              <ul>
                {CHECKS.map(([id, label]) => (
                  <li key={id}>
                    <label>
                      <input type="checkbox" checked={!!checks[id]} onChange={() => toggle(id)} />
                      <span>{label}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <p className="li-tip">
                Depois de pronto, coloque o link do seu LinkedIn no currículo, junto com o telefone e o
                e-mail.
              </p>
              <Link href="/editor">Abrir o currículo no editor</Link>
            </aside>
          </section>
        )
      )}
      <SiteFooter />
    </main>
  );
}
