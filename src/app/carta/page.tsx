"use client";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { CheckoutModal } from "@/components/checkout-modal";
import { useAccess } from "@/lib/use-access";
import { trackUsage } from "@/lib/analytics";
import { ACCESS_DAYS, ACCESS_PRICE_LABEL } from "@/lib/billing";
import { ACTIVE_RESUME_KEY, type ResumeDocument } from "@/lib/resume";
import { readLibrary } from "@/lib/start";
import {
  emptyLetterOptions,
  letterBody,
  letterDate,
  loadLetter,
  saveLetter,
  type LetterOptions,
  type LetterTone,
} from "@/lib/cover-letter";

const TONES: { id: LetterTone; label: string; hint: string }[] = [
  { id: "formal", label: "Formal", hint: "Empresas tradicionais, escritórios, saúde" },
  { id: "direto", label: "Direto", hint: "Comércio, WhatsApp, vagas rápidas" },
  { id: "primeiro", label: "Primeiro emprego", hint: "Sem experiência registrada" },
];

export default function CoverLetterPage() {
  const { access, unlock } = useAccess();
  const [docs, setDocs] = useState<ResumeDocument[]>([]);
  const [doc, setDoc] = useState<ResumeDocument | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [options, setOptions] = useState<LetterOptions | null>(null);
  const [body, setBody] = useState("");
  const [edited, setEdited] = useState(false);
  const [copied, setCopied] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [fontSize, setFontSize] = useState(15);
  const paperRef = useRef<HTMLDivElement>(null);

  // Abre o currículo ativo (ou o mais recente) e a carta salva dele.
  useEffect(() => {
    const list = readLibrary();
    setDocs(list);
    const id = localStorage.getItem(ACTIVE_RESUME_KEY);
    const current = list.find((x) => x.id === id) || list[0] || null;
    setDoc(current);
    setLoaded(true);
    trackUsage("cover_letter_started");
  }, []);

  useEffect(() => {
    if (!doc) return;
    const saved = loadLetter(doc.id);
    const o = saved?.options || emptyLetterOptions(doc.cv);
    setOptions(o);
    setBody(saved?.body || letterBody(doc.cv, o));
    setEdited(!!saved?.edited);
  }, [doc]);

  useEffect(() => {
    if (doc && options) saveLetter(doc.id, { options, body, edited, updatedAt: new Date().toISOString() });
  }, [doc, options, body, edited]);

  // Ajusta o tamanho da letra para a carta caber em uma página.
  useLayoutEffect(() => {
    const el = paperRef.current;
    if (!el) return;
    let size = 15;
    el.style.setProperty("--lt-size", size + "px");
    while (el.scrollHeight > el.clientHeight + 1 && size > 11) {
      size -= 0.5;
      el.style.setProperty("--lt-size", size + "px");
    }
    setFontSize(size);
  }, [body, doc]);

  const update = (patch: Partial<LetterOptions>) => {
    if (!doc || !options) return;
    const next = { ...options, ...patch };
    setOptions(next);
    if (
      edited &&
      !confirm("Gerar o texto de novo vai substituir as mudanças que você fez na carta. Continuar?")
    )
      return;
    setBody(letterBody(doc.cv, next));
    setEdited(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const download = () => {
    if (!access.active) {
      setCheckoutOpen(true);
      return;
    }
    trackUsage("cover_letter_printed");
    const previous = document.title;
    document.title = "Carta-de-apresentacao-" + (doc?.cv.name || "CurriculosPRO").replace(/\s+/g, "-");
    setTimeout(() => {
      window.print();
      setTimeout(() => (document.title = previous), 500);
    }, 60);
  };

  if (loaded && !doc)
    return (
      <main className="lp lt">
        <SiteHeader />
        <section className="wrap lt-empty">
          <h1>Primeiro, crie seu currículo</h1>
          <p>
            A carta de apresentação é montada com os dados do seu currículo: nome, experiências e habilidades.
          </p>
          <Link className="btn btn-primary btn-lg" href="/comecar">
            Criar meu currículo
          </Link>
        </section>
      </main>
    );

  const cv = doc?.cv;
  const accent = doc?.accent || "#1553d6";
  const paragraphs = body.split(/\n{2,}/);

  return (
    <main className={"lp lt" + (!access.active && !access.loading ? " locked" : "")}>
      <SiteHeader />
      <div className="wrap lt-layout">
        <section className="lt-side" aria-label="Montar a carta">
          <Link href="/editor" className="st-back">
            ← Voltar ao currículo
          </Link>
          <h1>Carta de apresentação</h1>
          <p className="lt-lead">
            Preencha a vaga e nós escrevemos a carta com base no seu currículo. Depois, ajuste o texto do seu
            jeito.
          </p>
          {docs.length > 1 && (
            <label className="lt-field">
              <span>Currículo usado</span>
              <select
                value={doc?.id}
                onChange={(e) => {
                  const next = docs.find((x) => x.id === e.target.value) || null;
                  if (next) localStorage.setItem(ACTIVE_RESUME_KEY, next.id);
                  setDoc(next);
                }}
              >
                {docs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          {options && (
            <>
              <div className="lt-grid">
                <label className="lt-field">
                  <span>Vaga</span>
                  <input
                    value={options.jobTitle}
                    onChange={(e) => update({ jobTitle: e.target.value })}
                    placeholder="Ex.: Recepcionista"
                  />
                </label>
                <label className="lt-field">
                  <span>Empresa</span>
                  <input
                    value={options.company}
                    onChange={(e) => update({ company: e.target.value })}
                    placeholder="Ex.: Hotel Central"
                  />
                </label>
                <label className="lt-field">
                  <span>Nome do recrutador (se souber)</span>
                  <input
                    value={options.recruiter}
                    onChange={(e) => update({ recruiter: e.target.value })}
                    placeholder="Ex.: Sra. Marta"
                  />
                </label>
                <label className="lt-field">
                  <span>Onde viu a vaga</span>
                  <input
                    value={options.source}
                    onChange={(e) => update({ source: e.target.value })}
                    placeholder="Ex.: no LinkedIn, no Indeed"
                  />
                </label>
              </div>
              <fieldset className="lt-tones">
                <legend>Tom da carta</legend>
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={options.tone === t.id}
                    onClick={() => update({ tone: t.id })}
                  >
                    <b>{t.label}</b>
                    <small>{t.hint}</small>
                  </button>
                ))}
              </fieldset>
              <label className="lt-field">
                <span className="lt-body-head">
                  Texto da carta
                  <button type="button" onClick={() => update({ variant: options.variant + 1 })}>
                    ↻ Outra versão
                  </button>
                </span>
                <textarea
                  rows={16}
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value);
                    setEdited(true);
                  }}
                />
              </label>
              <p className="lt-tip">
                Dica: troque frases genéricas por um resultado seu (ex.: &ldquo;reduzi filas no caixa&rdquo;).
                Cartas curtas são mais lidas.
              </p>
              <div className="lt-actions">
                <button type="button" className="btn btn-primary btn-lg" onClick={download}>
                  {access.active ? "Baixar PDF" : "Baixar PDF · " + ACCESS_PRICE_LABEL}
                </button>
                <button type="button" className="btn btn-ghost btn-lg" onClick={copy}>
                  {copied ? "Texto copiado!" : "Copiar texto para e-mail"}
                </button>
              </div>
              {!access.active && !access.loading && (
                <p className="lt-tip">
                  O mesmo acesso de {ACCESS_DAYS} dias libera currículos e cartas em PDF.
                </p>
              )}
            </>
          )}
        </section>

        <section className="lt-preview" aria-label="Prévia da carta">
          <div
            className="lt-paper"
            ref={paperRef}
            style={{ ["--lt-accent" as string]: accent, ["--lt-size" as string]: fontSize + "px" }}
          >
            <header>
              <h2>{cv?.name || "Seu nome"}</h2>
              {cv?.role && <p>{cv.role}</p>}
              <small>{[cv?.phone, cv?.email, cv?.city].filter(Boolean).join("  ·  ")}</small>
            </header>
            <p className="lt-date">{letterDate(cv?.city || "")}</p>
            {options?.company && (
              <p className="lt-to">
                Para: {options.company}
                {options.jobTitle ? (
                  <>
                    <br />
                    Ref.: vaga de {options.jobTitle}
                  </>
                ) : null}
              </p>
            )}
            <div className="lt-text">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {!access.active && !access.loading && <div className="paperWatermark" aria-hidden="true" />}
          </div>
          <div className="lt-print-locked">
            <strong>CurriculosPRO</strong>
            <p>Para baixar esta carta em PDF, libere o download por {ACCESS_PRICE_LABEL}.</p>
          </div>
        </section>
      </div>
      <CheckoutModal
        open={checkoutOpen}
        access={access}
        returnTo="/carta"
        onClose={() => setCheckoutOpen(false)}
        onUnlocked={(until) => unlock(until)}
        onDownload={() => {
          setCheckoutOpen(false);
          download();
        }}
      />
    </main>
  );
}
