// Catálogo dos modelos visuais de currículo.
// O layout de cada modelo fica em src/app/resume.css (classes .cv-<id>).

export const TEMPLATE_IDS = [
  "essential",
  "modern",
  "executive",
  "minimal",
  "creative",
  "professional",
  "elegant",
  "compact",
  "tech",
  "corporate",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

/** single: uma coluna · side-left/side-right: coluna lateral com contato e competências. */
export type TemplateLayout = "single" | "side-left" | "side-right";

export type TemplateMeta = {
  id: TemplateId;
  name: string;
  tag: string;
  description: string;
  layout: TemplateLayout;
  accent: string;
  /** Indicado para… (usado na galeria). */
  bestFor: string;
  /** O modelo exibe a foto quando ela existe. */
  photo: boolean;
  isNew?: boolean;
};

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "essential",
    name: "Essencial",
    tag: "Clássico e objetivo",
    description: "Uma coluna, hierarquia clara e leitura rápida. Funciona para qualquer área.",
    layout: "single",
    accent: "#0b6bcb",
    bestFor: "Qualquer vaga",
    photo: true,
  },
  {
    id: "modern",
    name: "Moderno",
    tag: "Cabeçalho em destaque",
    description: "Faixa de cor no topo com nome em evidência e conteúdo bem organizado.",
    layout: "single",
    accent: "#1d4ed8",
    bestFor: "Comercial e atendimento",
    photo: true,
  },
  {
    id: "executive",
    name: "Executivo",
    tag: "Sóbrio e tradicional",
    description: "Tipografia serifada, centralizada e formal, para cargos de gestão.",
    layout: "single",
    accent: "#1f2937",
    bestFor: "Gestão e jurídico",
    photo: false,
  },
  {
    id: "minimal",
    name: "Minimalista",
    tag: "Respiro e precisão",
    description: "Títulos em coluna à esquerda e conteúdo alinhado. Elegante sem enfeites.",
    layout: "single",
    accent: "#0f766e",
    bestFor: "Administrativo e finanças",
    photo: false,
  },
  {
    id: "creative",
    name: "Criativo",
    tag: "Coluna colorida",
    description: "Barra lateral colorida com foto, contato e competências. Personalidade com equilíbrio.",
    layout: "side-left",
    accent: "#7c3aed",
    bestFor: "Marketing e design",
    photo: true,
  },
  {
    id: "professional",
    name: "Profissional",
    tag: "Duas colunas",
    description: "Experiência em destaque e coluna lateral clara para competências e idiomas.",
    layout: "side-right",
    accent: "#0b6bcb",
    bestFor: "Experientes",
    photo: true,
    isNew: true,
  },
  {
    id: "elegant",
    name: "Elegante",
    tag: "Refinado",
    description: "Nome serifado, monograma e detalhes finos. Sofisticado e fácil de ler.",
    layout: "single",
    accent: "#9a3412",
    bestFor: "Saúde e educação",
    photo: false,
    isNew: true,
  },
  {
    id: "compact",
    name: "Compacto",
    tag: "Cabe mais em 1 página",
    description: "Espaçamento otimizado para trajetórias longas sem passar de uma folha.",
    layout: "single",
    accent: "#334155",
    bestFor: "Muitas experiências",
    photo: false,
    isNew: true,
  },
  {
    id: "tech",
    name: "Tecnologia",
    tag: "Direto ao ponto",
    description: "Visual técnico com detalhes monoespaçados e competências em destaque.",
    layout: "side-right",
    accent: "#059669",
    bestFor: "TI e engenharia",
    photo: false,
    isNew: true,
  },
  {
    id: "corporate",
    name: "Corporativo",
    tag: "Lateral escura",
    description: "Coluna lateral escura com foto e contato. Presença forte e organizada.",
    layout: "side-left",
    accent: "#0f2a4a",
    bestFor: "Corporativo e logística",
    photo: true,
    isNew: true,
  },
];

export const templateMeta = (id: string) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];

export function isTemplateId(value: unknown): value is TemplateId {
  return typeof value === "string" && (TEMPLATE_IDS as readonly string[]).includes(value);
}

export const ACCENT_COLORS = [
  "#0b6bcb",
  "#1d4ed8",
  "#0f766e",
  "#059669",
  "#7c3aed",
  "#be123c",
  "#9a3412",
  "#b45309",
  "#334155",
  "#0f2a4a",
];
