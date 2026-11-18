// Mensagem de WhatsApp para entregar o currículo com o link de download.
export function whatsappDeliveryUrl(whatsapp: string, name: string, link: string, inAccount = true) {
  const number = whatsapp.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  const first = name.trim().split(/\s+/)[0] || "";
  const text = [
    `Olá${first ? ", " + first : ""}! Seu currículo está pronto ✅`,
    "",
    "Toque no link para ver e baixar em PDF ou Word:",
    link,
    "",
    "Na mesma página tem o botão *Enviar o PDF pelo WhatsApp*, para mandar direto para as empresas 📲",
    "",
    inAccount
      ? "Ele também fica salvo em Meus currículos. Você tem 7 dias de suporte: qualquer ajuste, é só responder aqui!"
      : "Você tem 7 dias de suporte: qualquer ajuste, é só responder aqui!",
    "",
    "Boa sorte nas entrevistas! 🍀",
  ].join("\n");
  return "https://wa.me/55" + number + "?text=" + encodeURIComponent(text);
}
