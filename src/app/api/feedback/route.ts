import {neon} from "@neondatabase/serverless";
import {NextResponse} from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const recentSubmissions = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;

export async function POST(request: Request) {
  try {
    const contentLength=Number(request.headers.get("content-length")||0);
    if(contentLength>10_240) return NextResponse.json({error:"Requisição muito grande."},{status:413});
    const origin=request.headers.get("origin");
    const host=request.headers.get("host");
    if(origin&&host&&new URL(origin).host!==host) return NextResponse.json({error:"Origem não autorizada."},{status:403});
    const raw=await request.text();
    if(raw.length>10_240) return NextResponse.json({error:"Requisição muito grande."},{status:413});
    const body=JSON.parse(raw) as {
      rating?: unknown;
      category?: unknown;
      message?: unknown;
      website?: unknown;
    };

    // Honeypot: silently accept bot submissions without storing them.
    if (typeof body.website === "string" && body.website.trim()) {
      return NextResponse.json({ok: true});
    }

    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now();
    const recent = (recentSubmissions.get(forwarded) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
    if (recent.length >= MAX_PER_WINDOW) {
      return NextResponse.json({error: "Você atingiu o limite de 3 feedbacks por minuto. Tente novamente em instantes."}, {status: 429});
    }
    recent.push(now);
    recentSubmissions.set(forwarded, recent);
    if (recentSubmissions.size > 5000) {
      for (const [key, timestamps] of recentSubmissions) {
        const active = timestamps.filter((timestamp) => now - timestamp < WINDOW_MS);
        if (active.length) recentSubmissions.set(key, active);
        else recentSubmissions.delete(key);
      }
    }

    const rating = Number(body.rating);
    const category = body.category;
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({error: "Escolha uma nota de 1 a 5."}, {status: 400});
    }
    if (category !== "suggestion" && category !== "problem" && category !== "praise") {
      return NextResponse.json({error: "Selecione uma categoria válida."}, {status: 400});
    }
    if (message.length < 3 || message.length > 2000) {
      return NextResponse.json({error: "Escreva uma mensagem de 3 a 2.000 caracteres."}, {status: 400});
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({error: "O envio está temporariamente indisponível. Tente novamente mais tarde."}, {status: 503});
    }

    const sql = neon(databaseUrl);
    await sql`INSERT INTO user_feedback (rating, category, message)
      VALUES (${rating}, ${category}, ${message})`;
    return NextResponse.json({ok: true});
  } catch {
    return NextResponse.json({error: "Não foi possível enviar agora. Tente novamente mais tarde."}, {status: 500});
  }
}
