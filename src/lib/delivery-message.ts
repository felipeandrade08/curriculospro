// Mensagem de WhatsApp para entregar o currículo com o link de download.
export function whatsappDeliveryUrl(whatsapp: string, name: string, link: string) {
  const number = whatsapp.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  const first = name.trim().split(/\s+/)[0] || "";
  const text =
    "Olá" +
    (first ? ", " + first : "") +
    "! Seu currículo feito pela equipe CurriculosPRO está pronto ✅\n\nBaixe em PDF ou Word por este link (vale 30 dias):\n" +
    link +
    "\n\nEle também fica salvo em Meus currículos, se quiser editar. Qualquer ajuste, é só responder aqui!";
  return "https://wa.me/55" + number + "?text=" + encodeURIComponent(text);
}
