// Regras comerciais compartilhadas entre servidor e navegador.
// Altere aqui para mudar preço ou duração do acesso em todo o site.

export const ACCESS_PRICE_CENTS = 990;
export const ACCESS_DAYS = 7;
export const ACCESS_PRODUCT_NAME = "CurriculosPRO — Acesso de 7 dias";

/** Indicação: dias extras para quem indicou e para o amigo na primeira compra. */
export const REFERRER_BONUS_DAYS = 3;
export const REFERRED_BONUS_DAYS = 2;

/** Tempo para pagar o Pix antes de o QR Code expirar. */
export const PIX_EXPIRATION_MINUTES = 30;

export const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const ACCESS_PRICE_LABEL = formatBRL(ACCESS_PRICE_CENTS);

/**
 * Pacotes: "semana" = Currículo (7 dias), "mes" = Kit Emprego (30 dias, libera as ferramentas de busca de emprego).
 * "upgrade" completa o Currículo para o Kit Emprego pagando só a diferença.
 */
export type AccessPlanId = "semana" | "mes" | "upgrade";
export type AccessPlan = {
  id: AccessPlanId;
  days: number;
  cents: number;
  /** Período, ex.: "7 dias". */
  name: string;
  /** Nome do pacote, ex.: "Kit Emprego". */
  title: string;
  product: string;
};
export const ACCESS_PLANS: Record<AccessPlanId, AccessPlan> = {
  semana: { id: "semana", days: ACCESS_DAYS, cents: ACCESS_PRICE_CENTS, name: "7 dias", title: "Currículo", product: ACCESS_PRODUCT_NAME },
  mes: { id: "mes", days: 30, cents: 1990, name: "30 dias", title: "Kit Emprego", product: "CurriculosPRO — Kit Emprego (30 dias)" },
  upgrade: {
    id: "upgrade",
    days: 23,
    cents: 1000,
    name: "+23 dias",
    title: "Upgrade para o Kit Emprego",
    product: "CurriculosPRO — Upgrade para o Kit Emprego",
  },
};
export const KIT_NAME = "Kit Emprego";
export const KIT_PRICE_LABEL = formatBRL(ACCESS_PLANS.mes.cents);
export const UPGRADE_PRICE_LABEL = formatBRL(ACCESS_PLANS.upgrade.cents);
/** O que cada pacote libera (para o checkout e a página de preços). */
export const PLAN_FEATURES = {
  semana: ["Currículo em PDF e Word, sem marca d'água", "Carta de apresentação", "Nossa equipe faz para você, se preferir"],
  mes: [
    "Tudo do pacote Currículo, por 30 dias",
    "Adaptar o currículo para cada vaga, com dicas",
    "LinkedIn pronto: título, Sobre e experiências",
    "Respostas prontas para as perguntas da candidatura",
    "Gupy, Indeed e Infojobs: dados prontos para colar",
    "Entrevista: dicas e correção das suas respostas",
  ],
};
export const hasKit = (kitUntil?: string | null) => !!kitUntil && new Date(kitUntil).getTime() > Date.now();
export const MONTH_PRICE_LABEL = formatBRL(ACCESS_PLANS.mes.cents);
export const isAccessPlan = (x: unknown): x is AccessPlanId => x === "semana" || x === "mes" || x === "upgrade";

/** Valor mínimo cobrado depois de qualquer desconto. */
export const MIN_CHARGE_CENTS = 100;
export const discounted = (cents: number, c: { percentOff?: number | null; amountOffCents?: number | null }) =>
  Math.max(
    MIN_CHARGE_CENTS,
    c.percentOff ? Math.round((cents * (100 - c.percentOff)) / 100) : cents - (c.amountOffCents || 0),
  );

export type CouponQuote = {
  code: string;
  plan: AccessPlanId;
  originalCents: number;
  finalCents: number;
  /** Ex.: "R$ 2,00 de desconto" ou "20% de desconto". */
  label: string;
};

export type AccessState = {
  signedIn: boolean;
  email?: string;
  accessUntil: string | null;
  active: boolean;
};

export const hasActiveAccess = (accessUntil: string | null | undefined, now = Date.now()) =>
  !!accessUntil && new Date(accessUntil).getTime() > now;

export const formatAccessUntil = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export type CheckoutPix = {
  paymentId: string;
  status: "pending" | "approved" | "expired" | "rejected" | "cancelled";
  qrCode: string | null;
  qrCodeBase64: string | null;
  ticketUrl: string | null;
  expiresAt: string | null;
  amountCents: number;
  accessUntil?: string | null;
  plan?: AccessPlanId;
  couponCode?: string | null;
  kitUntil?: string | null;
};
