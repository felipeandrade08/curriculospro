// "Como o robô lê seu currículo": confere o que uma leitura automática consegue extrair do arquivo.
import type { ImportLine, ImportResult } from "@/lib/import/parse";

export type Check = { id: string; ok: boolean | "warn"; title: string; detail: string };

export function robotChecks(lines: ImportLine[], result: ImportResult, fileSize: number): Check[] {
  const text = lines.map((l) => l.text).join("\n");
  const cv = result.cv;
  const pages = Math.max(1, ...lines.map((l) => l.page || 1));
  const odd = (text.match(/[�ﬀ-ﬆ]|[\u0080-\u009F]/g) || []).length;
  const unmatched = result.unmatched.filter((x) => x.trim().length > 3);
  const exps = cv.experiences.filter((x) => x.title || x.subtitle);
  const personal = result.personal || [];
  // Só o nome do dado (nunca o número), para não repetir CPF e afins na tela.
  const SENSITIVE: [RegExp, string][] = [
    [/\bcpf\b/i, "CPF"],
    [/\brg\b/i, "RG"],
    [/\b(ctps|pis|t[ií]tulo de eleitor|reservista)\b/i, "documentos"],
    [/estado civil|\b(solteir|casad|divorciad|separad|vi[uú]v)/i, "estado civil"],
    [/data de nascimento|nascid|\bidade\b|\b\d{2}\s+anos\b(?! de)/i, "idade ou nascimento"],
    [/\bfilhos?\b/i, "filhos"],
  ];
  const sensitive = SENSITIVE.filter(([re]) => personal.some((x) => re.test(x))).map(([, label]) => label);
  const fullAddress = personal.some((x) => /\b(rua|r\.|av\.?|avenida|travessa|alameda|endere[cç]o|cep)\b/i.test(x));
  const noPeriod = exps.filter((x) => !x.period.trim()).length;
  const informalEmail = /(gatinh|princes|lind[ao]|gostos|amorzinho|baby|bebe|sexy|delicia|safad|tchutchu|69|666|xxx|lol)/i.test(
    cv.email.split("@")[0],
  );
  const sections = result.sectionsFound.filter((x) => x !== "contact" && x !== "extras").length;
  const checks: Check[] = [
    {
      id: "texto",
      ok: true,
      title: "O texto pode ser lido",
      detail: "O arquivo tem texto de verdade (não é uma foto do currículo).",
    },
    {
      id: "nome",
      ok: !!cv.name.trim(),
      title: cv.name.trim() ? `Nome encontrado: ${cv.name.trim()}` : "Nome não encontrado",
      detail: cv.name.trim()
        ? "O nome aparece no topo, como os sistemas esperam."
        : "Coloque o nome completo sozinho na primeira linha, sem enfeites.",
    },
    {
      id: "email",
      ok: !!cv.email,
      title: cv.email ? `E-mail encontrado: ${cv.email}` : "E-mail não encontrado",
      detail: cv.email ? "É por ele que a empresa vai responder." : "Escreva o e-mail como texto, não como ícone ou imagem.",
    },
    {
      id: "telefone",
      ok: !!cv.phone,
      title: cv.phone ? `Telefone encontrado: ${cv.phone}` : "Telefone não encontrado",
      detail: cv.phone ? "Confira se tem DDD." : "Escreva o telefone com DDD, como texto, ex.: (11) 98888-7777.",
    },
    {
      id: "cidade",
      ok: cv.city ? true : "warn",
      title: cv.city ? `Cidade encontrada: ${cv.city}` : "Cidade não encontrada",
      detail: cv.city
        ? "Muitas empresas filtram candidatos pela cidade."
        : "Informe cidade e estado (ex.: Campinas, SP). Muitas buscas filtram por local.",
    },
    {
      id: "objetivo",
      ok: cv.summary.trim().length >= 60 ? true : "warn",
      title: cv.summary.trim().length >= 60 ? "Objetivo profissional encontrado" : "Falta um objetivo profissional",
      detail:
        cv.summary.trim().length >= 60
          ? "Um bom resumo no topo ajuda o recrutador e o robô a entender sua área."
          : "Escreva 2 ou 3 frases dizendo a área que você busca e seus pontos fortes, com o título “Objetivo profissional”.",
    },
    {
      id: "titulos",
      ok: sections >= 3 ? true : sections >= 1 ? "warn" : false,
      title: sections >= 3 ? "Títulos de seção reconhecidos" : "Poucos títulos de seção reconhecidos",
      detail:
        sections >= 3
          ? "Os títulos (Experiência, Formação, Habilidades…) separam bem as partes do currículo."
          : "Use títulos comuns, como “Experiência profissional”, “Formação” e “Habilidades”. Títulos criativos confundem os sistemas.",
    },
    {
      id: "experiencia",
      ok: exps.length ? true : result.sectionsFound.includes("experiences") ? "warn" : false,
      title: exps.length ? `${exps.length} experiência${exps.length > 1 ? "s" : ""} reconhecida${exps.length > 1 ? "s" : ""}` : "Experiências não reconhecidas",
      detail: exps.length
        ? "Os sistemas de triagem dão muito peso a essa seção."
        : "Use um título de seção padrão, como “Experiência profissional”, e liste cargo, empresa e período.",
    },
    ...(exps.length
      ? [
          {
            id: "datas",
            ok: noPeriod === 0 ? (true as const) : ("warn" as const),
            title: noPeriod === 0 ? "Todas as experiências têm período" : `${noPeriod} experiência${noPeriod > 1 ? "s" : ""} sem período`,
            detail:
              noPeriod === 0
                ? "Os sistemas calculam seu tempo de experiência pelas datas."
                : "Coloque mês e ano de início e fim (ex.: mar/2021 – atual). Sem datas, o sistema não conta seu tempo de experiência.",
          },
        ]
      : []),
    {
      id: "formacao",
      ok: cv.education.some((x) => x.title) ? true : "warn",
      title: cv.education.some((x) => x.title) ? "Formação reconhecida" : "Formação não reconhecida",
      detail: cv.education.some((x) => x.title)
        ? "Escolaridade é critério de corte em muitas vagas."
        : "Use o título “Formação” e escreva curso, instituição e ano.",
    },
    {
      id: "habilidades",
      ok: cv.skills.length >= 3 ? true : cv.skills.length ? "warn" : false,
      title: cv.skills.length ? `${cv.skills.length} habilidade${cv.skills.length > 1 ? "s" : ""} encontrada${cv.skills.length > 1 ? "s" : ""}` : "Habilidades não encontradas",
      detail: cv.skills.length >= 3
        ? "As palavras dessa seção são comparadas com as da vaga."
        : "Crie a seção “Habilidades” com as competências que as vagas da sua área pedem.",
    },
    {
      id: "sobras",
      ok: unmatched.length <= 2 ? true : unmatched.length <= 6 ? "warn" : false,
      title: unmatched.length ? `${unmatched.length} trecho${unmatched.length > 1 ? "s" : ""} sem lugar` : "Todo o texto foi organizado",
      detail: unmatched.length
        ? "Partes do texto não foram reconhecidas em nenhuma seção. Costuma acontecer com tabelas, colunas e caixas de texto."
        : "Cada parte do currículo foi encaixada em uma seção.",
    },
    {
      id: "pessoais",
      ok: sensitive.length || fullAddress ? "warn" : true,
      title: sensitive.length
        ? "Dados pessoais que podem sair"
        : fullAddress
          ? "Endereço completo no currículo"
          : "Sem dados pessoais desnecessários",
      detail: sensitive.length
        ? `Encontramos ${sensitive.join(", ")}. Esses dados não são pedidos no currículo e expõem você: tire e informe só se a empresa pedir.`
        : fullAddress
          ? "Basta cidade e estado. Rua e número expõem você e não ajudam na seleção."
          : "Seu currículo mostra só o necessário para contato.",
    },
    ...(informalEmail
      ? [
          {
            id: "email-informal",
            ok: "warn" as const,
            title: "E-mail pouco profissional",
            detail: "Crie um e-mail com seu nome (ex.: nome.sobrenome@gmail.com). Passa mais seriedade para o recrutador.",
          },
        ]
      : []),
    {
      id: "caracteres",
      ok: odd === 0,
      title: odd ? "Caracteres estranhos no texto" : "Sem caracteres estranhos",
      detail: odd
        ? "Algumas letras saíram trocadas na leitura. Isso acontece com fontes decorativas: prefira fontes comuns."
        : "As letras e acentos foram lidos corretamente.",
    },
    {
      id: "paginas",
      ok: pages <= 2 ? true : "warn",
      title: `${pages} página${pages > 1 ? "s" : ""}`,
      detail: pages <= 2 ? "Bom tamanho." : "Currículos longos cansam o recrutador. Tente resumir em 1 ou 2 páginas.",
    },
    {
      id: "tamanho",
      ok: fileSize <= 2 * 1024 * 1024 ? true : "warn",
      title:
        fileSize < 1024 * 1024
          ? `Arquivo de ${Math.max(1, Math.round(fileSize / 1024))} KB`
          : `Arquivo de ${(fileSize / 1024 / 1024).toFixed(1).replace(".", ",")} MB`,
      detail: fileSize <= 2 * 1024 * 1024 ? "Leve para enviar por e-mail e sites." : "Alguns sites recusam arquivos grandes. Tire fotos pesadas ou exporte de novo.",
    },
  ];
  return checks;
}

export const robotScore = (checks: Check[]) =>
  Math.round((checks.reduce((n, c) => n + (c.ok === true ? 1 : c.ok === "warn" ? 0.5 : 0), 0) / checks.length) * 100);
