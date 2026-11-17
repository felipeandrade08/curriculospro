// Compara o anúncio de uma vaga com um currículo usando um dicionário de competências
// reais do mercado brasileiro, em vez de palavras soltas. Roda só no navegador.
import type { ResumeData } from "@/lib/resume";

export type MatchKind = "skill" | "soft" | "course" | "language" | "license" | "education";
type Entry = { label: string; kind: MatchKind; terms: string[] };

export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9+#]+/g, " ")
    .trim();

const E = (label: string, kind: MatchKind, ...terms: string[]): Entry => ({
  label,
  kind,
  terms: [norm(label), ...terms.map(norm)],
});

const DICTIONARY: Entry[] = [
  // Escritório e administrativo
  E("Pacote Office", "skill", "office", "microsoft office", "word excel", "word e excel"),
  E("Excel", "skill", "planilhas", "planilha eletronica", "ms excel"),
  E("Excel avançado", "skill", "excel avancado", "procv", "tabela dinamica", "tabelas dinamicas"),
  E("Word", "skill", "ms word"),
  E("PowerPoint", "skill", "power point", "apresentacoes"),
  E("Power BI", "skill", "powerbi"),
  E("Google Workspace", "skill", "google planilhas", "google sheets", "google drive"),
  E("Informática básica", "skill", "informatica", "conhecimentos em informatica", "informatica basica"),
  E("Digitação", "skill", "digitar", "digitacao rapida"),
  E("Rotinas administrativas", "skill", "rotina administrativa", "rotinas de escritorio", "apoio administrativo"),
  E("Arquivo e organização de documentos", "skill", "arquivo", "arquivamento", "organizacao de documentos", "controle de documentos"),
  E("Emissão de notas fiscais", "skill", "nota fiscal", "notas fiscais", "nf e", "nfe", "emissao de nf"),
  E("Contas a pagar e receber", "skill", "contas a pagar", "contas a receber"),
  E("Faturamento", "skill", "faturar"),
  E("Conciliação bancária", "skill", "conciliacao", "conciliacao bancaria"),
  E("Fluxo de caixa", "skill", "controle de caixa"),
  E("Cobrança", "skill", "cobrancas", "recuperacao de credito"),
  E("Departamento pessoal", "skill", "dp", "folha de pagamento", "admissao e demissao", "admissoes", "esocial"),
  E("Recrutamento e seleção", "skill", "recrutamento", "selecao de pessoas", "triagem de curriculos"),
  E("Contabilidade", "skill", "contabil", "lancamentos contabeis", "apuracao de impostos"),
  E("ERP", "skill", "sap", "totvs", "protheus", "sistema erp", "omie", "bling"),
  E("Agendamento", "skill", "agenda", "agendamentos", "marcacao de consultas"),
  E("Recepção", "skill", "recepcionar", "recepcionista", "recepcao de clientes", "recepcao de visitantes"),
  E("Secretariado", "skill", "secretaria", "secretariar"),
  // Atendimento e vendas
  E("Atendimento ao cliente", "skill", "atendimento", "atender clientes", "atendimento ao publico", "atendimento presencial", "sac"),
  E("Atendimento telefônico", "skill", "ligacoes", "telefonico", "central de atendimento", "call center", "telemarketing"),
  E("Vendas", "skill", "vender", "vendedor", "vendedora", "representante comercial", "metas de vendas", "venda consultiva"),
  E("Negociação", "skill", "negociar", "negociacoes"),
  E("Prospecção de clientes", "skill", "prospeccao", "prospectar", "captacao de clientes"),
  E("Pós-venda", "skill", "pos venda", "fidelizacao", "fidelizar clientes"),
  E("Operação de caixa", "skill", "caixa", "operador de caixa", "operadora de caixa", "frente de caixa", "fechamento de caixa"),
  E("Reposição de mercadorias", "skill", "reposicao", "repositor", "abastecimento de gondolas", "gondolas"),
  E("Merchandising", "skill", "visual merchandising", "exposicao de produtos", "vitrine"),
  E("CRM", "skill", "salesforce", "hubspot", "pipedrive", "rd station"),
  E("WhatsApp Business", "skill", "whatsapp"),
  // Logística e indústria
  E("Controle de estoque", "skill", "estoque", "inventario", "almoxarifado", "gestao de estoque"),
  E("Recebimento e conferência", "skill", "conferencia", "conferir mercadorias", "recebimento de mercadorias", "conferente"),
  E("Separação de pedidos", "skill", "separacao", "picking", "expedicao", "embalagem"),
  E("Logística", "skill", "logistica", "roteirizacao", "distribuicao"),
  E("Empilhadeira", "course", "operador de empilhadeira", "nr 11", "nr11"),
  E("Produção", "skill", "linha de producao", "auxiliar de producao", "operador de producao"),
  E("Operação de máquinas", "skill", "operar maquinas", "operador de maquinas"),
  E("Controle de qualidade", "skill", "inspecao de qualidade", "garantia da qualidade"),
  E("Manutenção", "skill", "manutencao preventiva", "manutencao corretiva"),
  E("Leitura de desenho técnico", "skill", "desenho tecnico", "interpretacao de desenho"),
  E("Elétrica", "skill", "eletricista", "instalacoes eletricas", "eletrica predial", "eletrica industrial"),
  E("NR-10", "course", "nr 10", "nr10"),
  E("NR-35", "course", "nr 35", "nr35", "trabalho em altura"),
  E("NR-12", "course", "nr 12", "nr12"),
  E("NR-33", "course", "nr 33", "nr33", "espaco confinado"),
  E("NR-06", "course", "nr 06", "nr 6", "epi", "uso de epi", "uso de epis"),
  E("Primeiros socorros", "course", "socorros"),
  E("Brigada de incêndio", "course", "brigadista", "combate a incendio"),
  E("Segurança do trabalho", "skill", "seguranca do trabalho", "tecnico de seguranca", "sesmt"),
  E("5S", "skill", "programa 5s"),
  // Construção, limpeza e serviços
  E("Construção civil", "skill", "obra", "obras", "pedreiro", "servente", "alvenaria"),
  E("Pintura", "skill", "pintor", "pintura predial"),
  E("Limpeza", "skill", "higienizacao", "limpeza e conservacao", "servicos gerais", "auxiliar de limpeza", "zeladoria"),
  E("Portaria", "skill", "porteiro", "controle de acesso", "controle de entrada"),
  E("Vigilância", "course", "vigilante", "curso de vigilante", "seguranca patrimonial"),
  E("Jardinagem", "skill", "jardineiro", "paisagismo"),
  // Alimentação
  E("Cozinha", "skill", "cozinheiro", "cozinheira", "preparo de alimentos", "auxiliar de cozinha", "pre preparo"),
  E("Boas práticas de manipulação de alimentos", "course", "manipulacao de alimentos", "boas praticas", "manipulador de alimentos"),
  E("Atendimento de salão", "skill", "garcom", "garconete", "atendimento de mesas"),
  E("Barista", "skill", "cafeteria"),
  E("Panificação", "skill", "padeiro", "confeitaria", "confeiteiro"),
  // Saúde e cuidado
  E("COREN ativo", "license", "coren"),
  E("Técnico de enfermagem", "education", "tecnico em enfermagem", "tecnica de enfermagem", "enfermagem"),
  E("Cuidado de idosos", "skill", "cuidador", "cuidadora", "idosos"),
  E("Cuidado infantil", "skill", "baba", "criancas", "cuidado com criancas", "recreacao"),
  E("Sinais vitais", "skill", "aferir pressao", "aferir sinais vitais"),
  E("Administração de medicamentos", "skill", "medicacao", "medicamentos"),
  E("Farmácia", "skill", "balconista de farmacia", "atendente de farmacia", "drogaria"),
  E("Faturamento hospitalar", "skill", "convenios", "guias tiss", "tiss"),
  // Educação
  E("Planejamento de aulas", "skill", "plano de aula", "planejamento pedagogico"),
  E("Alfabetização", "skill", "alfabetizar"),
  E("Educação inclusiva", "skill", "inclusao", "libras", "aee"),
  E("Libras", "language"),
  // Tecnologia
  E("Suporte técnico", "skill", "suporte", "help desk", "service desk", "helpdesk"),
  E("Redes", "skill", "redes de computadores", "infraestrutura de ti", "cabeamento"),
  E("Manutenção de computadores", "skill", "montagem e manutencao", "hardware", "formatacao"),
  E("Windows", "skill", "windows server", "active directory"),
  E("Linux", "skill"),
  E("SQL", "skill", "banco de dados", "mysql", "postgresql", "sql server"),
  E("Python", "skill"),
  E("JavaScript", "skill", "javascript", "typescript", "node", "nodejs", "react"),
  E("Java", "skill"),
  E("HTML e CSS", "skill", "html", "css"),
  E("Git", "skill", "github", "gitlab"),
  E("Análise de dados", "skill", "analise de dados", "indicadores", "kpis", "dashboards", "relatorios gerenciais"),
  // Marketing e criação
  E("Redes sociais", "skill", "social media", "instagram", "facebook", "tiktok", "midias sociais"),
  E("Marketing digital", "skill", "marketing", "trafego pago", "meta ads", "google ads", "anuncios"),
  E("Canva", "skill"),
  E("Photoshop", "skill", "adobe", "illustrator", "pacote adobe"),
  E("Produção de conteúdo", "skill", "criacao de conteudo", "copywriting", "redacao"),
  E("Edição de vídeo", "skill", "edicao de videos", "premiere", "capcut"),
  E("SEO", "skill"),
  // Transporte
  E("Direção defensiva", "course", "direcao defensiva"),
  E("Entregas", "skill", "entregador", "motoboy", "entrega de mercadorias"),
  E("MOPP", "course", "transporte de produtos perigosos"),
  // Comportamentais
  E("Trabalho em equipe", "soft", "colaboracao", "espirito de equipe"),
  E("Comunicação", "soft", "boa comunicacao", "comunicativo", "comunicativa", "comunicacao clara"),
  E("Proatividade", "soft", "proativo", "proativa", "iniciativa"),
  E("Organização", "soft", "organizado", "organizada", "organizacao"),
  E("Pontualidade", "soft", "pontual", "assiduidade", "assiduo"),
  E("Responsabilidade", "soft", "comprometimento", "comprometido", "comprometida"),
  E("Liderança", "soft", "lideranca", "lider", "gestao de equipe", "coordenar equipe", "supervisao"),
  E("Resolução de problemas", "soft", "resolver problemas", "solucao de problemas"),
  E("Atenção aos detalhes", "soft", "atencao", "detalhista", "atento a detalhes"),
  E("Flexibilidade", "soft", "flexivel", "adaptabilidade", "disponibilidade de horario", "escala 6x1", "escala 12x36"),
  E("Empatia", "soft", "cordialidade", "cordial", "simpatia", "educacao no atendimento"),
  E("Agilidade", "soft", "agil", "dinamismo"),
  E("Foco em resultados", "soft", "metas", "resultados", "orientado a resultados"),
  E("Gestão do tempo", "soft", "prazos", "cumprir prazos"),
];

const LANGUAGES: Entry[] = [
  E("Inglês", "language", "ingles"),
  E("Espanhol", "language", "espanhol"),
  E("Francês", "language", "frances"),
  E("Italiano", "language"),
  E("Alemão", "language", "alemao"),
];

const EDUCATION: Entry[] = [
  E("Ensino fundamental", "education", "ensino fundamental completo", "fundamental completo"),
  E("Ensino médio completo", "education", "ensino medio", "medio completo", "2o grau", "segundo grau"),
  E("Curso técnico", "education", "tecnico em", "formacao tecnica", "curso tecnico"),
  E("Ensino superior", "education", "superior completo", "graduacao", "graduado", "graduada", "bacharelado", "licenciatura", "tecnologo", "superior em andamento", "cursando superior"),
  E("Pós-graduação", "education", "pos graduacao", "mba", "especializacao"),
];

export type JobRequirement = {
  key: string;
  label: string;
  kind: MatchKind;
  /** Quantas vezes a vaga cita o item. */
  mentions: number;
  /** Já aparece no currículo. */
  has: boolean;
  /** Pode ser adicionado com um toque (competência, curso ou idioma). */
  addable: boolean;
  weight: number;
};

export type JobMatch = {
  score: number;
  requirements: JobRequirement[];
  experience: string | null;
  tips: { text: string; action?: "role" }[];
  /** Palavras que a vaga repete, para quando o dicionário não reconhece quase nada. */
  repeated: string[];
};

const WEIGHT: Record<MatchKind, number> = {
  license: 3,
  education: 2.5,
  language: 2,
  course: 2,
  skill: 1.5,
  soft: 0.75,
};

const esc = (t: string) => t.replace(/[+#]/g, "\\$&");
/** Conta citações sem repetir trechos sobrepostos (ex.: "ensino medio" dentro de "ensino medio completo"). */
const countIn = (haystack: string, terms: string[]) => {
  const list = [...new Set(terms.filter(Boolean))].sort((a, b) => b.length - a.length);
  if (!list.length) return 0;
  const re = new RegExp("(?:^|\\s)(?:" + list.map(esc).join("|") + ")(?=\\s|$)", "g");
  return (haystack.match(re) || []).length;
};
const EDU_LEVEL: Record<string, number> = {
  "Ensino fundamental": 1,
  "Ensino médio completo": 2,
  "Ensino superior": 3,
  "Pós-graduação": 4,
};

export function resumeText(cv: ResumeData) {
  return norm(
    [
      cv.role,
      cv.summary,
      ...cv.experiences.flatMap((x) => [x.title, x.subtitle, x.description]),
      ...cv.education.flatMap((x) => [x.title, x.subtitle, x.description]),
      ...cv.courses,
      ...cv.skills,
      ...cv.languages,
    ].join(" \n "),
  );
}

const STOP = new Set(
  (
    "a o e de da do das dos em no na nos nas um uma uns umas para por com sem que se ou ao aos as os " +
    "sua seu suas seus como mais muito ser ter estar sera serao voce voces nosso nossa nossos nossas " +
    "empresa vaga vagas candidato candidata candidatos requisitos requisito desejavel desejaveis " +
    "obrigatorio obrigatoria diferencial diferenciais atividades atividade responsabilidades beneficios " +
    "beneficio salario remuneracao horario local trabalho experiencia area cargo funcao principais " +
    "realizar auxiliar apoio atuar atuacao conhecimento conhecimentos em todo toda todos todas sobre " +
    "entre ate apos desde anos meses ano mes dia dias semana segunda sexta sabado domingo vale refeicao " +
    "transporte alimentacao assistencia medica odontologica plr clt pj contratacao regime efetivo " +
    "temporario interessados enviar curriculo email whatsapp the and for with you our"
  ).split(" "),
);

export function analyzeJob(description: string, title: string, cv: ResumeData): JobMatch {
  const job = norm(title + " \n " + description),
    mine = resumeText(cv),
    reqs: JobRequirement[] = [];
  const consider = (entry: Entry) => {
    const mentions = countIn(job, entry.terms);
    if (!mentions) return;
    const has = countIn(mine, entry.terms) > 0;
    reqs.push({
      key: entry.label,
      label: entry.label,
      kind: entry.kind,
      mentions,
      has,
      addable: entry.kind !== "education",
      weight: WEIGHT[entry.kind] + Math.min(mentions - 1, 2) * 0.5,
    });
  };
  [...EDUCATION, ...LANGUAGES, ...DICTIONARY].forEach(consider);

  // Quem tem formação maior já cumpre as menores (superior cobre ensino médio).
  const myLevel = Math.max(0, ...EDUCATION.filter((e) => countIn(mine, e.terms) > 0).map((e) => EDU_LEVEL[e.label] || 0));
  for (const r of reqs) if (r.kind === "education" && (EDU_LEVEL[r.label] || 9) <= myLevel) r.has = true;

  // Itens mais específicos escondem os genéricos (ex.: "Excel avançado" cobre "Excel").
  const labels = new Set(reqs.map((r) => r.label));
  const filtered = reqs.filter(
    (r) =>
      !(r.label === "Excel" && labels.has("Excel avançado")) &&
      !(r.label === "Informática básica" && labels.has("Pacote Office")),
  );

  // CNH com categoria.
  const cnh = job.match(/\b(?:cnh|habilitacao)(?:\s+(?:categoria|cat))?\s+([a-e]{1,2})\b/);
  if (cnh || /\bcnh\b|\bhabilitacao\b/.test(job)) {
    const cat = cnh ? cnh[1].toUpperCase() : "";
    const label = cat ? "CNH categoria " + cat : "CNH (carteira de motorista)";
    const has = cat
      ? new RegExp("\\b(?:cnh|habilitacao)(?:\\s+(?:categoria|cat))?\\s+[a-e]*" + cat.toLowerCase()).test(mine)
      : /\bcnh\b|\bhabilitacao\b/.test(mine);
    filtered.unshift({ key: "cnh", label, kind: "license", mentions: 1, has, addable: true, weight: WEIGHT.license });
  }

  const exp = job.match(/experiencia[^.\n]{0,40}?(\d+)\s*(anos?|meses)/);
  const experience = exp ? `${exp[1]} ${exp[2] === "meses" ? "meses" : Number(exp[1]) > 1 ? "anos" : "ano"}` : null;

  const total = filtered.reduce((n, r) => n + r.weight, 0),
    got = filtered.filter((r) => r.has).reduce((n, r) => n + r.weight, 0);
  let score = total ? Math.round((got / total) * 100) : 0;

  // Cargo: se o objetivo do currículo conversa com o título da vaga, soma pontos.
  const titleWords = norm(title)
    .split(" ")
    .filter((w) => w.length > 3 && !STOP.has(w));
  const roleHits = titleWords.filter((w) => norm(cv.role).includes(w)).length;
  if (titleWords.length && total) score = Math.min(100, Math.round(score * 0.85 + (roleHits / titleWords.length) * 15));

  const order: Record<MatchKind, number> = { license: 0, education: 1, language: 2, course: 3, skill: 4, soft: 5 };
  filtered.sort((a, b) => Number(a.has) - Number(b.has) || order[a.kind] - order[b.kind] || b.mentions - a.mentions);

  const tips: JobMatch["tips"] = [];
  if (title.trim() && roleHits < titleWords.length)
    tips.push({ text: `Use o cargo da vaga, "${title.trim()}", como objetivo do currículo.`, action: "role" });
  const topMissing = filtered.filter((r) => !r.has && r.mentions >= 2).slice(0, 2);
  for (const r of topMissing)
    tips.push({ text: `A vaga cita "${r.label}" ${r.mentions} vezes. Se você tem, deixe isso claro no currículo.` });
  if (!cv.summary.trim())
    tips.push({ text: "Escreva um resumo de 3 a 4 linhas. É a primeira coisa que o recrutador lê." });
  else {
    const strong = filtered.filter((r) => r.has && r.kind === "skill").slice(0, 3);
    const missingInSummary = strong.filter((r) => !r.label || !norm(cv.summary).includes(norm(r.label)));
    if (missingInSummary.length >= 2)
      tips.push({
        text: `Cite ${missingInSummary
          .slice(0, 2)
          .map((r) => r.label)
          .join(" e ")} no seu resumo: são pontos que a vaga pede e você já tem.`,
      });
  }
  if (cv.experiences.some((x) => x.title && !x.description.trim()))
    tips.push({ text: "Descreva o que você fazia em cada experiência, usando palavras parecidas com as da vaga." });
  if (experience) tips.push({ text: `A vaga pede experiência de ${experience}. Confira se os períodos estão claros no currículo.` });

  const freq = new Map<string, number>();
  for (const w of norm(description).split(" "))
    if (w.length > 4 && !STOP.has(w) && !/^\d+$/.test(w)) freq.set(w, (freq.get(w) || 0) + 1);
  const repeated = [...freq.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([w]) => w);

  return { score, requirements: filtered, experience, tips: tips.slice(0, 5), repeated };
}

/** Adiciona um item que a pessoa confirmou ter, na seção certa do currículo. */
export function addRequirement(cv: ResumeData, r: JobRequirement): ResumeData {
  const push = (list: string[], v: string) =>
    list.some((x) => norm(x) === norm(v)) ? list : [...list, v];
  if (r.kind === "language") return { ...cv, languages: push(cv.languages, r.label) };
  if (r.kind === "course") return { ...cv, courses: push(cv.courses, r.label) };
  return { ...cv, skills: push(cv.skills, r.label) };
}
