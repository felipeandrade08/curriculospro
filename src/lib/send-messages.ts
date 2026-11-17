// Mensagens prontas para enviar o currículo e para acompanhar a candidatura.
export type SendInput = {
  name: string;
  role: string;
  company: string;
  recruiter: string;
  pitch: string;
};

const hello = () => {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
};

export function whatsappMessage(i: SendInput) {
  const to = i.recruiter ? `${hello()}, ${i.recruiter}! ` : `${hello()}! `;
  return (
    to +
    `Meu nome é ${i.name || "[seu nome]"} e vi a vaga de ${i.role || "[cargo]"}${i.company ? " na " + i.company : ""}. ` +
    (i.pitch ? i.pitch + " " : "") +
    "Segue meu currículo em PDF. Fico à disposição para uma entrevista. Obrigado(a)!"
  );
}

export function emailSubject(i: SendInput) {
  return `Currículo — ${i.role || "[cargo]"} — ${i.name || "[seu nome]"}`;
}

export function emailBody(i: SendInput) {
  return [
    i.recruiter ? `Olá, ${i.recruiter},` : "Olá,",
    "",
    `Vi a vaga de ${i.role || "[cargo]"}${i.company ? " na " + i.company : ""} e gostaria de me candidatar.` +
      (i.pitch ? " " + i.pitch : ""),
    "",
    "Envio meu currículo em anexo e fico à disposição para conversarmos.",
    "",
    "Atenciosamente,",
    i.name || "[seu nome]",
  ].join("\n");
}

export function linkedinMessage(i: SendInput) {
  return (
    `Olá${i.recruiter ? ", " + i.recruiter : ""}! Vi a vaga de ${i.role || "[cargo]"}${i.company ? " na " + i.company : ""} e me candidatei. ` +
    (i.pitch ? i.pitch + " " : "") +
    "Se fizer sentido, adoraria conversar. Obrigado(a)!"
  );
}

export function followUpMessage(i: SendInput) {
  return (
    `${hello()}${i.recruiter ? ", " + i.recruiter : ""}! Aqui é ${i.name || "[seu nome]"}, enviei meu currículo para a vaga de ${i.role || "[cargo]"}` +
    `${i.company ? " na " + i.company : ""} há alguns dias. Gostaria de saber se o processo ainda está em andamento. Continuo muito interessado(a). Obrigado(a)!`
  );
}

export function thanksMessage(i: SendInput) {
  return (
    `${hello()}${i.recruiter ? ", " + i.recruiter : ""}! Obrigado(a) pela entrevista para a vaga de ${i.role || "[cargo]"}. ` +
    "Gostei muito de conhecer mais sobre a empresa e a função, e sigo à disposição para os próximos passos."
  );
}
