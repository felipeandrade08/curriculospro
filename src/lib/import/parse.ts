// Organiza o texto de um currículo (PDF, Word ou colado) em campos do CurriculosPRO.
// Funciona só com heurísticas, no navegador. Nada é inventado: o que não for reconhecido
// volta em `unmatched` para a pessoa decidir.
import type { ResumeData, ResumeItem } from "@/lib/resume";

export type ImportLine = { text: string; size?: number; page?: number };
export type ImportResult = {
  cv: ResumeData;
  /** Linhas que não couberam em nenhum campo. */
  unmatched: string[];
  /** Quantas seções foram reconhecidas pelo título. */
  sectionsFound: string[];
};

type SectionKey =
  "summary" | "experiences" | "education" | "skills" | "languages" | "courses" | "contact" | "extras";

const strip = (s: string) =>
  s
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const HEADINGS: [RegExp, SectionKey][] = [
  [
    /^(objetivos?( profissiona(l|is))?|resumo( profissional)?|perfil( profissional| pessoal)?|sobre( mim)?|apresentacao|sumario( profissional)?|quem sou( eu)?|meu objetivo)$/,
    "summary",
  ],
  [
    /^(experiencias?( profissiona(l|is)| de trabalho| anteriores)?|historico profissional|atuacao profissional|trajetoria profissional|empregos( anteriores)?|experiencias? e projetos|projetos|voluntariado|trabalho voluntario)$/,
    "experiences",
  ],
  [
    /^(formac(ao|oes)( academica| escolar| educacional)?|escolaridade|educacao|graduacao|formacao e educacao|dados academicos)$/,
    "education",
  ],
  [
    /^(habilidades( e competencias| tecnicas| profissionais)?|competencias( tecnicas| profissionais| comportamentais)?|qualificac(ao|oes)( profissiona(l|is))?|conhecimentos( tecnicos| em informatica| especificos)?|informatica|ferramentas|hard skills|soft skills|skills|aptidoes|principais competencias)$/,
    "skills",
  ],
  [/^(idiomas?|linguas?( estrangeiras)?)$/, "languages"],
  [
    /^(cursos?( complementares| extracurriculares| livres| e certificac(oes|ados)| e treinamentos)?|certificac(ao|oes)|certificados?|treinamentos?|capacitac(ao|oes)|atividades complementares|formacao complementar)$/,
    "courses",
  ],
  [/^(contatos?|dados pessoais|informac(ao|oes) pessoa(l|is)|informac(ao|oes) de contato)$/, "contact"],
  [
    /^(informac(ao|oes) adiciona(l|is)|outras informac(ao|oes)|referencias( profissionais)?|disponibilidade|observac(ao|oes)|diferenciais)$/,
    "extras",
  ],
];

export function isSectionHeading(text: string) {
  return headingOf(text) !== null;
}

function headingOf(text: string): SectionKey | null {
  if (text.length > 48 || /\d{3,}|@/.test(text)) return null;
  const key = strip(text);
  if (!key || key.split(" ").length > 6) return null;
  for (const [re, section] of HEADINGS) if (re.test(key)) return section;
  return null;
}

const UF = "AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO";
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE = /(?:\+?55[\s-]?)?\(?\b\d{2}\)?[\s-]?9?\s?\d{4}[\s.-]?\d{4}\b/;
const CITY = new RegExp(`([A-ZÀ-Ý][\\p{L}'.\\- ]{1,40}?)\\s*(?:[-–—/,]|\\s)\\s*(${UF})\\b`, "u");
const URL_RE = /(https?:\/\/|www\.|linkedin\.com|github\.com|behance\.net)\S*/i;

const MONTH =
  "(?:jan(?:eiro)?|fev(?:ereiro)?|mar(?:[cç]o)?|abr(?:il)?|mai(?:o)?|jun(?:ho)?|jul(?:ho)?|ago(?:sto)?|set(?:embro)?|out(?:ubro)?|nov(?:embro)?|dez(?:embro)?)";
const DATE = `(?:${MONTH}\\.?\\s*(?:de\\s*|\\/\\s*)?(?:19|20)\\d{2}|\\d{1,2}\\s*\\/\\s*(?:19|20)\\d{2}|(?:19|20)\\d{2})`;
const END = `(?:${DATE}|atual(?:mente)?|o momento|presente|hoje|em andamento|cursando|em curso)`;
const RANGE_RE = new RegExp(
  `(?:(?:de|desde|per[ií]odo:?)\\s+)?${DATE}\\s*(?:[-–—]|\\ba\\b|at[ée])\\s*${END}|(?:desde|a partir de)\\s+${DATE}`,
  "i",
);
const SINGLE_RE = new RegExp(
  `(?:conclu[ií]d[oa]\\s*(?:em)?\\s*|previs[ãa]o(?: de conclus[ãa]o)?:?\\s*|t[ée]rmino:?\\s*|in[ií]cio:?\\s*)?${DATE}|\\b(?:cursando|em andamento|conclu[ií]d[oa]|incompleto|trancado)\\b`,
  "i",
);

const BULLET = /^[•▪●◦○■□➢➤►▶✓✔\-*–·]\s*/;
const isBullet = (s: string) => BULLET.test(s);
const unbullet = (s: string) => s.replace(BULLET, "").trim();

const clean = (s: string) =>
  s
    .replace(/ /g, " ")
    .replace(/[​-‍﻿]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** "O B J E T I V O" → "OBJETIVO" (títulos com espaçamento entre letras). */
function despace(s: string) {
  const tokens = s.split(" ");
  if (tokens.length >= 4 && tokens.filter((t) => t.length === 1).length / tokens.length >= 0.7) {
    return s
      .split(/\s{2,}/)
      .map((w) => w.replace(/ /g, ""))
      .join(" ");
  }
  return s;
}

const LOWER_WORDS = new Set(["da", "de", "do", "das", "dos", "e", "em", "na", "no", "para", "com", "a", "o"]);
function titleCase(s: string) {
  if (s !== s.toLocaleUpperCase("pt-BR") || !/[A-ZÀ-Ý]{3}/.test(s)) return s;
  return s
    .toLocaleLowerCase("pt-BR")
    .split(" ")
    .map((w, i) => (i > 0 && LOWER_WORDS.has(w) ? w : w.charAt(0).toLocaleUpperCase("pt-BR") + w.slice(1)))
    .join(" ");
}

const looksLikeName = (s: string) => {
  const t = s.replace(/[_|]+$/g, "").trim();
  const words = t.split(/\s+/);
  return (
    words.length >= 2 &&
    words.length <= 6 &&
    t.length <= 60 &&
    !/[\d@:/]/.test(t) &&
    words.every((w) => /^[\p{L}'.-]+$/u.test(w)) &&
    !headingOf(t)
  );
};

const COMPANY_HINT =
  /\b(ltda|s\.?\/?a\.?|eireli|me|epp|grupo|empresa|com[eé]rcio|ind[uú]stria|hospital|cl[ií]nica|escola|col[eé]gio|loja|lojas|supermercados?|mercado|atacad|restaurante|prefeitura|banco|universidade|instituto|faculdade|transportadora|distribuidora|construtora|associa[cç][aã]o|funda[cç][aã]o|centro|rede|farm[aá]cia|drogaria|ag[eê]ncia|consultoria|servi[cç]os|log[ií]stica|tecnologia|sistemas|software|telecom|alimentos|metal[uú]rgica|t[eê]xtil|ind\.|cia\.?|companhia|holding|secretaria|governo|minist[eé]rio|ong|cooperativa|condom[ií]nio|shopping|padaria|hotel|pousada|bar|lanchonete|oficina|auto|posto|est[uú]dio)\b/i;
const ROLE_HINT =
  /\b(auxiliar|assistente|analista|gerente|coordenador|coordenadora|supervisor|supervisora|vendedor|vendedora|atendente|operador|operadora|t[eé]cnic[oa]|estagi[aá]ri[oa]|aprendiz|recepcionista|motorista|professor|professora|desenvolvedor|desenvolvedora|engenheir[oa]|cozinheir[oa]|repositor|caixa|promotor|promotora|consultor|consultora|diretor|diretora|encarregad[oa]|l[ií]der|estoquista|gar[cç]om|gar[cç]onete|porteiro|vigilante|zelador|faxineir[oa]|diarista|bab[aá]|cuidador|cuidadora|enfermeir[oa]|secret[aá]ri[oa]|designer|programador|programadora|montador|mec[aâ]nico|eletricista|pedreiro|ajudante|servente|copeir[oa]|balconista|frentista|entregador|conferente|almoxarife|comprador|contador|contadora|advogad[oa]|administrador|administradora|especialista|s[oó]ci[oa]|propriet[aá]ri[oa]|aut[oô]nom[oa]|freelancer|volunt[aá]ri[oa]|monitor|monitora|instrutor|instrutora|tutor|bolsista|trainee|executiv[oa]|chefe|agente|inspetor|fiscal|op\.?)\b/i;
const INSTITUTION_HINT =
  /\b(universidade|faculdade|escola|col[eé]gio|instituto|senai|senac|sesi|sebrae|etec|fatec|ifs?p?|uf[a-z]{1,3}|unesp|usp|unicamp|puc|centro universit|e\.?\s?e\.?|estadual|municipal|federal|ead|educa[cç][aã]o|ensino a dist|fgv|anhanguera|est[aá]cio|unip|uninove|unopar|cruzeiro do sul|kroton|uniasselvi|mackenzie|alura|udemy|coursera|fundação bradesco|bradesco|microsoft|google|cisco|aws)\b/i;
const COURSE_HINT =
  /\b(ensino (m[eé]dio|fundamental|superior)|t[eé]cnico em|tecn[oó]logo|bacharel|bacharelado|licenciatura|gradua[cç][aã]o|p[oó]s[- ]gradua|mba|mestrado|doutorado|especializa[cç][aã]o|curso|superior em|engenharia|administra[cç][aã]o|direito|pedagogia|enfermagem|psicologia|contabilidade|ci[eê]ncias?|sistemas de informa|an[aá]lise e desenvolvimento|gest[aã]o)\b/i;

const ROLE_START = new RegExp("^\\s*" + ROLE_HINT.source, "i");
const COURSE_START = new RegExp("^\\s*" + COURSE_HINT.source, "i");

type Draft = {
  header: string[];
  period: string;
  desc: string[];
  labeled: Partial<Record<"title" | "subtitle", string>>;
};
const LABEL_RE =
  /^(empresa|empregador|local|institui[cç][aã]o|escola|faculdade|cargo|fun[cç][aã]o|curso|per[ií]odo|data|ano|conclus[aã]o|atividades|principais atividades|atribui[cç][oõ]es|responsabilidades|descri[cç][aã]o|resultados?|status|situa[cç][aã]o)\s*:\s*(.*)$/i;

function parseItems(
  input: (string | ImportLine)[],
  kind: "experiences" | "education",
  bodySize = 0,
): ResumeItem[] {
  const lines = input.map((l) => (typeof l === "string" ? { text: l } : l));
  // Quando o PDF informa tamanhos de fonte, o texto corrido (atividades) tem o tamanho do corpo
  // e cargo/empresa têm outro. Isso permite separar atividades mesmo sem marcador "•".
  const sized = bodySize > 0 && lines.some((l) => l.size && Math.abs(l.size - bodySize) > 0.15);
  const isBody = (l: ImportLine) => sized && !!l.size && Math.abs(l.size - bodySize) <= 0.15;
  const drafts: Draft[] = [];
  let cur: Draft | null = null;
  const fresh = () => {
    cur = { header: [], period: "", desc: [], labeled: {} };
    drafts.push(cur);
    return cur;
  };
  const tail = `(?:\\s*\\((?:cursando|em andamento|conclu[ií]d[oa]|incompleto|trancado|previs[ãa]o[^)]*)\\))?`;
  const periodRe =
    kind === "education"
      ? new RegExp(`(?:${RANGE_RE.source}|${SINGLE_RE.source})${tail}`, "i")
      : new RegExp(`(?:${RANGE_RE.source})${tail}`, "i");
  const soloDate = new RegExp(`^${DATE}${tail}$`, "i");
  let lastWasBullet = false;

  for (const item of lines) {
    const line = clean(item.text);
    if (!line) continue;
    let d: Draft = cur || fresh();
    const label = line.match(LABEL_RE);
    if (label) {
      const name = strip(label[1]);
      const value = clean(label[2]);
      const isTitle = /^(cargo|funcao|curso)$/.test(name);
      const isPlace = /^(empresa|empregador|local|instituicao|escola|faculdade)$/.test(name);
      const isPeriod = /^(periodo|data|ano|conclusao|status|situacao)$/.test(name);
      if (
        (isTitle && d.labeled.title) ||
        (isPlace && d.labeled.subtitle) ||
        (isPeriod && d.period && (d.desc.length || d.labeled.title))
      )
        d = fresh();
      if (isTitle) d.labeled.title = value;
      else if (isPlace) d.labeled.subtitle = value;
      else if (isPeriod) d.period = value;
      else if (value) d.desc.push(value);
      lastWasBullet = false;
      continue;
    }
    const parts = line
      .split(/\s+\|\s+/)
      .map(clean)
      .filter(Boolean);
    // Um bloco só com a data ("Projeto | 2024") também é período.
    const solo = parts.length > 1 ? parts.find((x) => soloDate.test(x)) : undefined;
    const periodMatch = solo ? ([solo] as unknown as RegExpMatchArray) : line.match(periodRe);
    const bullet = isBullet(line);
    if (periodMatch && !bullet && line.length < 140) {
      const hasContent = d.period || d.desc.length;
      if (hasContent && (d.period || d.header.length >= 1)) d = fresh();
      d.period = clean(periodMatch[0].replace(/^per[ií]odo:?\s*/i, ""));
      // Com " | " (blocos separados no PDF), cada bloco é um campo; sem ele, "Cargo - Empresa".
      const rest = clean(line.replace(periodMatch[0], " "))
        .split(parts.length > 1 ? /\s*\|\s*/ : /\s+(?:\||[–—-])\s+|\s*\|\s*/)
        .map((x) => x.replace(/^[,;:()\s–—-]+|[,;:()\s–—-]+$/g, ""))
        .filter((x) => x.length > 1);
      d.header.push(...rest);
      lastWasBullet = false;
      continue;
    }
    // Continuação de um tópico quebrado em duas linhas.
    if (!bullet && lastWasBullet && d.desc.length && (/^[a-zà-ú(,]/.test(line) || line.length > 60)) {
      d.desc[d.desc.length - 1] += " " + line;
      continue;
    }
    const descLike =
      bullet ||
      line.length > 75 ||
      /[.;]$/.test(line) ||
      (isBody(item) && (d.period !== "" || d.header.length > 0 || !!d.labeled.title));
    if (descLike) {
      d.desc.push(unbullet(line));
      lastWasBullet = bullet || line.length > 75;
      continue;
    }
    // Linha curta: título, empresa ou instituição.
    const headerFull = d.header.length + (d.labeled.title ? 1 : 0) + (d.labeled.subtitle ? 1 : 0) >= 2;
    if (d.desc.length || (headerFull && d.period) || (headerFull && kind === "education")) d = fresh();
    // Divide "Cargo - Empresa" só quando a entrada ainda não tem título.
    const fresh2 = d.header.length === 0 && !d.labeled.title;
    d.header.push(
      ...(parts.length > 1
        ? parts
        : fresh2
          ? line
              .split(/\s+[–—-]\s+|\s+@\s+/)
              .map(clean)
              .filter(Boolean)
          : [line]),
    );
    lastWasBullet = false;
  }

  return drafts
    .filter((x) => x.header.length || x.labeled.title || x.labeled.subtitle || x.desc.length)
    .map((x, i) => {
      let title = x.labeled.title || "";
      let subtitle = x.labeled.subtitle || "";
      const pool = x.header.filter((h) => h && h !== title && h !== subtitle);
      const placeHint = kind === "education" ? INSTITUTION_HINT : COMPANY_HINT;
      const titleHint = kind === "education" ? COURSE_START : ROLE_START;
      if (!title && !subtitle && pool.length >= 2) {
        const [a, b] = pool;
        const aIsPlace = placeHint.test(a) && !titleHint.test(a);
        const bIsTitle = titleHint.test(b) && !placeHint.test(b);
        if (aIsPlace || (bIsTitle && !titleHint.test(a))) {
          title = b;
          subtitle = a;
        } else {
          title = a;
          subtitle = b;
        }
        pool.splice(0, 2);
      }
      if (!title && pool.length) title = pool.shift()!;
      if (!subtitle && pool.length) subtitle = pool.shift()!;
      const extra = pool.length ? [pool.join(" · ")] : [];
      const desc = [...extra, ...x.desc];
      return {
        id: (kind === "experiences" ? "imp-e" : "imp-d") + i,
        title: titleCase(title),
        subtitle,
        period: x.period,
        description: desc.length > 1 || x.desc.length ? desc.map((l) => "• " + l).join("\n") : desc.join(""),
      };
    });
}

/** Divide listas escritas em linha ("Excel, Word; Comunicação • Vendas"), respeitando parênteses. */
function splitList(lines: string[]) {
  const out: string[] = [];
  for (const raw of lines) {
    const line = unbullet(clean(raw));
    if (!line) continue;
    let depth = 0,
      buf = "";
    for (const ch of line) {
      if (ch === "(") depth++;
      if (ch === ")") depth = Math.max(0, depth - 1);
      if (depth === 0 && /[,;|•·]/.test(ch)) {
        out.push(buf);
        buf = "";
      } else buf += ch;
    }
    out.push(buf);
  }
  const seen = new Set<string>();
  return out
    .map((x) => clean(x.replace(/^[\s\-–—e]+(?=\S)/, "")).replace(/[.]$/, ""))
    .filter((x) => x.length >= 2 && x.length <= 70)
    .filter((x) => {
      const k = strip(x);
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
}

const LEVEL_RE =
  /^(nativ[oa]|materno|fluente|avan[cç]ado|intermedi[aá]rio|b[aá]sico|t[eé]cnico|iniciante|leitura|conversa[cç][aã]o|proficiente|native|fluent|advanced|intermediate|basic|a1|a2|b1|b2|c1|c2)( .*)?$/i;

function parseLanguages(lines: string[]) {
  const items = splitList(lines);
  const merged: string[] = [];
  for (const it of items) {
    const prev = merged[merged.length - 1];
    if (prev && LEVEL_RE.test(it) && !/[—:-]/.test(prev)) merged[merged.length - 1] = prev + " — " + it;
    else merged.push(it);
  }
  return merged.map((x) => {
    // "Inglês básico" → "Inglês — Básico"
    const two = x.match(/^(\p{L}+)\s+(\p{L}.*)$/u);
    if (two && LEVEL_RE.test(two[2]) && !/[—:\-(]/.test(x)) x = two[1] + " — " + two[2];
    const m = x.match(/^([\p{L} ]+?)\s*(?:[:\-–—(]|\s{2,})\s*([\p{L} ]+?)\)?$/u);
    if (m) {
      const level = m[2].trim();
      return m[1].trim() + " — " + level.charAt(0).toLocaleUpperCase("pt-BR") + level.slice(1);
    }
    return x;
  });
}

function parseCourses(input: (string | ImportLine)[]) {
  const courses: string[] = [];
  let prevSize = 0;
  for (const item of input) {
    const it = typeof item === "string" ? { text: item } : item;
    const line = unbullet(clean(it.text));
    if (!line) continue;
    const prev = courses[courses.length - 1];
    const smaller = !!it.size && prevSize > 0 && it.size < prevSize - 0.4;
    const size = it.size || 0;
    // Linha de detalhes logo abaixo do curso ("SENAC · 40h"), às vezes só com a instituição.
    if (prev && !prev.includes(" — ") && line.length < 60 && (/ · /.test(line) || smaller)) {
      const [inst, ...rest] = line.split(" · ").map(clean);
      courses[courses.length - 1] = [inst, prev, ...rest].filter(Boolean).join(" — ");
      continue;
    }
    const parts = line
      .split(/\s+\|\s+|\s+[–—-]\s+/)
      .map(clean)
      .filter(Boolean);
    courses.push(parts.join(" — "));
    prevSize = size;
  }
  return courses.filter((x) => x.length > 2);
}

export function parseResume(input: ImportLine[] | string): ImportResult {
  const raw: ImportLine[] =
    typeof input === "string" ? input.split(/\r?\n/).map((text) => ({ text })) : input;
  const lines = raw
    .map((l) => ({ ...l, text: despace(clean(l.text)) }))
    .filter(
      (l) =>
        l.text &&
        !/^(p[aá]gina\s*)?\d+\s*(de|\/)\s*\d+$/i.test(l.text) &&
        !/^curr[ií]culo( vitae)?$/i.test(strip(l.text)),
    );

  // Junta linhas quebradas no meio ("Boas Práticas de Manipulação de" + "Alimentos").
  for (let i = lines.length - 2; i >= 0; i--) {
    const a = lines[i],
      b = lines[i + 1];
    const sameSize = !a.size || !b.size || Math.abs(a.size - b.size) < 0.15;
    if (
      sameSize &&
      /\s(de|da|do|das|dos|e|em|na|no|para|com|a|o|ao|à|sobre|entre|por)$/i.test(a.text) &&
      !a.text.includes(" | ") &&
      !headingOf(b.text) &&
      !isBullet(b.text)
    ) {
      lines[i] = { ...a, text: a.text + " " + b.text };
      lines.splice(i + 1, 1);
    }
  }
  // Divide "Objetivo: texto" e "OBJETIVO | texto" em título + conteúdo.
  const expanded: ImportLine[] = [];
  const firstCell = (t: string) => {
    const i = t.indexOf(" | ");
    return i < 0 ? [t, ""] : [t.slice(0, i), t.slice(i + 3)];
  };
  const upperShort = (t: string) =>
    t.length <= 30 && t === t.toLocaleUpperCase("pt-BR") && /[A-ZÀ-Ý]{2}/.test(t);
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    // Título quebrado em duas linhas, cada uma ao lado do conteúdo ("EXPERIÊNCIA | ..." / "PROFISSIONAL | ...").
    const [a, restA] = firstCell(l.text);
    const next = lines[i + 1];
    if (next && upperShort(a)) {
      const [b, restB] = firstCell(next.text);
      if (upperShort(b) && headingOf(a + " " + b) && (restA || restB || !headingOf(a))) {
        expanded.push({ ...l, text: a + " " + b });
        if (restA) expanded.push({ ...l, text: restA });
        if (restB) expanded.push({ ...next, text: restB });
        i++;
        continue;
      }
    }
    const m = l.text.match(/^([^:|]{3,45})\s*[:|]\s+(.{2,})$/);
    if (m && headingOf(m[1])) {
      expanded.push({ ...l, text: m[1] });
      expanded.push({ ...l, text: m[2] });
    } else expanded.push(l);
  }

  const sections: Record<SectionKey, string[]> = {
    summary: [],
    experiences: [],
    education: [],
    skills: [],
    languages: [],
    courses: [],
    contact: [],
    extras: [],
  };
  const header: ImportLine[] = [];
  const sectionLines: Record<SectionKey, ImportLine[]> = {
    summary: [],
    experiences: [],
    education: [],
    skills: [],
    languages: [],
    courses: [],
    contact: [],
    extras: [],
  };
  const found: string[] = [];
  let current: SectionKey | null = null;
  for (const l of expanded) {
    const h = headingOf(l.text);
    if (h) {
      current = h;
      if (!found.includes(h)) found.push(h);
      continue;
    }
    if (current) {
      sections[current].push(l.text);
      sectionLines[current].push(l);
    } else header.push(l);
  }

  // Cabeçalho e contato.
  const contactPool = [...header.map((h) => h.text), ...sections.contact];
  const joined = contactPool.join("\n") + "\n" + expanded.map((l) => l.text).join("\n");
  const email = joined.match(EMAIL)?.[0] || "";
  const phoneLine =
    contactPool.find((x) => PHONE.test(x)) ||
    expanded.map((l) => l.text).find((x) => PHONE.test(x) && x.length < 80);
  const phone = phoneLine?.match(PHONE)?.[0]?.trim() || "";
  const cityLine = contactPool.find((x) => CITY.test(x.replace(EMAIL, "").replace(PHONE, "")));
  let city = "";
  if (cityLine) {
    const m = cityLine.replace(EMAIL, "").replace(PHONE, "").match(CITY);
    if (m) {
      // "Centro - Ribeirão Preto/SP" → fica só a cidade (último trecho antes da UF).
      const place =
        m[1]
          .replace(/^(cidade|endere[cç]o|resid[eê]ncia)\s*:?\s*/i, "")
          .split(/\s[-–—]\s|,\s*/)
          .pop() || m[1];
      city = clean(place) + ", " + m[2];
    }
  }

  // Nome: maior fonte da primeira página que parece um nome; senão a primeira linha com cara de nome.
  const firstPart = (l: ImportLine): ImportLine => ({ ...l, text: l.text.split(" | ")[0].trim() });
  const pageOne = expanded.filter((l) => (l.page || 1) === 1);
  const bySize = [...pageOne]
    .filter((l) => l.size && looksLikeName(firstPart(l).text))
    .sort((a, b) => (b.size || 0) - (a.size || 0));
  const nameLine =
    (bySize[0] && bySize[0].size! >= Math.max(...pageOne.map((l) => l.size || 0)) * 0.8
      ? bySize[0]
      : undefined) ||
    header.find((h) => looksLikeName(h.text)) ||
    expanded.find((l) => looksLikeName(l.text));
  const name = nameLine
    ? titleCase(
        firstPart(nameLine)
          .text.replace(/[_|]+$/g, "")
          .trim(),
      )
    : "";

  // Cargo: linha logo após o nome, curta e sem dados de contato.
  const isContact = (s: string) =>
    EMAIL.test(s) || PHONE.test(s) || URL_RE.test(s) || (CITY.test(s) && s.length < 50);
  let role = "";
  if (nameLine) {
    const idx = expanded.indexOf(nameLine);
    for (const l of expanded.slice(idx + 1, idx + 4)) {
      if (headingOf(l.text) || isContact(l.text)) continue;
      const part = l.text
        .split(" | ")
        .map((x) => x.trim())
        .filter((x) => !/^[A-ZÀ-Ý]{1,3}$/.test(x) && !isContact(x))
        .sort((a, b) => b.length - a.length)[0];
      if (!part) continue;
      if (part.length <= 70 && !/^\d/.test(part) && !/[.;]$/.test(part)) {
        role = titleCase(part.replace(/^(cargo|objetivo|fun[cç][aã]o)\s*:\s*/i, ""));
      }
      break;
    }
  }

  const used = new Set([
    nameLine?.text,
    role && expanded.find((l) => titleCase(l.text.split(" | ")[0]) === role)?.text,
  ]);
  const unmatched: string[] = [];
  for (const h of [...header.map((x) => x.text), ...sections.contact]) {
    if (used.has(h)) continue;
    const rest = clean(
      h
        .replace(EMAIL, "")
        .replace(PHONE, "")
        .replace(cityLine === h ? CITY : /$^/, "")
        .replace(/\|/g, " "),
    );
    if (
      rest.length > 2 &&
      !/^(e-?mail|telefone|celular|whats(app)?|tel|fone|cidade|endere[cç]o)\s*:?$/i.test(rest)
    )
      unmatched.push(h);
  }
  unmatched.push(...sections.extras);

  let summary = sections.summary.join(" ").replace(/\s+/g, " ").trim();
  // Sem título de seção: um parágrafo longo no cabeçalho costuma ser o objetivo.
  if (!summary) {
    const para = unmatched.find((x) => x.length > 90 && !URL_RE.test(x));
    if (para) {
      summary = para;
      unmatched.splice(unmatched.indexOf(para), 1);
    }
  }

  // Tamanho do texto corrido: o mais comum entre linhas longas.
  const sizeCount = new Map<number, number>();
  for (const l of expanded)
    if (l.size && l.text.length > 40)
      sizeCount.set(+l.size.toFixed(1), (sizeCount.get(+l.size.toFixed(1)) || 0) + l.text.length);
  const bodySize = [...sizeCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 0;
  const experiences = parseItems(sectionLines.experiences, "experiences", bodySize);
  const education = parseItems(sectionLines.education, "education", bodySize);
  const skills = splitList(sections.skills);
  const languages = parseLanguages(sections.languages);
  const courses = parseCourses(sectionLines.courses);

  // Nenhuma seção reconhecida: tenta achar experiências pelo texto todo.
  if (!found.length && !experiences.length) {
    const body = expanded.filter((l) => l !== nameLine && !isContact(l.text)).map((l) => l.text);
    const guess = parseItems(body, "experiences").filter((x) => x.period);
    experiences.push(...guess);
  }

  return {
    cv: {
      name,
      role,
      email,
      phone: formatPhone(phone),
      city,
      summary,
      photo: "",
      experiences,
      education,
      courses,
      skills,
      languages,
    },
    unmatched: unmatched.map(clean).filter((x, i, a) => x && a.indexOf(x) === i),
    sectionsFound: found,
  };
}

function formatPhone(value: string) {
  let d = value.replace(/\D/g, "");
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) d = d.slice(2);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return value.trim();
}
