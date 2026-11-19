import { createHmac, timingSafeEqual } from "node:crypto";

const API = "https://api.mercadopago.com";

export type MercadoPagoPayment = {
  id: number;
  status:
    | "pending"
    | "approved"
    | "authorized"
    | "in_process"
    | "in_mediation"
    | "rejected"
    | "cancelled"
    | "refunded"
    | "charged_back";
  status_detail?: string;
  transaction_amount: number;
  currency_id?: string;
  payment_method_id?: string;
  external_reference?: string | null;
  date_approved?: string | null;
  date_of_expiration?: string | null;
  payment_type_id?: string;
  metadata?: { intent_id?: string } | null;
  point_of_interaction?: {
    transaction_data?: { qr_code?: string; qr_code_base64?: string; ticket_url?: string };
  };
};

export class MercadoPagoError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string,
  ) {
    super(message);
  }
}

export function mercadoPagoConfigured() {
  return !!process.env.MERCADOPAGO_ACCESS_TOKEN;
}

function token() {
  const value = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!value) throw new MercadoPagoError("MERCADOPAGO_ACCESS_TOKEN não configurado", 503);
  return value;
}

/** Data no formato aceito pelo Mercado Pago, no fuso de Brasília (sem horário de verão desde 2019). */
export function mercadoPagoDate(date: Date) {
  const local = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  return local.toISOString().replace("Z", "-03:00");
}

export async function createPixPayment(input: {
  amountCents: number;
  description: string;
  payerEmail: string;
  externalReference: string;
  expiresAt: Date;
  notificationUrl?: string;
  idempotencyKey: string;
}): Promise<MercadoPagoPayment> {
  const response = await fetch(API + "/v1/payments", {
    method: "POST",
    headers: {
      authorization: "Bearer " + token(),
      "content-type": "application/json",
      "x-idempotency-key": input.idempotencyKey,
    },
    body: JSON.stringify({
      transaction_amount: input.amountCents / 100,
      description: input.description,
      payment_method_id: "pix",
      payer: { email: input.payerEmail },
      external_reference: input.externalReference,
      date_of_expiration: mercadoPagoDate(input.expiresAt),
      ...(input.notificationUrl ? { notification_url: input.notificationUrl } : {}),
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 800);
    throw new MercadoPagoError("Falha ao criar pagamento Pix", response.status, detail);
  }
  return (await response.json()) as MercadoPagoPayment;
}

/** Checkout Pro: página do Mercado Pago para pagar com cartão de crédito ou débito. */
export async function createCardPreference(input: {
  intentId: string;
  amountCents: number;
  title: string;
  planId: string;
  payerEmail: string;
  externalReference: string;
  returnUrl: string;
  notificationUrl?: string;
}): Promise<{ id: string; init_point: string }> {
  const back = input.returnUrl;
  const response = await fetch(API + "/checkout/preferences", {
    method: "POST",
    headers: {
      authorization: "Bearer " + token(),
      "content-type": "application/json",
      "x-idempotency-key": input.intentId,
    },
    body: JSON.stringify({
      items: [
        { id: input.planId, title: input.title, quantity: 1, unit_price: input.amountCents / 100, currency_id: "BRL" },
      ],
      payer: { email: input.payerEmail },
      external_reference: input.externalReference,
      metadata: { intent_id: input.intentId },
      back_urls: { success: back, pending: back, failure: back },
      ...(back.startsWith("https://") ? { auto_return: "approved" } : {}),
      payment_methods: {
        excluded_payment_types: [{ id: "ticket" }, { id: "atm" }],
        installments: 1,
      },
      statement_descriptor: "CURRICULOSPRO",
      ...(input.notificationUrl ? { notification_url: input.notificationUrl } : {}),
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 800);
    throw new MercadoPagoError("Falha ao criar checkout de cartão", response.status, detail);
  }
  return (await response.json()) as { id: string; init_point: string };
}

export async function getPayment(id: string): Promise<MercadoPagoPayment> {
  if (!/^\d{1,20}$/.test(id)) throw new MercadoPagoError("ID de pagamento inválido", 400);
  const response = await fetch(API + "/v1/payments/" + id, {
    headers: { authorization: "Bearer " + token() },
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 800);
    throw new MercadoPagoError("Falha ao consultar pagamento", response.status, detail);
  }
  return (await response.json()) as MercadoPagoPayment;
}

/** Cancela um Pix ainda não pago (evita o cliente pagar duas vezes). */
export async function cancelPayment(id: string) {
  if (!/^\d{1,20}$/.test(id)) throw new MercadoPagoError("ID de pagamento inválido", 400);
  const response = await fetch(API + "/v1/payments/" + id, {
    method: "PUT",
    headers: { authorization: "Bearer " + token(), "content-type": "application/json" },
    body: JSON.stringify({ status: "cancelled" }),
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 800);
    throw new MercadoPagoError("Falha ao cancelar pagamento", response.status, detail);
  }
  return (await response.json()) as MercadoPagoPayment;
}

/**
 * Valida o cabeçalho x-signature das notificações do Mercado Pago.
 * Manifesto: id:[data.id];request-id:[x-request-id];ts:[ts];
 */
export function verifyWebhookSignature(params: {
  secret: string;
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string | null;
}) {
  const { secret, signatureHeader, requestId, dataId } = params;
  if (!signatureHeader) return false;
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, ...rest] = part.split("=");
      return [key.trim(), rest.join("=").trim()];
    }),
  );
  const ts = parts.ts,
    v1 = parts.v1;
  if (!ts || !v1) return false;
  let manifest = "";
  if (dataId) manifest += "id:" + (/^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId) + ";";
  if (requestId) manifest += "request-id:" + requestId + ";";
  manifest += "ts:" + ts + ";";
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const a = Buffer.from(expected, "hex"),
    b = Buffer.from(v1, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
