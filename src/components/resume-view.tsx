import type { CSSProperties, ReactNode } from "react";
import type { ResumeData, ResumeDensity, ResumeSection } from "@/lib/resume";
import { templateMeta, type TemplateId } from "@/lib/templates";

/** Largura e altura de uma folha A4 em pixels CSS (96 dpi). */
export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;

const TITLES: Record<ResumeSection, string> = {
  summary: "Objetivo profissional",
  experiences: "Experiência profissional",
  education: "Formação",
  skills: "Competências",
  languages: "Idiomas",
  courses: "Cursos e certificações",
};

/** Seções que vão para a coluna lateral nos modelos de duas colunas. */
const SIDE_SECTIONS: ResumeSection[] = ["skills", "languages", "courses"];

type Props = {
  cv: ResumeData;
  template: TemplateId;
  accent: string;
  density: ResumeDensity;
  /** Seções visíveis, já na ordem escolhida. */
  sections: ResumeSection[];
  /** Escala do texto (1 = normal). Usada pelo ajuste automático para caber em uma página. */
  scale?: number;
  /** Mostra textos de exemplo nos campos vazios (prévia do editor). */
  placeholders?: boolean;
  className?: string;
  children?: ReactNode;
};

const has = (value: string) => value.trim().length > 0;

export function ResumeView({
  cv,
  template,
  accent,
  density,
  sections,
  scale = 1,
  placeholders = false,
  className = "",
  children,
}: Props) {
  const meta = templateMeta(template);
  const twoColumns = meta.layout !== "single";
  const showPhoto = meta.photo && has(cv.photo);
  const name = cv.name.trim() || (placeholders ? "Seu nome" : "");
  const role = cv.role.trim() || (placeholders ? "Título profissional" : "");
  const filled = sections.filter((key) => sectionHasContent(key, cv));
  const mainKeys = twoColumns ? filled.filter((key) => !SIDE_SECTIONS.includes(key)) : filled;
  const sideKeys = twoColumns ? filled.filter((key) => SIDE_SECTIONS.includes(key)) : [];
  const style = { "--accent": accent, "--s": String(scale) } as CSSProperties;

  return (
    <article
      className={`cv cv-${meta.id} cv-${meta.layout} cv-d-${density} ${showPhoto ? "cv-has-photo" : ""} ${className}`}
      style={style}
    >
      <header className="cv-head">
        {showPhoto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="cv-photo" src={cv.photo} alt="" />
        )}
        <span className="cv-mono" aria-hidden="true">
          {initials(cv.name) || "CV"}
        </span>
        <div className="cv-id">
          {name && <h1 className={"cv-name " + (has(cv.name) ? "" : "cv-ph")}>{name}</h1>}
          {role && <p className={"cv-role " + (has(cv.role) ? "" : "cv-ph")}>{role}</p>}
        </div>
        <Contact cv={cv} className="cv-contact" />
      </header>

      {twoColumns && (
        <aside className="cv-side">
          {showPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="cv-side-photo" src={cv.photo} alt="" />
          )}
          <section className="cv-sec cv-sec-contact">
            <h2 className="cv-h">Contato</h2>
            <Contact cv={cv} className="cv-side-contact" />
          </section>
          {sideKeys.map((key) => (
            <SectionBlock key={key} sectionKey={key} cv={cv} side />
          ))}
        </aside>
      )}

      <div className="cv-main">
        {mainKeys.map((key) => (
          <SectionBlock key={key} sectionKey={key} cv={cv} side={false} />
        ))}
      </div>
      {children}
    </article>
  );
}

/** Miniatura fiel de um currículo, reduzida para caber em `width` pixels. */
export function ResumeThumb({ width, ...props }: Props & { width: number }) {
  const k = width / A4_WIDTH;
  return (
    <div
      className="cvThumb"
      style={{ width, height: Math.round(A4_HEIGHT * k), "--k": String(k) } as CSSProperties}
      aria-hidden="true"
    >
      <div className="cvThumbInner">
        <ResumeView {...props} />
      </div>
    </div>
  );
}

export function sectionHasContent(key: ResumeSection, cv: ResumeData) {
  if (key === "summary") return has(cv.summary);
  if (key === "experiences")
    return cv.experiences.some((x) => has(x.title) || has(x.subtitle) || has(x.description));
  if (key === "education") return cv.education.some((x) => has(x.title) || has(x.subtitle));
  return cv[key].some(has);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  return ((parts[0][0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function Contact({ cv, className }: { cv: ResumeData; className: string }) {
  const items = [
    {
      key: "email",
      value: cv.email,
      icon: (
        <path d="M3 6.5 12 13l9-6.5M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      ),
    },
    {
      key: "phone",
      value: cv.phone,
      icon: (
        <path d="M6.6 3.5 9 3l1.6 4.2-2 1.4a12 12 0 0 0 6.8 6.8l1.4-2L21 15l-.5 2.4a2 2 0 0 1-2 1.6A15.5 15.5 0 0 1 5 5.5a2 2 0 0 1 1.6-2Z" />
      ),
    },
    {
      key: "city",
      value: cv.city,
      icon: (
        <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      ),
    },
  ].filter((x) => has(x.value));
  if (!items.length) return null;
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item.key}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {item.icon}
          </svg>
          <span>{item.value}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionBlock({
  sectionKey,
  cv,
  side,
}: {
  sectionKey: ResumeSection;
  cv: ResumeData;
  side: boolean;
}) {
  return (
    <section className={`cv-sec cv-sec-${sectionKey}`}>
      <h2 className="cv-h">{TITLES[sectionKey]}</h2>
      <div className="cv-sec-body">{renderSection(sectionKey, cv, side)}</div>
    </section>
  );
}

function renderSection(key: ResumeSection, cv: ResumeData, side: boolean) {
  if (key === "summary") return <p className="cv-summary">{cv.summary.trim()}</p>;
  if (key === "experiences" || key === "education")
    return cv[key]
      .filter((x) => has(x.title) || has(x.subtitle) || has(x.description))
      .map((x) => (
        <div className="cv-item" key={x.id}>
          <div className="cv-item-top">
            <h3>{x.title.trim() || (key === "experiences" ? "Cargo" : "Curso")}</h3>
            {has(x.period) && <span className="cv-period">{x.period.trim()}</span>}
          </div>
          {has(x.subtitle) && <p className="cv-org">{x.subtitle.trim()}</p>}
          {has(x.description) && <Description text={x.description} />}
        </div>
      ));
  if (key === "skills") {
    const skills = cv.skills.filter(has).map((x) => x.trim());
    return side ? (
      <ul className="cv-list cv-skill-list">
        {skills.map((x, i) => (
          <li key={x + i}>{x}</li>
        ))}
      </ul>
    ) : (
      <div className="cv-tags">
        {skills.map((x, i) => (
          <span key={x + i}>{x}</span>
        ))}
      </div>
    );
  }
  if (key === "languages")
    return (
      <ul className="cv-list cv-lang-list">
        {cv.languages.filter(has).map((value, i) => {
          const [lang, ...level] = value.split(/\s+[—–-]\s+/);
          return (
            <li key={value + i}>
              <b>{lang.trim()}</b>
              {level.length > 0 && (
                <span>{side ? level.join(" — ").trim() : " — " + level.join(" — ").trim()}</span>
              )}
            </li>
          );
        })}
      </ul>
    );
  return (
    <ul className="cv-list cv-course-list">
      {cv.courses
        .flatMap((value) => value.split(/\s*[•·]\s*/))
        .filter(has)
        .map((entry, i) => {
          const parts = entry
            .split(/\s+[—–-]\s+/)
            .map((part) => part.trim())
            .filter(Boolean);
          const institution = parts.length > 1 ? parts[0] : "";
          const title = parts.length > 1 ? parts[1] : parts[0];
          const details = parts.length > 2 ? parts.slice(2).join(" · ") : "";
          return (
            <li className="cv-course" key={entry + i}>
              <b>{title}</b>
              {(institution || details) && <span>{[institution, details].filter(Boolean).join(" · ")}</span>}
            </li>
          );
        })}
    </ul>
  );
}

/** Linhas iniciadas por •, - ou * viram lista; o restante vira parágrafo. */
function Description({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={"u" + blocks.length}>
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const bullet = line.match(/^[•\-*–]\s*(.+)$/);
    if (bullet) bullets.push(bullet[1]);
    else {
      flush();
      blocks.push(<p key={"p" + blocks.length}>{line}</p>);
    }
  }
  flush();
  return <div className="cv-desc">{blocks}</div>;
}
