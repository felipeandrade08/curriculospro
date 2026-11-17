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
};
