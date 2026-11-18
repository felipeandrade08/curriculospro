// E-mails automáticos via Resend (https://resend.com). Sem RESEND_API_KEY, nada é enviado.
import { linkSecret } from "@/lib/server/secrets";
import { createHmac } from "node:crypto";
import { ACCESS_PRICE_LABEL, formatAccessUntil, formatBRL } from "@/lib/billing";
import { COMPANY, SITE_URL, SUPPORT_WHATSAPP_URL } from "@/lib/site";

const FROM = () => process.env.EMAIL_FROM || "CurriculosPRO <contato@curriculospro.site>";

export const emailConfigured = () => !!process.env.RESEND_API_KEY;

export async function sendEmail(message: {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
  unsubscribeUrl?: string;
  attachments?: { filename: string; content: Uint8Array }[];
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false as const, reason: "not_configured" };
  const to = message.to.split("#")[0];
  const headers: Record<string, string> = {
    Authorization: "Bearer " + key,
    "Content-Type": "application/json",
  };
  if (message.idempotencyKey) headers["Idempotency-Key"] = message.idempotencyKey;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers,
    body: JSON.stringify({
      from: FROM(),
      to: [to],
      reply_to: process.env.EMAIL_REPLY_TO || undefined,
      subject: message.subject,
      html: message.html,
      text: message.text,
      attachments: message.attachments?.length
        ? message.attachments.map((a) => ({ filename: a.filename, content: Buffer.from(a.content).toString("base64") }))
        : undefined,
      headers: message.unsubscribeUrl
        ? {
            "List-Unsubscribe": "<" + message.unsubscribeUrl + ">",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          }
        : undefined,
    }),
    signal: AbortSignal.timeout(message.attachments?.length ? 20_000 : 10_000),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error("Resend " + response.status + ": " + detail.slice(0, 300));
  }
  return { sent: true as const };
}

/* ── Descadastro de lembretes (link assinado, sem login) ── */

const secret = linkSecret;

export function unsubscribeToken(userId: string) {
  return createHmac("sha256", secret())
    .update("unsub:" + userId)
    .digest("base64url")
    .slice(0, 32);
}

export function unsubscribeUrl(userId: string) {
  return SITE_URL + "/api/email/cancelar?u=" + encodeURIComponent(userId) + "&t=" + unsubscribeToken(userId);
}

/* ── Modelos ── */

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(opts: {
  preheader: string;
  title: string;
  body: string;
  cta?: { label: string; url: string };
  footer?: string;
}) {
  const button = opts.cta
    ? `<tr><td style="padding:8px 0 4px"><a href="${opts.cta.url}" style="display:inline-block;background:#1553d6;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:10px;font-size:15px">${esc(opts.cta.label)}</a></td></tr>`
    : "";
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f1f4f9;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0e1b2e">
<span style="display:none;max-height:0;overflow:hidden">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f4f9;padding:28px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;padding:28px">
<tr><td style="padding-bottom:18px"><img src="${SITE_URL}/brand/icon.png" width="40" height="40" alt="CurriculosPRO" style="border-radius:8px;vertical-align:middle"> <b style="font-size:16px;vertical-align:middle;margin-left:6px">CurriculosPRO</b></td></tr>
<tr><td><h1 style="font-size:22px;line-height:1.25;margin:0 0 12px">${esc(opts.title)}</h1></td></tr>
<tr><td style="font-size:15px;line-height:1.6;color:#33415a">${opts.body}</td></tr>
${button}
<tr><td style="padding-top:22px;border-top:1px solid #e6ebf2;margin-top:18px;font-size:12px;line-height:1.6;color:#6b778c">
Dúvidas? Responda este e-mail ou chame no <a href="${SUPPORT_WHATSAPP_URL}" style="color:#1553d6">WhatsApp</a>.<br>
${esc(COMPANY.legalName)} · CNPJ ${esc(COMPANY.cnpj)}${opts.footer ? "<br>" + opts.footer : ""}
</td></tr></table></td></tr></table></body></html>`;
}

const firstName = (name: string | null | undefined) => (name || "").trim().split(/\s+/)[0] || "";

export function purchaseEmail(p: {
  name: string | null;
  amountCents: number;
  accessUntil: string;
  paymentId: string;
  bonusDays: number;
  plan?: string;
}) {
  const hi = firstName(p.name) ? "Olá, " + esc(firstName(p.name)) + "!" : "Olá!";
  const until = formatAccessUntil(p.accessUntil);
  const kit = p.plan === "mes" || p.plan === "upgrade";
  const bonus = p.bonusDays
    ? `<p>Como você chegou por indicação, ganhou <b>+${p.bonusDays} dias de bônus</b>, já incluídos.</p>`
    : "";
  const tools: [string, string][] = [
    ["Adaptar o currículo para a vaga", "/adaptar-vaga"],
    ["LinkedIn pronto", "/linkedin"],
    ["Respostas para a candidatura", "/respostas-candidatura"],
    ["Gupy, Indeed e Infojobs", "/plataformas"],
    ["Treino de entrevista com correção", "/entrevista"],
  ];
  const kitHtml = kit
    ? `<p>Seu <b>Kit Emprego</b> está liberado. Comece por aqui:</p><ul style="padding-left:18px;margin:0 0 12px">${tools
        .map(([t, u]) => `<li><a href="${SITE_URL}${u}" style="color:#1553d6">${t}</a></li>`)
        .join("")}</ul>`
    : `<p style="background:#f4f7fb;border-radius:10px;padding:12px 14px;font-size:14px">Quer ajuda até a vaga? Complete para o <b>Kit Emprego</b> pagando só a diferença e libere LinkedIn pronto, respostas para a candidatura e dados prontos para Gupy, Indeed e Infojobs: <a href="${SITE_URL}/curriculos" style="color:#1553d6">ver o Kit</a>.</p>`;
  return {
    subject: kit
      ? "Kit Emprego liberado até " + until.split(",")[0]
      : "Pagamento confirmado — downloads liberados até " + until.split(",")[0],
    text: `${firstName(p.name) ? "Olá, " + firstName(p.name) + "!" : "Olá!"}\n\nRecebemos seu pagamento de ${formatBRL(p.amountCents)}. ${kit ? "Seu Kit Emprego e os downloads" : "Seus downloads em PDF e Word"} estão liberados até ${until}.\n\nAbra seus currículos: ${SITE_URL}/curriculos\n${kit ? tools.map(([t, u]) => `\n${t}: ${SITE_URL}${u}`).join("") + "\n" : ""}\nPedido: ${p.paymentId}`,
    html: layout({
      preheader: (kit ? "Kit Emprego liberado até " : "Downloads liberados até ") + until,
      title: kit ? "Kit Emprego liberado" : "Pagamento confirmado",
      body: `<p>${hi}</p><p>Recebemos seu pagamento de <b>${formatBRL(p.amountCents)}</b>. Você pode baixar seus currículos e cartas de apresentação em PDF e Word, sem marca d'água, quantas vezes quiser até <b>${until}</b>.</p>${bonus}
${kitHtml}
<p style="font-size:13px;color:#6b778c">Pedido Mercado Pago: ${esc(p.paymentId)}</p>`,
      cta: { label: "Abrir meus currículos", url: SITE_URL + "/curriculos" },
    }),
  };
}

export function referralRewardEmail(p: { name: string | null; days: number; accessUntil: string | null }) {
  const until = p.accessUntil ? formatAccessUntil(p.accessUntil) : "";
  return {
    subject: `Você ganhou +${p.days} dias no CurriculosPRO`,
    text: `Uma pessoa que você indicou acabou de comprar. Você ganhou +${p.days} dias de downloads${until ? ", válidos até " + until : ""}.\n\nContinue indicando: ${SITE_URL}/curriculos`,
    html: layout({
      preheader: "Sua indicação deu certo",
      title: `Você ganhou +${p.days} dias de acesso`,
      body: `<p>${firstName(p.name) ? esc(firstName(p.name)) + ", uma" : "Uma"} pessoa que você indicou acabou de comprar o acesso. Como agradecimento, somamos <b>${p.days} dias</b> de downloads à sua conta${until ? ` — agora válidos até <b>${until}</b>` : ""}.</p><p>Cada amigo que comprar pelo seu link rende mais ${p.days} dias.</p>`,
      cta: { label: "Pegar meu link de indicação", url: SITE_URL + "/curriculos#indique" },
    }),
  };
}

export function expiryReminderEmail(p: { name: string | null; accessUntil: string; userId: string }) {
  const until = formatAccessUntil(p.accessUntil);
  const unsub = unsubscribeUrl(p.userId);
  return {
    unsubscribeUrl: unsub,
    subject: "Seu acesso termina amanhã — baixe o que precisar",
    text: `Seu acesso aos downloads termina em ${until}. Aproveite para revisar e baixar seus currículos e cartas.\n\n${SITE_URL}/curriculos\n\nDepois disso, para baixar de novo basta um Pix de ${ACCESS_PRICE_LABEL}.\n\nNão quer mais lembretes? ${unsub}`,
    html: layout({
      preheader: "Termina em " + until,
      title: "Seu acesso termina amanhã",
      body: `<p>${firstName(p.name) ? "Oi, " + esc(firstName(p.name)) + "! " : ""}Seus downloads ilimitados terminam em <b>${until}</b>.</p>
<p>Antes disso, vale:</p><ul style="padding-left:18px;margin:0 0 12px"><li>baixar uma versão do currículo para cada vaga que você quer;</li><li>gerar a carta de apresentação para os processos em andamento;</li><li>salvar tudo no celular para enviar pelo WhatsApp.</li></ul>
<p style="font-size:14px;color:#6b778c">Depois, se precisar baixar de novo, é só um Pix de ${ACCESS_PRICE_LABEL} para mais 7 dias.</p>`,
      cta: { label: "Baixar meus currículos", url: SITE_URL + "/curriculos" },
      footer: `<a href="${unsub}" style="color:#6b778c">Não quero receber lembretes</a>`,
    }),
  };
}

/** Alguns dias depois da compra: pede uma avaliação (que pode virar depoimento no site). */
export function reviewRequestEmail(p: { name: string | null; userId: string }) {
  const unsub = unsubscribeUrl(p.userId);
  const url = SITE_URL + "/feedback?origem=email";
  const hi = firstName(p.name) ? "Oi, " + firstName(p.name) + "!" : "Oi!";
  return {
    unsubscribeUrl: unsub,
    subject: "Como foi com o seu currículo? (leva 1 minuto)",
    text: `${hi} Faz alguns dias que você liberou os downloads no CurriculosPRO. Conta pra gente como foi: o currículo ficou do jeito que você queria? Já chamaram para entrevista?\n\nSua avaliação leva 1 minuto e ajuda outras pessoas a decidirem: ${url}\n\nDica: antes de enviar para uma vaga, use ${SITE_URL}/adaptar-vaga para ver o que ela pede e ${SITE_URL}/linkedin para deixar seu LinkedIn igual ao currículo.\n\nNão quer mais e-mails? ${unsub}`,
    html: layout({
      preheader: "Sua opinião ajuda outras pessoas a conseguirem emprego.",
      title: "Como foi com o seu currículo?",
      body: `<p>${esc(hi)} Faz alguns dias que você liberou os downloads no CurriculosPRO. O currículo ficou do jeito que você queria? Já chamaram para entrevista?</p>
<p>Sua avaliação leva <b>1 minuto</b> e ajuda outras pessoas que estão procurando emprego a confiarem no site.</p>
<p style="font-size:14px;color:#6b778c">Enquanto isso, duas ferramentas grátis: <a href="${SITE_URL}/adaptar-vaga" style="color:#1553d6">compare seu currículo com a vaga</a> antes de enviar e <a href="${SITE_URL}/linkedin" style="color:#1553d6">monte seu perfil do LinkedIn</a> a partir do currículo.</p>`,
      cta: { label: "Avaliar em 1 minuto", url },
      footer: `<a href="${unsub}" style="color:#6b778c">Não quero receber e-mails</a>`,
    }),
  };
}

export function pixRecoveryEmail(p: { name: string | null; userId: string }) {
  const unsub = unsubscribeUrl(p.userId);
  const url = SITE_URL + "/editor?checkout=1";
  return {
    unsubscribeUrl: unsub,
    subject: "Seu currículo está pronto — falta só liberar o download",
    text: `${firstName(p.name) ? "Oi, " + firstName(p.name) + "! " : ""}Vimos que você gerou um Pix para baixar seu currículo, mas o pagamento não foi concluído e o código expirou.\n\nSeu currículo continua salvo. Para gerar um Pix novo de ${ACCESS_PRICE_LABEL}: ${url}\n\nTeve algum problema? Responda este e-mail ou chame no WhatsApp: ${SUPPORT_WHATSAPP_URL}\n\nNão quer mais lembretes? ${unsub}`,
    html: layout({
      preheader: "Seu currículo continua salvo. Gere um Pix novo em 1 clique.",
      title: "Falta só liberar o download",
      body: `<p>${firstName(p.name) ? "Oi, " + esc(firstName(p.name)) + "! " : ""}Vimos que você gerou um Pix para baixar seu currículo, mas o pagamento não foi concluído e o código expirou.</p>
<p>Fique tranquilo: <b>seu currículo continua salvo</b>. É só gerar um Pix novo de ${ACCESS_PRICE_LABEL} e baixar na hora — são 7 dias para baixar quantas vezes quiser, com carta de apresentação e versão em Word.</p>
<p style="font-size:14px;color:#6b778c">Teve algum problema para pagar? Responda este e-mail ou chame no WhatsApp que a gente resolve com você.</p>`,
      cta: { label: "Gerar novo Pix e baixar", url },
      footer: `<a href="${unsub}" style="color:#6b778c">Não quero receber lembretes</a>`,
    }),
  };
}

/** Para quem criou conta e ainda não comprou. Mostra o cupom se houver um ativo. */
export function signupNudgeEmail(p: {
  name: string | null;
  userId: string;
  coupon: { code: string; finalLabel: string } | null;
}) {
  const unsub = unsubscribeUrl(p.userId);
  const url = SITE_URL + "/curriculos";
  const hi = firstName(p.name) ? "Oi, " + firstName(p.name) + "! " : "Oi! ";
  const couponText = p.coupon
    ? `Use o cupom ${p.coupon.code} na hora de pagar e libere 7 dias de downloads por ${p.coupon.finalLabel}.`
    : `Com um Pix de ${ACCESS_PRICE_LABEL} você libera 7 dias de downloads, em PDF e Word.`;
  return {
    unsubscribeUrl: unsub,
    subject: p.coupon ? `Seu currículo por ${p.coupon.finalLabel} com o cupom ${p.coupon.code}` : "Seu currículo está te esperando",
    text: `${hi}Você criou sua conta no CurriculosPRO, mas ainda não baixou seu currículo.\n\n${couponText}\n\nContinue de onde parou: ${url}\n\nSem tempo? Nossa equipe monta o currículo para você em até 24h: ${SITE_URL}/feito-para-voce\n\nDúvidas? Chame no WhatsApp: ${SUPPORT_WHATSAPP_URL}\n\nNão quer mais lembretes? ${unsub}`,
    html: layout({
      preheader: p.coupon ? `Cupom ${p.coupon.code}: seu currículo por ${p.coupon.finalLabel}.` : "Seu currículo continua salvo.",
      title: "Falta pouco para seu currículo ficar pronto",
      body: `<p>${esc(hi)}Você criou sua conta no CurriculosPRO, mas ainda não baixou seu currículo. Ele continua salvo, do jeito que você deixou.</p>
${
  p.coupon
    ? `<p style="background:#fff6d6;border-radius:10px;padding:14px 16px;font-size:16px">Use o cupom <b style="letter-spacing:.04em">${esc(p.coupon.code)}</b> na hora de pagar e libere 7 dias de downloads por <b>${esc(p.coupon.finalLabel)}</b>.</p>`
    : `<p>Com um Pix de ${ACCESS_PRICE_LABEL} você libera 7 dias de downloads, em PDF e Word, com carta de apresentação.</p>`
}
<p style="font-size:14px;color:#6b778c">Sem tempo para montar? <a href="${SITE_URL}/feito-para-voce" style="color:#1553d6">Nossa equipe faz o currículo para você em até 24h</a>, já incluído no acesso.</p>`,
      cta: { label: "Continuar meu currículo", url },
      footer: `<a href="${unsub}" style="color:#6b778c">Não quero receber lembretes</a>`,
    }),
  };
}

export function serviceReceivedEmail(p: { name: string; role: string }) {
  return {
    subject: "Recebemos seu pedido — seu currículo fica pronto em até 24 horas",
    text: `Olá, ${firstName(p.name) || "tudo bem"}! Recebemos seu pedido de currículo para ${p.role}. Nossa equipe vai montar e entregar em até 24 horas. Se precisarmos de algum detalhe, chamamos no seu WhatsApp.\n\nAcompanhe: ${SITE_URL}/feito-para-voce`,
    html: layout({
      preheader: "Nossa equipe já está cuidando do seu currículo.",
      title: "Pedido recebido",
      body: `<p>Olá, ${esc(firstName(p.name) || "tudo bem")}! Recebemos seu pedido de currículo para <b>${esc(p.role)}</b>.</p>
<p>Nossa equipe vai montar e entregar <b>em até 24 horas</b>. Se precisarmos de algum detalhe, chamamos no seu WhatsApp.</p>
<p>Quando ficar pronto, você recebe um e-mail e o currículo aparece na sua conta para editar e baixar em PDF ou Word.</p>`,
      cta: { label: "Acompanhar meu pedido", url: SITE_URL + "/feito-para-voce" },
    }),
  };
}

export function serviceAdminEmail(p: { name: string; role: string; whatsapp: string; email: string }) {
  return {
    subject: `Novo pedido "Fazemos para você": ${p.name} — ${p.role}`,
    text: `Novo pedido de ${p.name} (${p.email}), WhatsApp ${p.whatsapp}, para ${p.role}.\n\nAbrir: ${SITE_URL}/admin?aba=pedidos`,
    html: layout({
      preheader: "Prazo prometido: 24 horas",
      title: "Novo pedido de currículo",
      body: `<p><b>${esc(p.name)}</b> (${esc(p.email)}) pediu um currículo para <b>${esc(p.role)}</b>.</p><p>WhatsApp: ${esc(p.whatsapp)}</p><p>Prazo prometido ao cliente: 24 horas.</p>`,
      cta: { label: "Abrir pedidos no painel", url: SITE_URL + "/admin?aba=pedidos" },
    }),
  };
}

export function serviceDeliveredEmail(p: {
  name: string | null;
  note: string | null;
  link: string;
  attached: string[];
  /** Cliente sem conta (venda pelo painel): não citar Meus currículos. */
  inAccount?: boolean;
}) {
  const hi = firstName(p.name) ? "Olá, " + firstName(p.name) + "! " : "";
  const inAccount = p.inAccount !== false;
  const files = p.attached.length ? p.attached.join(" e ") : "";
  return {
    subject: "Seu currículo está pronto ✅",
    text: `${hi}Seu currículo feito pela nossa equipe está pronto.${files ? " Ele vai anexado neste e-mail (" + files + ")." : ""}${p.note ? "\n\nRecado da equipe: " + p.note : ""}\n\nBaixe também por este link, sem precisar entrar na conta (vale ${30} dias): ${p.link}${inAccount ? `\n\nEle também está salvo em Meus currículos, se quiser editar: ${SITE_URL}/curriculos` : "\n\nQuer mudar alguma coisa? É só responder este e-mail ou falar com a gente no WhatsApp."}`,
    html: layout({
      preheader: files ? "Seu currículo vai anexado em " + files + "." : "Baixe em PDF ou Word.",
      title: "Seu currículo está pronto",
      body: `<p>${esc(hi)}O currículo que nossa equipe montou para você está pronto.${
        files ? ` Ele vai <b>anexado neste e-mail</b> (${esc(files)}).` : ""
      }</p>${
        p.note
          ? `<p style="background:#f4f7fb;border-radius:10px;padding:12px 14px"><b>Recado da equipe:</b> ${esc(p.note)}</p>`
          : ""
      }<p>Você também pode baixar pelo botão abaixo, sem precisar entrar na conta. O link vale 30 dias.</p>
${
        inAccount
          ? `<p style="font-size:14px;color:#6b778c">Quer mudar alguma coisa? Ele está salvo em <a href="${SITE_URL}/curriculos" style="color:#1553d6">Meus currículos</a> para você editar e baixar de novo.</p>`
          : `<p style="font-size:14px;color:#6b778c">Quer mudar alguma coisa? É só responder este e-mail ou falar com a gente no WhatsApp.</p>`
      }`,
      cta: { label: "Baixar meu currículo", url: p.link },
    }),
  };
}
