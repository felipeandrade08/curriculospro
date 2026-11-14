// "Ideias para a sua profissão": usa os currículos de exemplo como banco de frases
// (objetivo, atividades e habilidades) e escolhe o exemplo mais parecido com o cargo digitado.
import { RESUME_EXAMPLES, type ResumeExample } from "@/lib/examples";

const fold = (s: string) =>
  s
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\(a\)|\(o\)/g, "")
    .replace(/[^a-z0-9 ]+/g, " ");

const STOP = new Set([
  "de",
  "da",
  "do",
  "das",
  "dos",
  "e",
  "em",
  "a",
  "o",
  "para",
  "com",
  "jr",
  "sr",
  "pleno",
  "junior",
  "senior",
  "i",
  "ii",
]);
const words = (s: string) =>
  fold(s)
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
// Compara pelo começo da palavra para "vendedora" casar com "vendedor", "recepção" com "recepcionista".
const stem = (w: string) => w.slice(0, Math.max(4, Math.min(6, w.length - 1)));

export function matchExamples(role: string, limit = 3): ResumeExample[] {
  const target = words(role).map(stem);
  if (!target.length) return [];
  const scored = RESUME_EXAMPLES.map((ex) => {
    const strong = words(ex.title + " " + ex.data.role).map(stem);
    const weak = words(ex.category + " " + ex.data.experiences.map((x) => x.title).join(" ")).map(stem);
    let score = 0;
    for (const t of target) {
      if (strong.includes(t)) score += 3;
      else if (weak.includes(t)) score += 1;
    }
    return { ex, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  const best = scored[0]?.score || 0;
  // Fica só com exemplos quase tão bons quanto o melhor ("analista financeiro" não puxa "analista de RH").
  return scored
    .filter((x) => x.score >= best * 0.75)
    .slice(0, limit)
    .map((x) => x.ex);
}

/** Frases de atividade (uma por linha, sem marcador) dos exemplos indicados. */
export function activityIdeas(examples: ResumeExample[]): string[] {
  const out: string[] = [];
  for (const ex of examples)
    for (const exp of ex.data.experiences)
      for (const line of exp.description.split("\n")) {
        const t = line.replace(/^[•\-–]\s*/, "").trim();
        if (t && !out.includes(t)) out.push(t);
      }
  return out;
}

export function skillIdeas(examples: ResumeExample[]): string[] {
  return [...new Set(examples.flatMap((ex) => ex.data.skills))];
}
