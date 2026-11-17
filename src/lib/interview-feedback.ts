// Correção automática das respostas escritas no treino de entrevista.
export type Feedback = { ok: boolean; text: string };

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const has = (t: string, words: string[]) => words.some((w) => t.includes(w));

export function reviewAnswer(question: string, answer: string): Feedback[] {
  const raw = answer.trim();
  if (raw.length < 20) return [];
  const t = norm(raw);
  const q = norm(question);
  const words = raw.split(/\s+/).filter(Boolean).length;
  const out: Feedback[] = [];

  if (/\[[^\]]+\]/.test(raw)) out.push({ ok: false, text: "Troque os trechos entre colchetes pelo seu caso real." });

  if (words < 25) out.push({ ok: false, text: `Curta demais (${words} palavras). Na entrevista, responda em 30 segundos a 1 minuto, umas 60 a 150 palavras.` });
  else if (words > 230) out.push({ ok: false, text: `Longa (${words} palavras). Corte o que não ajuda: o recrutador perde a atenção depois de 1 minuto e meio.` });
  else out.push({ ok: true, text: "Bom tamanho para falar em até 1 minuto." });

  const isSalary = q.includes("pretensao");
  const isQuestion = q.includes("alguma pergunta");
  const isWhyCompany = q.includes("trabalhar nesta empresa") || q.includes("trabalhar aqui");
  const isLeft = q.includes("saiu");
  const isWeak = q.includes("ponto a melhorar") || q.includes("defeito");

  if (isSalary) {
    out.push(
      /r\$|\d/.test(t)
        ? { ok: true, text: "Você deu um valor ou uma faixa. Ótimo." }
        : { ok: false, text: "Diga uma faixa em reais (ex.: de R$ 1.800 a R$ 2.100). Fugir do valor passa insegurança." },
    );
  } else if (isQuestion) {
    out.push(
      raw.includes("?")
        ? { ok: true, text: "Você tem perguntas prontas. Isso mostra interesse." }
        : { ok: false, text: "Escreva uma ou duas perguntas para fazer ao recrutador, como “Como é um dia normal na função?”." },
    );
  } else {
    out.push(
      has(t, ["quando ", "por exemplo", "certa vez", "uma vez", "no meu ultimo", "na empresa", "no trabalho", "na loja", "no estagio", "na escola", "na faculdade", "atendi", "trabalhei", "fiz "])
        ? { ok: true, text: "Tem um exemplo da sua experiência." }
        : { ok: false, text: "Inclua um exemplo real: onde foi, o que você fez. Exemplos convencem mais que qualidades soltas." },
    );
    if (!isWhyCompany && !isLeft)
      out.push(
        /\d/.test(t) || has(t, ["resultado", "aumentei", "aumentou", "reduzi", "reduziu", "melhorei", "melhorou", "consegui", "bati", "meta", "economiz", "elogi", "promovid"])
          ? { ok: true, text: "Mostra um resultado." }
          : { ok: false, text: "Termine com o resultado: o que melhorou, quanto, ou o que você aprendeu." },
      );
  }

  if (isWhyCompany && !has(t, ["empresa", "marca", "produto", "loja", "servico", "clientes", "equipe", "cultura", "crescimento", "valores"]))
    out.push({ ok: false, text: "Fale algo específico da empresa (produto, reputação, forma de trabalhar). Isso mostra que você pesquisou." });

  if (isWeak && has(t, ["perfeccionista", "nao tenho defeito", "nenhum defeito", "trabalho demais"]))
    out.push({ ok: false, text: "Evite respostas prontas como “sou perfeccionista”. Escolha algo real e diga o que faz para melhorar." });

  if (has(t, ["odeio", "odiava", "chefe ruim", "pessim", "horrivel", "injust", "me demitiram sem motivo"]))
    out.push({ ok: false, text: "Evite falar mal de empresas ou chefes anteriores. Fale do que você busca daqui para frente." });

  if (has(t, ["qualquer vaga", "qualquer coisa", "preciso de dinheiro", "preciso muito do emprego", "nao sei"]))
    out.push({ ok: false, text: "Troque frases como “qualquer vaga serve” ou “não sei” por algo que mostre interesse nesta vaga." });

  return out;
}
