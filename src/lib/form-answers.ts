// Respostas para as perguntas que aparecem nos formulários de candidatura
// (Gupy, Infojobs, sites de empresas). Usa só o que está no currículo e na vaga.
import type { ResumeData } from "@/lib/resume";
import type { JobMatch } from "@/lib/job-match";

const clean = (s: string) => s.replace(/\(a\)|\(o\)/g, "").replace(/\s+/g, " ").trim();
const company = (s: string) => clean(s.split("—")[0].split("|")[0]);
const listPt = (items: string[]) =>
  items.length <= 1 ? items.join("") : items.slice(0, -1).join(", ") + " e " + items[items.length - 1];
const lowerFirst = (s: string) => (s && !/^[A-Z]{2}/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
const bullets = (desc: string) =>
  desc
    .split("\n")
    .map((l) => l.replace(/^[•\-–*]\s*/, "").replace(/[.;]\s*$/, "").trim())
    .filter(Boolean);

export type AnswerContext = {
  cv: ResumeData;
  jobTitle: string;
  company: string;
  match: JobMatch | null;
};

export type FormAnswer = { id: string; question: string; hint: string; text: string; max?: number };

export function formAnswers({ cv, jobTitle, company: co, match }: AnswerContext): FormAnswer[] {
  const role = clean(jobTitle || cv.role || cv.experiences[0]?.title || "");
  const exps = cv.experiences.filter((x) => x.title);
  const last = exps[0];
  const acts = exps.flatMap((x) => bullets(x.description));
  const withNumbers = acts.find((a) => /\d/.test(a));
  const skills = cv.skills.map(clean).filter(Boolean);
  const order = { skill: 0, course: 1, soft: 2, language: 3, license: 4, education: 5 } as const;
  const hasReqs = (match?.requirements || []).filter((r) => r.has).sort((a, b) => order[a.kind] - order[b.kind]);
  const has = hasReqs.map((r) => r.label);
  const hasSkills = hasReqs.filter((r) => r.kind === "skill" || r.kind === "course" || r.kind === "soft").map((r) => r.label);
  const strengths = (hasSkills.length ? hasSkills : skills).slice(0, 3);
  const edu = cv.education.find((x) => x.title);
  const naEmpresa = co.trim() ? "na empresa " + co.trim() : "nesta empresa";
  const lastActs = last ? bullets(last.description) : [];
  const did = lastActs.length
    ? lowerFirst(lastActs[0]) + (lastActs[1] ? ", além de " + lowerFirst(lastActs[1]) : "")
    : "as rotinas da área";

  const intro = [
    cv.summary.trim() ||
      (role ? `Sou ${role.toLowerCase()}${cv.city ? ", moro em " + clean(cv.city.split(",")[0]) : ""}.` : ""),
    last
      ? `Minha experiência mais recente foi como ${clean(last.title).toLowerCase()}${last.subtitle ? " na empresa " + company(last.subtitle) : ""}, onde atuei com ${did}.`
      : edu
        ? `Estou estudando ${clean(edu.title)}${edu.subtitle ? " na " + clean(edu.subtitle) : ""} e busco minha primeira oportunidade.`
        : "",
    strengths.length ? `Tenho facilidade com ${listPt(strengths)}.` : "",
    role ? `Quero contribuir como ${role} ${naEmpresa}, aprendendo e entregando resultado desde o início.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const why = [
    `Me interessei pela vaga de ${role || "[cargo]"} porque ela combina com o que eu já faço${strengths.length ? ", principalmente " + listPt(strengths.slice(0, 2)) : ""}.`,
    `Sobre ${co.trim() ? "a empresa " + co.trim() : "a empresa"}, [cite algo que você admira: um produto, a reputação, a forma de trabalhar ou o crescimento].`,
    "Busco um lugar onde eu possa crescer e me desenvolver por bastante tempo, e acredito que posso contribuir com dedicação e responsabilidade.",
  ].join(" ");

  const fit = [
    has.length
      ? `A vaga pede ${listPt(has.slice(0, 3))}, e isso faz parte da minha experiência.`
      : strengths.length
        ? `Tenho experiência com ${listPt(strengths)}, que são pontos importantes para essa função.`
        : "",
    withNumbers ? `Um exemplo: ${lowerFirst(withNumbers)}.` : acts[0] ? `No dia a dia, ${lowerFirst(acts[0])}.` : "",
    "Sou organizado(a), aprendo rápido e gosto de trabalhar em equipe.",
  ]
    .filter(Boolean)
    .join(" ");

  const achievement = withNumbers
    ? `Uma conquista de que me orgulho: ${lowerFirst(withNumbers)}${last?.subtitle ? ", na empresa " + company(last.subtitle) : ""}. [Conte em uma frase qual era o problema, o que você fez e o resultado.]`
    : "[Situação] O que estava acontecendo. [Ação] O que você fez. [Resultado] Como terminou, de preferência com um número (tempo economizado, vendas, clientes atendidos).";

  return [
    {
      id: "apresente",
      question: "Fale sobre você / Apresente-se",
      hint: "Usado em campos de apresentação, como o “Apresente-se” da Gupy (até 1.500 caracteres).",
      text: intro.slice(0, 1500),
      max: 1500,
    },
    {
      id: "porque-empresa",
      question: "Por que você quer trabalhar aqui?",
      hint: "Troque o trecho entre colchetes por algo real sobre a empresa. Isso faz muita diferença.",
      text: why,
    },
    {
      id: "porque-voce",
      question: "Por que você é a pessoa certa para esta vaga?",
      hint: has.length
        ? "Montado com os requisitos da vaga que você já tem."
        : "Cole a vaga em “Comparar com uma vaga” para esta resposta usar os requisitos dela.",
      text: fit,
    },
    {
      id: "conquista",
      question: "Conte uma conquista ou um desafio que você resolveu",
      hint: "Use o roteiro: situação, o que você fez e o resultado.",
      text: achievement,
    },
    {
      id: "salario",
      question: "Qual sua pretensão salarial?",
      hint: "Pesquise a média do cargo na sua cidade (Indeed, Glassdoor ou Catho mostram faixas) antes de responder.",
      text: `Minha pretensão é de R$ [valor] a R$ [valor], mas estou aberto(a) a conversar de acordo com o pacote de benefícios e as responsabilidades da vaga.`,
    },
    {
      id: "disponibilidade",
      question: "Qual sua disponibilidade?",
      hint: "Seja específico. Disponibilidade é critério de corte em muitas vagas.",
      text: "Tenho disponibilidade para início imediato, de segunda a sexta [e aos fins de semana / em escala], no período [manhã / tarde / integral].",
    },
  ];
}
