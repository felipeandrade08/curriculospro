"use client";
import { useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle,
  ClipboardText,
  FileArrowUp,
  GraduationCap,
  LockSimple,
  Plus,
  Sparkle,
  Trash,
  User,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { SiteHeader } from "@/components/site-header";
import { ResumeThumb } from "@/components/resume-view";
import { parseResume, type ImportLine } from "@/lib/import/parse";
import { ImportError, readResumeFile } from "@/lib/import/read-file";
import { defaultOrder, emptyResumeData, uid, type ResumeData, type ResumeItem } from "@/lib/resume";
import { TEMPLATES, templateMeta, type TemplateId } from "@/lib/templates";
import { mergeIntoProfile, saveNewResume } from "@/lib/start";
import { trackUsage } from "@/lib/analytics";

type Stage = "upload" | "review";

export default function ImportResumePage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("upload");
  const [cv, setCv] = useState<ResumeData>(emptyResumeData);
  const [unmatched, setUnmatched] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [pasted, setPasted] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [template, setTemplate] = useState<TemplateId>("essential");
  const [saveProfile, setSaveProfile] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = (lines: ImportLine[] | string, source: string) => {
    const result = parseResume(lines);
    setCv({ ...result.cv, photo: "" });
    setUnmatched(result.unmatched.filter((x) => x.length > 2));
    setFileName(source);
    setStage("review");
    window.scrollTo({ top: 0 });
  };

  // Vindo do "Teste do robô": o arquivo já foi lido lá, então abre direto a revisão.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("curriculospro.importLines");
      if (!raw) return;
      sessionStorage.removeItem("curriculospro.importLines");
      const saved = JSON.parse(raw) as { lines: ImportLine[]; name: string };
      if (Array.isArray(saved.lines) && saved.lines.length) load(saved.lines, saved.name || "currículo");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFile = async (file?: File | null) => {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      load(await readResumeFile(file), file.name);
    } catch (e) {
      setError(
        e instanceof ImportError ? e.message : "Não foi possível ler esse arquivo. Tente colar o texto.",
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    onFile(e.dataTransfer.files?.[0]);
  };

  const create = () => {
    try {
      const meta = templateMeta(template);
      saveNewResume(cv, {
        title: cv.name ? "Currículo de " + cv.name.split(" ")[0] : "Currículo importado",
        template,
        accent: meta.accent,
      });
      if (saveProfile) mergeIntoProfile(cv);
      trackUsage("resume_imported");
      router.push("/editor");
    } catch {
      setError("Não foi possível salvar neste navegador. Verifique se há espaço livre e tente de novo.");
    }
  };

  if (stage === "upload")
    return (
      <main className="lp st">
        <SiteHeader />
        <section className="wrap st-head">
          <Link href="/comecar" className="st-back">
            <ArrowLeft size={16} /> Outras formas de começar
          </Link>
          <h1>Importe o currículo que você já tem</h1>
          <p>
            Lemos o arquivo, separamos cada parte nos campos certos e você só confere e atualiza. Funciona com
            PDF, Word (.docx) e texto.
          </p>
        </section>
        <section className="wrap im-upload">
          <div
            className={"im-drop" + (dragging ? " is-over" : "") + (busy ? " is-busy" : "")}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <FileArrowUp size={44} weight="duotone" aria-hidden="true" />
            <h2>{busy ? "Lendo seu currículo…" : "Arraste o arquivo para cá"}</h2>
            <p>PDF, DOCX ou TXT · até 8 MB</p>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              Escolher arquivo
            </button>
            <input
              ref={inputRef}
              type="file"
              hidden
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <small>
              <LockSimple size={14} aria-hidden="true" /> O arquivo é lido aqui no seu aparelho e não é
              enviado para nenhum servidor.
            </small>
          </div>
          <div className="im-paste">
            <label htmlFor="paste">
              <ClipboardText size={20} aria-hidden="true" /> Ou cole o texto do currículo
            </label>
            <textarea
              id="paste"
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder={"Abra seu currículo, selecione tudo (Ctrl+A), copie (Ctrl+C) e cole aqui."}
              rows={12}
            />
            <button
              type="button"
              className="btn btn-ghost"
              disabled={pasted.trim().length < 30}
              onClick={() => load(pasted, "Texto colado")}
            >
              Organizar este texto
            </button>
          </div>
          {error && (
            <p className="im-error" role="alert">
              <WarningCircle size={20} aria-hidden="true" /> {error}
            </p>
          )}
        </section>
        <section className="wrap im-howto" aria-label="Como funciona">
          <ol>
            <li>
              <b>Envie o arquivo</b> que você já usa hoje, mesmo que esteja desatualizado.
            </li>
            <li>
              <b>Confira os campos</b>: nome, experiências, formação, cursos e habilidades já vêm separados.
            </li>
            <li>
              <b>Escolha um modelo</b> e termine no editor, com sugestões para a sua profissão.
            </li>
          </ol>
        </section>
      </main>
    );

  return (
    <main className="lp st">
      <SiteHeader />
      <section className="wrap st-head st-head-tight">
        <button type="button" className="st-back" onClick={() => setStage("upload")}>
          <ArrowLeft size={16} /> Importar outro arquivo
        </button>
        <h1>Confira o que encontramos</h1>
        <p>
          Lemos <b>{fileName}</b>. Corrija o que precisar — no editor você ainda pode mudar tudo.
        </p>
        <Found cv={cv} />
      </section>
      <div className="wrap im-review">
        <div className="im-form">
          <Card icon={<User size={20} />} title="Dados pessoais">
            <div className="im-grid">
              <Field label="Nome completo" value={cv.name} onChange={(name) => setCv({ ...cv, name })} />
              <Field label="Cargo ou área" value={cv.role} onChange={(role) => setCv({ ...cv, role })} />
              <Field label="E-mail" value={cv.email} onChange={(email) => setCv({ ...cv, email })} />
              <Field
                label="Telefone / WhatsApp"
                value={cv.phone}
                onChange={(phone) => setCv({ ...cv, phone })}
              />
              <Field label="Cidade" value={cv.city} onChange={(city) => setCv({ ...cv, city })} />
            </div>
            <label className="im-field">
              <span>Objetivo ou resumo</span>
              <textarea
                rows={3}
                value={cv.summary}
                onChange={(e) => setCv({ ...cv, summary: e.target.value })}
              />
            </label>
          </Card>

          <Card icon={<Briefcase size={20} />} title="Experiências" count={cv.experiences.length}>
            <Items
              items={cv.experiences}
              labels={["Cargo", "Empresa", "Período", "O que você fazia"]}
              empty="Não encontramos experiências. Se for seu primeiro emprego, tudo bem: no editor mostramos como valorizar estudos e atividades."
              onChange={(experiences) => setCv({ ...cv, experiences })}
              addLabel="Adicionar experiência"
            />
          </Card>

          <Card icon={<GraduationCap size={20} />} title="Formação" count={cv.education.length}>
            <Items
              items={cv.education}
              labels={["Curso", "Instituição", "Período ou conclusão", "Observações"]}
              empty="Nenhuma formação encontrada."
              onChange={(education) => setCv({ ...cv, education })}
              addLabel="Adicionar formação"
            />
          </Card>

          <Card icon={<Sparkle size={20} />} title="Habilidades, idiomas e cursos">
            <Chips
              label="Habilidades"
              values={cv.skills}
              onChange={(skills) => setCv({ ...cv, skills })}
              placeholder="Ex.: Atendimento ao cliente"
            />
            <Chips
              label="Idiomas"
              values={cv.languages}
              onChange={(languages) => setCv({ ...cv, languages })}
              placeholder="Ex.: Inglês — Intermediário"
            />
            <Chips
              label="Cursos"
              values={cv.courses}
              onChange={(courses) => setCv({ ...cv, courses })}
              placeholder="Ex.: SENAI — Excel — 20h"
            />
          </Card>

          {unmatched.length > 0 && (
            <Card icon={<WarningCircle size={20} />} title="Trechos que não soubemos encaixar" tone="warn">
              <p className="im-hint">Escolha onde cada trecho deve ir, ou descarte.</p>
              <ul className="im-left">
                {unmatched.map((text, i) => {
                  const drop = () => setUnmatched(unmatched.filter((_, j) => j !== i));
                  return (
                    <li key={i + text}>
                      <span>{text}</span>
                      <div>
                        <button
                          type="button"
                          onClick={() => (
                            setCv({ ...cv, summary: (cv.summary ? cv.summary + " " : "") + text }),
                            drop()
                          )}
                        >
                          Resumo
                        </button>
                        <button
                          type="button"
                          onClick={() => (setCv({ ...cv, skills: [...cv.skills, text] }), drop())}
                        >
                          Habilidade
                        </button>
                        <button
                          type="button"
                          onClick={() => (setCv({ ...cv, courses: [...cv.courses, text] }), drop())}
                        >
                          Curso
                        </button>
                        <button type="button" aria-label="Descartar trecho" onClick={drop}>
                          <X size={14} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </div>

        <aside className="im-side" aria-label="Prévia do currículo">
          <div className="im-sticky">
            <div className="im-preview">
              <ResumeThumb
                width={340}
                cv={cv}
                template={template}
                accent={templateMeta(template).accent}
                density="comfortable"
                sections={defaultOrder}
              />
            </div>
            <p className="im-side-label">Modelo: {templateMeta(template).name}</p>
            <div className="im-templates" role="radiogroup" aria-label="Modelo do currículo">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={template === t.id}
                  className={template === t.id ? "is-on" : ""}
                  onClick={() => setTemplate(t.id)}
                  title={t.name}
                >
                  <i style={{ background: t.accent }} />
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
      <div className="im-bar">
        <div className="wrap im-bar-inner">
          <label className="im-check">
            <input type="checkbox" checked={saveProfile} onChange={(e) => setSaveProfile(e.target.checked)} />
            <span>
              Guardar também no meu <b>Perfil Profissional</b> para reaproveitar em outros currículos
            </span>
          </label>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={create}
            disabled={!cv.name.trim()}
          >
            Criar meu currículo
          </button>
        </div>
        {error && (
          <p className="wrap im-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}

function Found({ cv }: { cv: ResumeData }) {
  const facts: [string, boolean][] = [
    ["Nome", !!cv.name],
    ["Contato", !!(cv.email || cv.phone)],
    [plural(cv.experiences.length, "experiência", "experiências"), cv.experiences.length > 0],
    [plural(cv.education.length, "formação", "formações"), cv.education.length > 0],
    [plural(cv.skills.length, "habilidade", "habilidades"), cv.skills.length > 0],
    [plural(cv.courses.length, "curso", "cursos"), cv.courses.length > 0],
  ];
  return (
    <ul className="im-found">
      {facts.map(([label, ok]) => (
        <li key={label} className={ok ? "ok" : "miss"}>
          {ok ? <CheckCircle size={16} weight="fill" /> : <WarningCircle size={16} />} {label}
        </li>
      ))}
    </ul>
  );
}

const plural = (n: number, one: string, many: string) =>
  n === 0 ? "Sem " + many : n + " " + (n === 1 ? one : many);

function Card({
  icon,
  title,
  count,
  tone,
  children,
}: {
  icon: ReactNode;
  title: string;
  count?: number;
  tone?: "warn";
  children: ReactNode;
}) {
  return (
    <section className={"im-card" + (tone ? " is-" + tone : "")}>
      <h2>
        {icon} {title} {count !== undefined && <small>{count}</small>}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="im-field">
      <span>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Items({
  items,
  labels,
  empty,
  addLabel,
  onChange,
}: {
  items: ResumeItem[];
  labels: [string, string, string, string];
  empty: string;
  addLabel: string;
  onChange: (items: ResumeItem[]) => void;
}) {
  const set = (i: number, patch: Partial<ResumeItem>) =>
    onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <>
      {!items.length && <p className="im-hint">{empty}</p>}
      {items.map((item, i) => (
        <div className="im-item" key={item.id}>
          <div className="im-grid">
            <Field label={labels[0]} value={item.title} onChange={(title) => set(i, { title })} />
            <Field label={labels[1]} value={item.subtitle} onChange={(subtitle) => set(i, { subtitle })} />
            <Field label={labels[2]} value={item.period} onChange={(period) => set(i, { period })} />
          </div>
          <label className="im-field">
            <span>{labels[3]}</span>
            <textarea
              rows={3}
              value={item.description}
              onChange={(e) => set(i, { description: e.target.value })}
            />
          </label>
          <button
            type="button"
            className="im-remove"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            <Trash size={14} /> Remover
          </button>
        </div>
      ))}
      <button
        type="button"
        className="im-add"
        onClick={() =>
          onChange([...items, { id: uid(), title: "", subtitle: "", period: "", description: "" }])
        }
      >
        <Plus size={14} /> {addLabel}
      </button>
    </>
  );
}

function Chips({
  label,
  values,
  placeholder,
  onChange,
}: {
  label: string;
  values: string[];
  placeholder: string;
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className="im-chips">
      <span>{label}</span>
      <ul>
        {values.map((v, i) => (
          <li key={v + i}>
            {v}
            <button
              type="button"
              aria-label={"Remover " + v}
              onClick={() => onChange(values.filter((_, j) => j !== i))}
            >
              <X size={12} />
            </button>
          </li>
        ))}
        <li className="im-chip-add">
          <input
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                add();
              }
            }}
            onBlur={add}
            aria-label={"Adicionar em " + label}
          />
        </li>
      </ul>
    </div>
  );
}
