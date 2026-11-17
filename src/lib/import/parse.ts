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
  /** Dados pessoais e endereço encontrados (não vão para o currículo). */
  personal?: string[];
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
    /^(objetivos?( profissiona(l|is))?|resumo( profissional| de qualificac(ao|oes)| das qualificac(ao|oes))?|perfil( profissional| pessoal)?|sobre( mim)?|apresentacao|sumario( profissional)?|sintese( profissional| de qualificac(ao|oes))?|quem sou( eu)?|meu objetivo|summary|about)$/,
    "summary",
  ],
  [
    /^(experiencias?( profissiona(l|is)| de trabalho| anteriores)?|historico profissional|atuacao profissional|trajetoria profissional|empregos( anteriores)?|experiencias? e projetos|projetos|voluntariado|trabalho voluntario|experience|experiencia profissional e projetos)$/,
    "experiences",
  ],
  [
    /^(formac(ao|oes)( academica| escolar| educacional)?|escolaridade|educacao|graduacao|formacao e educacao|dados academicos|education|formacao academica e cursos)$/,
    "education",
  ],
  [
    /^(habilidades( e competencias| tecnicas| profissionais)?|competencias( tecnicas| profissionais| comportamentais)?|qualificac(ao|oes)( profissiona(l|is))?|conhecimentos( tecnicos| em informatica| especificos)?|informatica|ferramentas|hard skills|soft skills|skills|aptidoes|principais competencias|top skills|competencias e habilidades|habilidades e conhecimentos)$/,
    "skills",
  ],
  [/^(idiomas?|linguas?( estrangeiras)?|languages)$/, "languages"],
  [
    /^(cursos?( complementares| extracurriculares| livres| e certificac(oes|ados)| e treinamentos)?|certificac(ao|oes)|certificados?|treinamentos?|capacitac(ao|oes)|atividades complementares|formacao complementar|certifications|licencas e certificados|licenses certifications)$/,
    "courses",
  ],
  [/^(contatos?|dados pessoais|informac(ao|oes) pessoa(l|is)|informac(ao|oes) de contato)$/, "contact"],
  [
    /^(informac(ao|oes) adiciona(l|is)|outras informac(ao|oes)|referencias( profissionais)?|disponibilidade|observac(ao|oes)|diferenciais|honors awards|premios|publications|publicacoes)$/,
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
const END = `(?:${DATE}|atual(?:mente)?|(?:at[ée] )?o momento|momento|presente?|present|current|hoje|em andamento|cursando|em curso)`;
const RANGE_RE = new RegExp(
  `(?:(?:de|desde|per[ií]odo:?)\\s+)?${DATE}\\s*(?:[-–—]|\\ba\\b|at[ée])\\s*${END}|(?:desde|a partir de)\\s+${DATE}`,
  "i",
);
const SINGLE_RE = new RegExp(
  `(?:conclu[ií]d[oa]\\s*(?:em)?\\s*|previs[ãa]o(?: de conclus[ãa]o)?:?\\s*|t[ée]rmino:?\\s*|in[ií]cio:?\\s*)?${DATE}|\\b(?:cursando|em andamento|conclu[ií]d[oa]|incompleto|trancado)\\b`,
  "i",
);

/** "(3 anos 9 meses)" que o LinkedIn põe depois do período. */
const DURATION = /\s*\(\s*(?:\d+\s*(?:anos?|m[eê]s(?:es)?|years?|months?|mos?|yrs?)\s*)+\)/i;
const DURATION_LINE = /^(?:\d+\s*(?:anos?|m[eê]s(?:es)?|years?|months?)\s*)+$/i;
const STATES: Record<string, string> = {
  acre: "AC", alagoas: "AL", amapa: "AP", amazonas: "AM", bahia: "BA", ceara: "CE", "distrito federal": "DF",
  "espirito santo": "ES", goias: "GO", maranhao: "MA", "mato grosso": "MT", "mato grosso do sul": "MS",
  "minas gerais": "MG", para: "PA", paraiba: "PB", parana: "PR", pernambuco: "PE", piaui: "PI",
  "rio de janeiro": "RJ", "rio grande do norte": "RN", "rio grande do sul": "RS", rondonia: "RO", roraima: "RR",
  "santa catarina": "SC", "sao paulo": "SP", sergipe: "SE", tocantins: "TO",
};
/** "Curitiba, Paraná, Brasil" → "Curitiba, PR". */
function cityFromLocation(text: string) {
  const parts = text.split(/\s*[,/–-]\s*/).filter((p) => !/^(brasil|brazil)$/i.test(p));
  if (parts.length >= 2) {
    const uf = STATES[strip(parts[1])] || (/^[A-Z]{2}$/.test(parts[1]) ? parts[1] : "");
    if (uf) return parts[0] + ", " + uf;
  }
  return parts.length === 1 && STATES[strip(parts[0])] ? "" : text.replace(/,\s*(Brasil|Brazil)$/i, "");
}
/** Linha só com o local do trabalho ("Curitiba, Paraná, Brasil", "Campinas - SP"). */
const STATE_NAMES =
  "Acre|Alagoas|Amapá|Amazonas|Bahia|Ceará|Distrito Federal|Espírito Santo|Goiás|Maranhão|Mato Grosso do Sul|Mato Grosso|Minas Gerais|Pará|Paraíba|Paraná|Pernambuco|Piauí|Rio de Janeiro|Rio Grande do Norte|Rio Grande do Sul|Rondônia|Roraima|Santa Catarina|São Paulo|Sergipe|Tocantins";
const LOCATION_LINE = new RegExp(
  `^(?:[\\p{L} .'-]{2,40},\\s*)?[\\p{L} .'-]{2,40},\\s*(?:Brasil|Brazil)$|^[\\p{L} .'-]{2,40},\\s*(?:${STATE_NAMES})$|^[\\p{L} .'-]{2,40}\\s*[-/,–]\\s*(?:${UF})$`,
  "u",
);
/** Tira pontuação das pontas sem quebrar parênteses: "Universidade X (UNAERP)". */
function trimEdges(x: string) {
  let t = x.replace(/^[,;:\s–—·-]+|[,;:\s–—·-]+$/g, "");
  if (t.startsWith("(") && !t.includes(")")) t = t.slice(1);
  if (t.endsWith("(")) t = t.slice(0, -1);
  if (t.endsWith(")") && !t.includes("(")) t = t.slice(0, -1);
  t = t.replace(/\(\s*\)/g, "").trim();
  return t.replace(/^[,;:\s–—·-]+|[,;:\s–—·-]+$/g, "");
}
/** "Analista de Logística na Empresa X" → cargo + empresa. */
function splitRoleAt(line: string): string[] {
  const m = line.match(/^(.{3,60}?)\s+(?:na|no|em|pela|pelo|at)\s+([A-ZÀ-Ý0-9].{1,60})$/);
  if (m && (ROLE_START.test(m[1]) || COMPANY_HINT.test(m[2]))) return [m[1], m[2]];
  return [line];
}

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
    words.every((w) => /^[\p{L}'.-]+$/u.test(w) && /\p{L}/u.test(w)) &&
    !isBullet(t) &&
    !PERSONAL_RE.test(t) &&
    !NOT_NAME.test(strip(t)) &&
    !headingOf(t)
  );
};
/** Palavras que nunca fazem parte de um nome de pessoa. */
const NOT_NAME =
  /\b(curriculo|resumo|experiencia|objetivo|formacao|habilidades|competencias|qualificacoes|informacoes|dados|contato|perfil|profissional|vitae|endereco)\b/;
/** Dados pessoais que não entram no currículo (e que o robô sugere tirar). */
const PERSONAL_RE =
  /\b(brasileir[oa]|solteir[oa]|casad[oa]|divorciad[oa]|separad[oa]|vi[uú]v[oa]|uni[aã]o est[aá]vel|estado civil|nacionalidade|naturalidade|data de nascimento|nascid[oa] em|nascimento|idade|cpf|rg|ctps|pis|t[ií]tulo de eleitor|reservista|filhos?|\d{2}\s+anos(?! de))\b/i;
const ADDRESS_RE =
  /^(?:endere[cç]o\s*:?\s*)?(?:rua|r\.|av\.?|avenida|travessa|tv\.|alameda|al\.|rodovia|estrada|pra[cç]a|quadra|qd\.?|conjunto|condom[ií]nio)\s|^endere[cç]o\s*:|^bairro\s*:|\bcep\s*:?\s*\d{5}-?\d{3}/i;

const COMPANY_HINT =
  /\b(ltda|s\.?\/?a\.?|eireli|me|epp|grupo|empresa|com[eé]rcio|ind[uú]stria|hospital|cl[ií]nica|escola|col[eé]gio|loja|lojas|supermercados?|mercado|atacad|restaurante|prefeitura|banco|universidade|instituto|faculdade|transportadora|distribuidora|construtora|associa[cç][aã]o|funda[cç][aã]o|centro|rede|farm[aá]cia|drogaria|ag[eê]ncia|consultoria|servi[cç]os|log[ií]stica|tecnologia|sistemas|software|telecom|alimentos|metal[uú]rgica|t[eê]xtil|ind\.|cia\.?|companhia|holding|secretaria|governo|minist[eé]rio|ong|cooperativa|condom[ií]nio|shopping|padaria|hotel|pousada|bar|lanchonete|oficina|auto|posto|est[uú]dio|igreja|par[oó]quia|ifood|uber|99)\b/i;
const ROLE_HINT =
  /\b(auxiliar|assistente|analista|gerente|coordenador|coordenadora|supervisor|supervisora|vendedor|vendedora|atendente|operador|operadora|t[eé]cnic[oa]|estagi[aá]ri[oa]|aprendiz|recepcionista|motorista|professor|professora|desenvolvedor|desenvolvedora|engenheir[oa]|cozinheir[oa]|repositor|caixa|promotor|promotora|consultor|consultora|diretor|diretora|encarregad[oa]|l[ií]der|estoquista|gar[cç]om|gar[cç]onete|porteiro|vigilante|zelador|faxineir[oa]|diarista|bab[aá]|cuidador|cuidadora|enfermeir[oa]|secret[aá]ri[oa]|designer|programador|programadora|montador|mec[aâ]nico|eletricista|pedreiro|ajudante|servente|copeir[oa]|balconista|frentista|entregador|conferente|almoxarife|comprador|contador|contadora|advogad[oa]|administrador|administradora|especialista|s[oó]ci[oa]|propriet[aá]ri[oa]|aut[oô]nom[oa]|freelancer|volunt[aá]ri[oa]|monitor|monitora|instrutor|instrutora|tutor|bolsista|trainee|executiv[oa]|chefe|agente|inspetor|fiscal|membro|integrante|participante|representante|op\.?)\b/i;
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
  // Na formação, uma data ou "previsão de conclusão: ..." vale mais que só "cursando".
  const eduDated = new RegExp(
    `(?:${RANGE_RE.source})|(?:previs[ãa]o(?: de conclus[ãa]o)?:?\\s*(?:em\\s*)?|conclu[ií]d[oa]\\s*(?:em)?\\s*|t[ée]rmino:?\\s*)?${DATE}`,
    "i",
  );
  const STATUS = /\b(cursando|em andamento|conclu[ií]d[oa]|completo|incompleto|trancado)\b/i;
  const soloDate = new RegExp(`^${DATE}${tail}$`, "i");
  let lastWasBullet = false;

  for (const item of lines) {
    let line = clean(item.text).replace(/\s+·$/, "");
    if (!line || DURATION_LINE.test(line) || /^page \d+ of \d+$/i.test(line)) continue;
    // Local do trabalho em linha própria (LinkedIn e modelos prontos): não é cargo nem empresa.
    if (LOCATION_LINE.test(line) && (cur as Draft | null)?.period) continue;
    line = line.replace(DURATION, "");
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
    let periodMatch = solo ? ([solo] as unknown as RegExpMatchArray) : line.match(periodRe);
    let status = "";
    if (kind === "education" && periodMatch && !solo && !/\d/.test(periodMatch[0])) {
      const dated = line.match(eduDated);
      if (dated) {
        // "Cursando o 3º ano ... – previsão de conclusão: dezembro de 2024"
        const st = line.match(/^\s*(cursando|em andamento)\b\s*(?:o|a)?\s*/i);
        if (st) {
          status = st[1].charAt(0).toUpperCase() + st[1].slice(1).toLowerCase();
          line = line.slice(st[0].length);
        }
        periodMatch = line.match(eduDated) || dated;
      }
    }
    const bullet = isBullet(line);
    if (periodMatch && !bullet && line.length < 140) {
      const hasContent = d.period || d.desc.length;
      if (hasContent && (d.period || d.header.length >= 1)) d = fresh();
      const when = clean(periodMatch[0].replace(/^per[ií]odo:?\s*/i, ""));
      d.period = status ? status + " · " + when.charAt(0).toLowerCase() + when.slice(1) : when;
      // Com " | " (blocos separados no PDF), cada bloco é um campo; sem ele, "Cargo - Empresa".
      let restText = clean(line.replace(periodMatch[0], " ")).replace(/\(\s*\)/g, " ");
      // "Trabalho voluntário na Igreja X (2022 – 2023): organização de eventos..." → descrição depois dos dois-pontos.
      const colon = restText.match(/^([^:]{3,80}):\s+(.{15,})$/);
      if (colon && !LABEL_RE.test(restText)) {
        restText = colon[1];
        d.desc.push(clean(colon[2]));
      }
      const rest = clean(restText)
        .split(parts.length > 1 ? /\s*\|\s*/ : /\s+(?:\||[–—-])\s+|\s*\|\s*/)
        .map(trimEdges)
        .filter((x) => x.length > 1);
      if (kind === "experiences" && rest.length === 1) rest.splice(0, 1, ...splitRoleAt(rest[0]));
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
    const pieces =
      parts.length > 1
        ? parts
        : fresh2
          ? line
              .split(/\s+[–—-]\s+|\s+@\s+/)
              .map(trimEdges)
              .filter(Boolean)
          : [line];
    d.header.push(...(kind === "experiences" && pieces.length === 1 && fresh2 ? splitRoleAt(pieces[0]) : pieces));
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
        period: normalizePeriod(x.period),
        description:
          desc.length > 1 || x.desc.length ? desc.map((l) => "• " + capFirst(l)).join("\n") : desc.join(""),
      };
    });
}

const capFirst = (s: string) => s.charAt(0).toLocaleUpperCase("pt-BR") + s.slice(1);
/** "março de 2021 - Present" → "março de 2021 - Atual"; "cursando" → "Cursando". */
function normalizePeriod(p: string) {
  return capFirst(p.replace(/\b(present|presente|current|o momento|momento)\b/i, "Atual").replace(/at[ée] Atual/i, "a Atual"));
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

const LINKEDIN_LEVEL: [RegExp, string][] = [
  [/native or bilingual|nativo ou biling/i, "Nativo"],
  [/full professional|profissional completo/i, "Fluente"],
  [/professional working|profissional$|competência profissional/i, "Avançado"],
  [/limited working|limitad/i, "Intermediário"],
  [/elementary|elementar/i, "Básico"],
];
function parseLanguages(lines: string[]) {
  const items = splitList(lines).map((x) => {
    const m = x.match(/^(.+?)\s*\(([^)]+)\)$/);
    if (!m) return x;
    const level = LINKEDIN_LEVEL.find(([re]) => re.test(m[2]));
    return level ? m[1] + " — " + level[1] : x;
  });
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
        !/^page \d+ of \d+$/i.test(l.text) &&
        !/^\(linkedin\)$/i.test(l.text) &&
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

  // Perfil exportado do LinkedIn: nome, título e local ficam logo antes de "Resumo"/"Experiência".
  const linkedin = { name: "", role: "", city: "" };
  const liMarkers = expanded.filter((l) =>
    /^(principais competencias|top skills|languages|certifications|linkedin)$/.test(strip(l.text)),
  ).length;
  if (liMarkers >= 2 || (liMarkers && expanded.some((l) => /linkedin\.com\/in\//i.test(l.text)))) {
    const firstMain = expanded.findIndex((l) => {
      const h = headingOf(l.text);
      return h === "summary" || h === "experiences";
    });
    let j = firstMain - 1;
    const take: number[] = [];
    if (j >= 0 && LOCATION_LINE.test(expanded[j].text)) {
      linkedin.city = cityFromLocation(expanded[j].text);
      take.push(j);
      j--;
    }
    for (let k = j; k >= Math.max(0, j - 3); k--) {
      if (looksLikeName(expanded[k].text) && !headingOf(expanded[k].text)) {
        linkedin.name = expanded[k].text;
        linkedin.role = expanded
          .slice(k + 1, j + 1)
          .map((l) => l.text)
          .join(" ")
          .split(/\s+\|\s+/)[0]
          .replace(/\s+(?:na|no|at|em)\s+[A-ZÀ-Ý].*$/, "");
        for (let x = k; x <= j; x++) take.push(x);
        break;
      }
    }
    if (linkedin.name) for (const x of take.sort((a, b) => b - a)) expanded.splice(x, 1);
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
  /** Cidade de verdade: "COREN-SP" ou "CRM-RJ" não são cidades. */
  const cityIn = (x: string) => {
    const m = x.replace(EMAIL, "").replace(PHONE, "").match(CITY);
    if (!m) return null;
    const place = m[1].trim();
    if (/^(coren|crm|cro|crea|crc|oab|crp|crf|crefito|cref|cnh|rg|cpf|ssp)$/i.test(place)) return null;
    if (place === place.toUpperCase() && !place.includes(" ") && place.length <= 6) return null;
    return m;
  };
  const contactPool = [...header.map((h) => h.text), ...sections.contact];
  const allText = expanded.map((l) => l.text);
  const joined = contactPool.join("\n") + "\n" + allText.join("\n");
  const email = joined.match(EMAIL)?.[0] || "";
  const phoneLine = contactPool.find((x) => PHONE.test(x)) || allText.find((x) => PHONE.test(x) && x.length < 80);
  const phone = phoneLine?.match(PHONE)?.[0]?.trim() || "";
  const cityLine =
    contactPool.find((x) => (EMAIL.test(x) || PHONE.test(x)) && cityIn(x)) || contactPool.find((x) => cityIn(x));
  let city = linkedin.city;
  if (!city && cityLine) {
    const m = cityIn(cityLine);
    if (m) {
      // "Centro - Ribeirão Preto/SP" → fica só a cidade (último trecho antes da UF).
      const place =
        m[1]
          .replace(/^(cidade|endere[cç]o|resid[eê]ncia)\s*:?\s*/i, "")
          .split(/\s[-–—]\s|,\s*/)
          .pop() || m[1];
      city = clean(place) + ", " + m[2];
      const mode = cityLine.match(new RegExp(m[2] + "\\s*[·|–—-]?\\s*(remoto|h[ií]brido|presencial)\\b", "i"));
      if (mode) city += " · " + mode[1].charAt(0).toUpperCase() + mode[1].slice(1).toLowerCase();
    }
  }

  // Dados pessoais e endereço: não entram no currículo (o robô sugere tirar).
  const personal = contactPool.filter(
    (x) => x.length < 120 && (ADDRESS_RE.test(x) || (PERSONAL_RE.test(x) && !EMAIL.test(x))),
  );
  const isPersonal = (x: string) => personal.includes(x);

  // Nome: "Nome: ..." > maior fonte da 1ª página > primeira linha com cara de nome.
  const labeledName = contactPool
    .map((x) => x.match(/^nome(?: completo)?\s*:\s*(.+)$/i)?.[1])
    .find((x) => x && looksLikeName(x));
  const firstPart = (l: ImportLine): ImportLine => ({ ...l, text: l.text.split(" | ")[0].trim() });
  const pageOne = expanded.filter((l) => (l.page || 1) === 1);
  const bySize = [...pageOne]
    .filter((l) => l.size && looksLikeName(firstPart(l).text))
    .sort((a, b) => (b.size || 0) - (a.size || 0));
  const nameLine = labeledName
    ? undefined
    : (bySize[0] && bySize[0].size! >= Math.max(...pageOne.map((l) => l.size || 0)) * 0.8 ? bySize[0] : undefined) ||
      header.find((h) => looksLikeName(h.text) && !isPersonal(h.text)) ||
      expanded.find((l) => looksLikeName(l.text) && !isPersonal(l.text));
  let name = linkedin.name || labeledName || (nameLine ? firstPart(nameLine).text.replace(/[_|]+$/g, "").trim() : "");
  // Nome quebrado em duas linhas no topo ("MARCOS VINÍCIUS" / "LIMA").
  let nameExtra: ImportLine | undefined;
  if (nameLine && !linkedin.name && !labeledName) {
    const next = expanded[expanded.indexOf(nameLine) + 1];
    const upper = (t: string) => t === t.toLocaleUpperCase("pt-BR");
    if (
      next &&
      name.split(" ").length <= 3 &&
      /^[\p{L}'.-]+( [\p{L}'.-]+)?$/u.test(next.text) &&
      upper(next.text) === upper(name) &&
      (!next.size || !nameLine.size || Math.abs(next.size - nameLine.size) < 0.5) &&
      !ROLE_START.test(next.text) &&
      !headingOf(next.text)
    ) {
      name += " " + next.text;
      nameExtra = next;
    }
  }
  name = titleCase(name);

  // Cargo: linha logo após o nome, curta e sem dados de contato ou pessoais.
  const isContact = (s: string) => EMAIL.test(s) || PHONE.test(s) || URL_RE.test(s) || (!!cityIn(s) && s.length < 50);
  let role = linkedin.role;
  let roleText = "";
  if (!role && (nameLine || labeledName)) {
    const idx = nameLine ? expanded.indexOf(nameExtra || nameLine) : -1;
    const after = idx >= 0 ? expanded.slice(idx + 1, idx + 5) : [];
    for (const l of after) {
      if (headingOf(l.text) || isContact(l.text) || isPersonal(l.text) || PERSONAL_RE.test(l.text) || ADDRESS_RE.test(l.text))
        continue;
      const part = l.text
        .split(" | ")
        .map((x) => x.trim())
        .filter((x) => !/^[A-ZÀ-Ý]{1,3}$/.test(x) && !isContact(x))
        .sort((a, b) => b.length - a.length)[0];
      if (!part) continue;
      if (part.length <= 70 && !/^\d/.test(part) && !/[.;]$/.test(part)) {
        role = titleCase(part.replace(/^(cargo|objetivo|fun[cç][aã]o|[aá]rea de interesse)\s*:\s*/i, ""));
        roleText = l.text;
      }
      break;
    }
  }

  const used = new Set([nameLine?.text, nameExtra?.text, roleText]);
  // Em modelos com coluna lateral, nome e cargo podem cair dentro de uma seção: tira de lá.
  for (const key of Object.keys(sectionLines) as SectionKey[]) {
    const keep = sectionLines[key].filter((l) => !(l === nameLine || l === nameExtra || (roleText && l.text === roleText)));
    if (keep.length !== sectionLines[key].length) {
      sectionLines[key] = keep;
      sections[key] = keep.map((l) => l.text);
    }
  }
  const unmatched: string[] = [];
  for (const h of [...header.map((x) => x.text), ...sections.contact]) {
    if (used.has(h) || isPersonal(h) || /^nome(?: completo)?\s*:/i.test(h)) continue;
    // Tira o que já foi aproveitado (e-mail, telefones, cidade, rótulos); sobra só o que é novo.
    const urls = h.match(new RegExp(URL_RE.source, "gi")) || [];
    const rest = clean(
      h
        .replace(new RegExp(EMAIL.source, "gi"), " ")
        .replace(new RegExp(PHONE.source, "g"), " ")
        .replace(new RegExp(URL_RE.source, "gi"), " ")
        .replace(CITY, " ")
        .replace(/\b(e-?mail|telefones?|celular|whats(app)?|tel|fone|cidade|endere[cç]o|linkedin|github|portf[oó]lio|site|remoto|h[ií]brido|presencial)\b\s*:?/gi, " ")
        .replace(/[|/•·,;()–—-]/g, " "),
    );
    if (rest.length > 2) unmatched.push(h);
    else unmatched.push(...urls.map((u) => u.replace(/[),.;]+$/, "")));
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
  // "Objetivo: Jovem Aprendiz" é o cargo desejado, não um texto de objetivo.
  if (summary && summary.length <= 45 && summary.split(" ").length <= 6 && !/[.;]$/.test(summary)) {
    if (!role) role = titleCase(summary);
    summary = "";
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
    const body = expanded.filter(
      (l) => l !== nameLine && l !== nameExtra && !isContact(l.text) && l.text !== summary && l.text !== roleText,
    );
    const guess = parseItems(body, "experiences").filter((x) => x.period);
    experiences.push(...guess);
    if (guess.length) {
      // O que virou experiência sai da lista de sobras.
      const usedText = guess.flatMap((g) => [g.title, g.subtitle, g.period, ...g.description.split("\n")]).map(strip);
      for (let i = unmatched.length - 1; i >= 0; i--) {
        const k = strip(unmatched[i]);
        if (usedText.some((u) => u && k.includes(u))) unmatched.splice(i, 1);
      }
    }
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
    personal,
  };
}

function formatPhone(value: string) {
  let d = value.replace(/\D/g, "");
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) d = d.slice(2);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return value.trim();
}
