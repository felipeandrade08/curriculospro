// Monta textos do perfil do LinkedIn a partir do currículo (sem inventar nada).
import type { ResumeData } from "@/lib/resume";

const clean = (s: string) => s.replace(/\(a\)|\(o\)/g, "").replace(/\s+/g, " ").trim();
const company = (s: string) => clean(s.split("—")[0].split("|")[0]);
const lowerFirst = (s: string) => (s && !/^[A-Z]{2}/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
const listPt = (items: string[]) =>
  items.length <= 1 ? items.join("") : items.slice(0, -1).join(", ") + " e " + items[items.length - 1];
const bullets = (desc: string) =>
  desc
    .split("\n")
    .map((l) => l.replace(/^[•\-–*]\s*/, "").replace(/[.;]\s*$/, "").trim())
    .filter(Boolean);

export const HEADLINE_MAX = 220;
export const ABOUT_MAX = 2600;

export function headlines(cv: ResumeData): string[] {
  const role = clean(cv.role || cv.experiences[0]?.title || "");
  const skills = cv.skills.map(clean).filter(Boolean);
  const city = clean(cv.city.split(",")[0] || "");
  const out: string[] = [];
  if (role && skills.length) out.push([role, ...skills.slice(0, 3)].join(" | "));
  if (role && skills.length >= 2) out.push(`${role} com experiência em ${listPt(skills.slice(0, 2))}${city ? " | " + city : ""}`);
  const student = cv.education.find((e) => /cursando|andamento|previs|atual/i.test(e.period + " " + e.description));
  if (student && role) out.push(`Estudante de ${clean(student.title)} | Em busca de oportunidade como ${role}`);
  else if (role) out.push(`${role} | Aberto(a) a novas oportunidades${city ? " em " + city : ""}`);
  return [...new Set(out)].map((h) => h.slice(0, HEADLINE_MAX));
}

export function aboutText(cv: ResumeData, style: "texto" | "topicos"): string {
  const role = clean(cv.role || cv.experiences[0]?.title || "");
  const exps = cv.experiences.filter((x) => x.title);
  const companies = [...new Set(exps.map((x) => company(x.subtitle)).filter(Boolean))].slice(0, 3);
  const acts = exps.flatMap((x) => bullets(x.description)).slice(0, 4);
  const skills = cv.skills.map(clean).filter(Boolean).slice(0, 8);
  const edu = cv.education.find((x) => x.title);
  const courses = cv.courses.map(clean).filter(Boolean).slice(0, 3);
  const parts: string[] = [];
  if (style === "texto") {
    parts.push(cv.summary.trim() || (role ? `Sou ${role.toLowerCase()} e gosto de fazer um trabalho bem feito, com organização e atenção aos detalhes.` : ""));
    if (companies.length && acts.length)
      parts.push(`Na minha trajetória, passei por ${listPt(companies)}, onde atuei com ${listPt(acts.slice(0, 3).map(lowerFirst))}.`);
    else if (acts.length) parts.push(`No dia a dia, já trabalhei com ${listPt(acts.slice(0, 3).map(lowerFirst))}.`);
    if (skills.length) parts.push(`Principais competências: ${listPt(skills)}.`);
    const study = [edu ? `Formação em ${clean(edu.title)}${edu.subtitle ? " (" + clean(edu.subtitle) + ")" : ""}` : "", courses.length ? `cursos de ${listPt(courses)}` : ""].filter(Boolean);
    if (study.length) parts.push(listPt(study) + ".");
    parts.push(`Estou aberto(a) a novas oportunidades${role ? " como " + role : ""}. Vamos conversar?${cv.email ? " " + cv.email : ""}`);
  } else {
    if (cv.summary.trim()) parts.push(cv.summary.trim());
    else if (role) parts.push(`${role}.`);
    if (acts.length) parts.push("O que eu faço:\n" + acts.map((a) => "• " + a).join("\n"));
    if (skills.length) parts.push("Competências:\n" + skills.map((s) => "• " + s).join("\n"));
    const study = [edu ? clean(edu.title) + (edu.subtitle ? " — " + clean(edu.subtitle) : "") : "", ...courses].filter(Boolean);
    if (study.length) parts.push("Formação e cursos:\n" + study.map((s) => "• " + s).join("\n"));
    parts.push(`📩 ${cv.email || "Seu e-mail"}`);
  }
  return parts.filter(Boolean).join("\n\n").slice(0, ABOUT_MAX);
}

export function experienceTexts(cv: ResumeData) {
  return cv.experiences
    .filter((x) => x.title)
    .map((x) => ({
      title: clean(x.title),
      company: company(x.subtitle),
      period: x.period,
      text: bullets(x.description)
        .map((b) => "• " + b)
        .join("\n"),
    }));
}
