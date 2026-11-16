// Gera uma carta de apresentação a partir do currículo, sem depender de IA.
import type { ResumeData } from "@/lib/resume";

export type LetterTone = "formal" | "direto" | "primeiro";

export type LetterOptions = {
  company: string;
  jobTitle: string;
  recruiter: string;
  source: string;
  tone: LetterTone;
  variant: number;
};

export const emptyLetterOptions = (cv: ResumeData): LetterOptions => ({
  company: "",
  jobTitle: cv.role || "",
  recruiter: "",
  source: "",
  tone: cv.experiences.some((x) => x.title.trim()) ? "formal" : "primeiro",
  variant: 0,
});

const pick = <T>(list: T[], v: number) => list[((v % list.length) + list.length) % list.length];
const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const lowerFirst = (s: string) =>
  /^[A-ZÀ-Ú][a-zà-ú]/.test(s) ? s[0].toLocaleLowerCase("pt-BR") + s.slice(1) : s;
const noDot = (s: string) => s.replace(/[.;:]+$/, "");

function joinList(items: string[]) {
  if (items.length <= 1) return items.join("");
  return items.slice(0, -1).join(", ") + " e " + items[items.length - 1];
}

function tasks(description: string, max = 2) {
  return description
    .split("\n")
    .map((l) => noDot(clean(l.replace(/^[•\-–*]\s*/, ""))))
    .filter((l) => l.length > 6)
    .slice(0, max)
    .map(lowerFirst);
}

export function letterBody(cv: ResumeData, o: LetterOptions): string {
  const v = o.variant;
  const company = clean(o.company);
  const job = clean(o.jobTitle) || clean(cv.role) || "a vaga em aberto";
  const atCompany = company ? " na empresa " + company : "";
  const source = clean(o.source);
  const exps = cv.experiences.filter((x) => x.title.trim());
  const edu = cv.education.find((x) => x.title.trim());
  const skills = cv.skills.map(clean).filter(Boolean).slice(0, 4).map(lowerFirst);
  const p: string[] = [];

  // Saudação
  p.push(
    o.recruiter.trim()
      ? (o.tone === "formal" ? "Prezado(a) " : "Olá, ") + clean(o.recruiter) + ","
      : pick(["Prezada equipe de recrutamento,", "À equipe de Recursos Humanos,"], v),
  );

  // Abertura
  const name = clean(cv.name) || "[seu nome]";
  const sourceText = source
    ? ", divulgada " + (/^(no|na|pelo|pela|em|por)\b/i.test(source) ? source : "no " + source)
    : "";
  if (o.tone === "direto")
    p.push(
      pick(
        [
          `Meu nome é ${name} e quero me candidatar à vaga de ${job}${atCompany}${sourceText}.`,
          `Sou ${name} e tenho interesse na vaga de ${job}${atCompany}${sourceText}. Segue meu currículo em anexo.`,
        ],
        v,
      ),
    );
  else if (o.tone === "primeiro")
    p.push(
      pick(
        [
          `Meu nome é ${name} e gostaria de me candidatar à vaga de ${job}${atCompany}${sourceText}. Estou em busca da minha primeira oportunidade profissional e tenho muita vontade de aprender e contribuir com a equipe.`,
          `Sou ${name} e venho demonstrar meu interesse na vaga de ${job}${atCompany}${sourceText}. Busco minha primeira experiência no mercado de trabalho e estou pronto(a) para me dedicar e crescer junto com a empresa.`,
        ],
        v,
      ),
    );
  else
    p.push(
      pick(
        [
          `Meu nome é ${name} e venho, por meio desta carta, apresentar minha candidatura à vaga de ${job}${atCompany}${sourceText}.`,
          `É com grande interesse que apresento minha candidatura à vaga de ${job}${atCompany}${sourceText}, e encaminho em anexo o meu currículo.`,
        ],
        v,
      ),
    );

  // Experiência ou formação
  if (exps.length) {
    const e = exps[0];
    const where = e.subtitle.trim()
      ? (o.tone === "direto" ? " na " : " na empresa ") + clean(e.subtitle)
      : "";
    const t = tasks(e.description);
    let s =
      o.tone === "direto"
        ? `Trabalho${/atual|o momento|hoje/i.test(e.period) ? "" : "ei"} como ${clean(e.title)}${where}`
        : `${/atual|o momento|hoje/i.test(e.period) ? "Atualmente atuo" : "Atuei"} como ${clean(e.title)}${where}`;
    if (e.period.trim() && o.tone !== "direto") s += ` (${clean(e.period)})`;
    // "Recebi, separei…" (verbo no passado) ou "atendimento, gestão…" (substantivo).
    const firstWord = (t[0] || "").split(/\s/)[0].replace(/[^\p{L}]/gu, "");
    const pastVerb = /^\p{L}{3,}(ei|ou|i)$/u.test(firstWord);
    s += !t.length
      ? "."
      : pastVerb
        ? `. Nessa função, ${joinList(t)}.`
        : `, onde fui responsável por ${joinList(t)}.`;
    const others = [
      ...new Set(
        exps
          .slice(1)
          .map((x) => clean(x.title))
          .filter(
            (x) => x.toLowerCase() !== clean(e.title).toLowerCase() && !/[—|]|projeto|curso|volunt/i.test(x),
          ),
      ),
    ].slice(0, 2);
    if (others.length) s += ` Também tenho experiência como ${joinList(others)}.`;
    p.push(s);
  } else if (edu) {
    p.push(
      `Tenho formação em ${clean(edu.title)}${edu.subtitle.trim() ? " (" + clean(edu.subtitle) + ")" : ""}${
        /curs|andamento|previs/i.test(edu.period) ? " (em andamento)" : ""
      }, e procuro colocar em prática o que aprendi, com responsabilidade, pontualidade e disposição.`,
    );
  }

  // Competências
  if (skills.length) {
    const eduLine =
      exps.length && edu
        ? ` Possuo formação em ${clean(edu.title)}${edu.subtitle.trim() ? " (" + clean(edu.subtitle) + ")" : ""}.`
        : "";
    p.push(
      pick(
        [
          `Entre minhas principais competências estão ${joinList(skills)}.${eduLine}`,
          `Destaco como pontos fortes ${joinList(skills)}.${eduLine}`,
        ],
        v,
      ),
    );
  }

  // Motivação
  const empresa = company ? "a empresa " + company : "a empresa";
  p.push(
    o.tone === "direto"
      ? `Acredito que posso contribuir com ${empresa} desde o primeiro dia e gostaria de conversar sobre a vaga.`
      : o.tone === "primeiro"
        ? `Sei que posso contribuir com ${empresa} com dedicação e vontade de aprender, e gostaria muito de uma oportunidade para mostrar meu potencial em uma entrevista.`
        : pick(
            [
              `Acredito que minha experiência pode contribuir com os resultados d${empresa}, e coloco-me à disposição para uma entrevista, na qual poderei detalhar como posso agregar à equipe.`,
              `Tenho convicção de que posso agregar valor a ${empresa} e ficarei feliz em conversar pessoalmente sobre como minha trajetória se encaixa no que vocês procuram.`,
            ],
            v,
          ),
  );

  // Fechamento
  const contacts = [
    cv.phone.trim() && "pelo telefone " + clean(cv.phone),
    cv.email.trim() && "pelo e-mail " + clean(cv.email),
  ].filter(Boolean) as string[];
  p.push(
    "Agradeço a atenção" +
      (contacts.length
        ? " e fico à disposição " + joinList(contacts) + "."
        : " e fico à disposição para mais informações."),
  );
  p.push((o.tone === "direto" ? "Obrigado(a)," : "Atenciosamente,") + "\n" + name);
  return p.join("\n\n");
}

export function letterDate(city: string, date = new Date()) {
  const d = date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
  const c = city.split(",")[0].trim();
  return (c ? c + ", " : "") + d + ".";
}

/* Cartas salvas por currículo, neste navegador */
const KEY = "curriculospro.coverLetters.v1";
export type SavedLetter = { options: LetterOptions; body: string; edited: boolean; updatedAt: string };

export function loadLetter(resumeId: string): SavedLetter | null {
  try {
    return (JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, SavedLetter>)[resumeId] || null;
  } catch {
    return null;
  }
}

export function saveLetter(resumeId: string, letter: SavedLetter) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, SavedLetter>;
    all[resumeId] = letter;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
}
