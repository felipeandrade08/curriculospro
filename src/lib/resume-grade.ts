// Nota de 0 a 10 do currículo para uma vaga, com o motivo de cada ponto perdido.
// Junta: compatibilidade com a vaga, leitura por robô, tarefas com número e itens essenciais.
import { analyzeJob, type JobMatch } from "@/lib/job-match";
import { robotChecks, robotScore } from "@/lib/robot-check";
import type { ImportLine, ImportResult } from "@/lib/import/parse";
import type { ResumeData } from "@/lib/resume";

export type GradeReason = { id: string; title: string; detail: string; lost: number; items?: string[] };
export type Grade = {
  /** 0 a 10, uma casa decimal. */
  score: number;
  tone: "low" | "mid" | "good";
  verdict: string;
  reasons: GradeReason[];
  match: JobMatch;
  missingTerms: string[];
  tasks: { total: number; withNumber: number };
};

const W = { match: 4.5, robot: 2, numbers: 1.5, essentials: 2 };

/** Linhas de tarefa das experiências (uma por linha ou por frase). */
export function taskLines(cv: ResumeData) {
  return cv.experiences
    .flatMap((x) => (x.description || "").split(/\n|(?<=[.;])\s+/))
    .map((l) => l.replace(/^[\s•\-–*·]+/, "").trim())
    .filter((l) => l.length >= 15);
}

export function gradeResume(
  read: { lines: ImportLine[]; result: ImportResult; fileSize: number },
  job: { title: string; description: string },
): Grade {
  const cv = read.result.cv;
  const match = analyzeJob(job.description, job.title, cv);
  const checks = robotChecks(read.lines, read.result, read.fileSize);
  const robot = robotScore(checks);
  const tasks = taskLines(cv);
  const withNumber = tasks.filter((l) => /\d/.test(l)).length;
  const numbersPct = tasks.length ? withNumber / tasks.length : 0.5;

  const essentials = [
    { ok: !!cv.email.trim(), title: "Sem e-mail no currículo", detail: "O recrutador precisa de um e-mail para responder." },
    { ok: !!cv.phone.trim(), title: "Sem telefone no currículo", detail: "Muitas empresas chamam por telefone ou WhatsApp." },
    { ok: cv.summary.trim().length >= 60, title: "Resumo ausente ou muito curto", detail: "Um resumo de 3 a 4 linhas é a primeira coisa que o recrutador lê." },
    { ok: cv.skills.length >= 3, title: "Poucas competências listadas", detail: "Liste pelo menos 3 competências que a vaga pede e você tem." },
    { ok: !!cv.role.trim(), title: "Sem objetivo ou cargo no topo", detail: "Diga logo no começo qual cargo você procura." },
  ];
  const essOk = essentials.filter((e) => e.ok).length / essentials.length;

  const raw = W.match * (match.score / 100) + W.robot * (robot / 100) + W.numbers * numbersPct + W.essentials * essOk;
  const score = Math.max(0, Math.min(10, Math.round(raw * 10) / 10));

  const missing = match.requirements.filter((r) => !r.has);
  const missingTerms = missing.map((r) => r.label);
  const reasons: GradeReason[] = [];
  const lostMatch = W.match * (1 - match.score / 100);
  if (missing.length)
    reasons.push({
      id: "terms",
      title: `${missing.length} ${missing.length === 1 ? "termo da vaga ausente" : "termos da vaga ausentes"}`,
      detail: "A vaga pede e o seu currículo não mostra. Se você tem, deixe escrito com as mesmas palavras.",
      items: missingTerms.slice(0, 8),
      lost: lostMatch * 0.8,
    });
  const roleTip = match.tips.find((t) => t.action === "role");
  if (roleTip)
    reasons.push({ id: "role", title: "Cargo diferente do título da vaga", detail: roleTip.text, lost: lostMatch * (missing.length ? 0.2 : 1) });
  else if (!missing.length && lostMatch > 0.2)
    reasons.push({ id: "fit", title: "Pouca ligação com a vaga", detail: "Use no resumo e nas experiências as palavras que a vaga repete.", items: match.repeated.slice(0, 6), lost: lostMatch });
  if (tasks.length && withNumber < tasks.length)
    reasons.push({
      id: "numbers",
      title: `${tasks.length - withNumber} ${tasks.length - withNumber === 1 ? "tarefa sem número" : "tarefas sem número"}`,
      detail: "Números mostram resultado: clientes por dia, pedidos, metas batidas, tamanho da equipe.",
      lost: W.numbers * (1 - numbersPct),
    });
  if (!tasks.length)
    reasons.push({ id: "notasks", title: "Experiências sem descrição", detail: "Descreva o que você fazia em cada emprego, com resultados.", lost: W.numbers * 0.5 });
  const badChecks = checks.filter((c) => c.ok !== true);
  if (badChecks.length)
    reasons.push({
      id: "robot",
      title: "O robô de seleção lê só parte do currículo",
      detail: badChecks.map((c) => c.title).slice(0, 3).join(". ") + ".",
      lost: W.robot * (1 - robot / 100),
    });
  for (const e of essentials)
    if (!e.ok) reasons.push({ id: "ess-" + e.title, title: e.title, detail: e.detail, lost: W.essentials / essentials.length });
  if (match.experience)
    reasons.push({ id: "exp", title: `A vaga pede ${match.experience} de experiência`, detail: "Deixe os períodos de cada emprego bem claros (mês e ano).", lost: 0.05 });

  reasons.sort((a, b) => b.lost - a.lost);
  const tone = score >= 8 ? "good" : score >= 6 ? "mid" : "low";
  const verdict = tone === "good" ? "Bom para esta vaga" : tone === "mid" ? "Dá para melhorar" : "Risco de ser filtrado";
  return { score, tone, verdict, reasons: reasons.filter((r) => r.lost >= 0.05), match, missingTerms, tasks: { total: tasks.length, withNumber } };
}

export const formatGrade = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
