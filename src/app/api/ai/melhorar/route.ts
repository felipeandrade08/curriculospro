import { hasKit } from "@/lib/billing";
import { db } from "@/lib/server/db";
import { getKitUntil } from "@/lib/server/payments";
import { isSameOrigin } from "@/lib/server/request";
import { getServerSession } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// "Melhorar com IA": reescreve o objetivo profissional ou as atividades de uma experiência
// com português mais claro e profissional, sem inventar nada. Só no Kit Emprego.
const MODEL = () => process.env.OPENAI_IMPROVE_MODEL?.trim() || process.env.OPENAI_TAILOR_MODEL?.trim() || "gpt-5-mini";
const DAILY_LIMIT = 15;
const enabled = () => !!process.env.OPENAI_API_KEY?.trim();

/** O editor pergunta se o recurso está ligado antes de mostrar o botão. */
export async function GET() {
  return Response.json({ enabled: enabled(), limit: DAILY_LIMIT });
}

type Kind = "summary" | "activities";
const clean = (v: unknown, n: number) => (typeof v === "string" ? v.replace(/\u0000/g, "").trim().slice(0, n) : "");

const RULES = [
  "Escreva em português do Brasil, claro, profissional e natural, como uma pessoa real escreveria.",
  "Use SOMENTE as informações do texto original e do contexto. Não invente empresa, cargo, número, porcentagem, resultado, ferramenta, curso, tempo de experiência ou responsabilidade.",
  "Corrija ortografia, acentuação, pontuação e concordância.",
  "Evite clichês vazios (ex.: 'proativo e dinâmico', 'sangue no olho') e exageros.",
  "Não use primeira pessoa em excesso; não use emojis.",
];

function instructions(kind: Kind) {
  return kind === "summary"
    ? [
        ...RULES,
        "Tarefa: reescrever o OBJETIVO PROFISSIONAL do currículo.",
        "Formato: um parágrafo de 2 a 4 frases, entre 250 e 550 caracteres.",
        "Diga a área/função desejada, os pontos fortes que aparecem no texto e como a pessoa pode contribuir.",
      ]
    : [
        ...RULES,
        "Tarefa: reescrever as ATIVIDADES de uma experiência profissional.",
        "Formato: de 3 a 6 linhas, uma atividade por linha, sem marcador no começo (sem '-', '•' ou números).",
        "Cada linha começa com um verbo no infinitivo ou substantivo de ação (ex.: 'Atendimento a clientes...', 'Organizar...'), com no máximo 140 caracteres.",
        "Se o original tiver poucas informações, mantenha poucas linhas em vez de inventar.",
      ];
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  if (!enabled()) return Response.json({ error: "ai_disabled" }, { status: 503 });
  const session = await getServerSession().catch(() => null);
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (session.plan !== "pro" && !hasKit(await getKitUntil(session.userId)))
    return Response.json({ error: "kit_required" }, { status: 402 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const kind: Kind = body.kind === "activities" ? "activities" : "summary";
  const text = clean(body.text, 2000);
  if (text.length < 15)
    return Response.json(
      { error: "too_short", message: "Escreva pelo menos uma frase para a IA melhorar." },
      { status: 400 },
    );
  const context = {
    cargoDesejado: clean(body.role, 120),
    cargo: clean(body.title, 120),
    empresa: clean(body.company, 120),
  };

  const sql = db();
  const [usage] = await sql`INSERT INTO ai_daily_usage(user_id,usage_date,requests) VALUES(${session.userId},CURRENT_DATE,1)
    ON CONFLICT(user_id,usage_date) DO UPDATE SET requests=ai_daily_usage.requests+1, updated_at=now()
    RETURNING requests`;
  const used = Number(usage?.requests || 1);
  if (session.plan !== "pro" && used > DAILY_LIMIT)
    return Response.json(
      {
        error: "daily_limit",
        message: `Você já usou a IA ${DAILY_LIMIT} vezes hoje. Amanhã libera de novo.`,
      },
      { status: 429 },
    );

  // Falha da IA não conta no limite do dia.
  const refund = () =>
    sql`UPDATE ai_daily_usage SET requests = GREATEST(requests - 1, 0)
      WHERE user_id=${session.userId} AND usage_date=CURRENT_DATE`.catch(() => {});
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { authorization: "Bearer " + process.env.OPENAI_API_KEY!.trim(), "content-type": "application/json" },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        model: MODEL(),
        store: false,
        input: [
          { role: "system", content: instructions(kind).join("\n") },
          { role: "user", content: JSON.stringify({ textoOriginal: text, contexto: context }) },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "curriculospro_improve",
            strict: true,
            schema: {
              type: "object",
              properties: { text: { type: "string" } },
              required: ["text"],
              additionalProperties: false,
            },
          },
        },
      }),
    });
    if (!response.ok) {
      console.error("IA melhorar falhou", response.status, (await response.text()).slice(0, 400));
      await refund();
      return Response.json({ error: "provider_unavailable" }, { status: 502 });
    }
    const raw = (await response.json()) as {
      output_text?: string;
      output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    };
    const out =
      raw.output_text || raw.output?.flatMap((x) => x.content || []).find((x) => x.type === "output_text")?.text;
    let result = "";
    try {
      result = clean((JSON.parse(out || "{}") as { text?: unknown }).text, kind === "summary" ? 900 : 1200);
    } catch {}
    if (kind === "activities")
      result = result
        .split("\n")
        .map((l) => l.replace(/^\s*(?:[-•*·]|\d+[.)])\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 8)
        .join("\n");
    if (!result) {
      await refund();
      return Response.json({ error: "empty_provider_response" }, { status: 502 });
    }
    return Response.json({ text: result, remaining: session.plan === "pro" ? null : Math.max(0, DAILY_LIMIT - used) });
  } catch (error) {
    console.error("IA melhorar falhou", error);
    await refund();
    return Response.json({ error: "provider_unavailable" }, { status: 502 });
  }
}
