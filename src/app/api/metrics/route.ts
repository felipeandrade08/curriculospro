import {db} from "@/lib/server/db";
import {NextResponse} from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowed = new Set(["site_visit", "resume_started", "pdf_print_requested", "feedback_sent", "donation_page_view"]);
const recent = new Map<string, number>();
const WINDOW_MS = 60_000;

export async function POST(request: Request) {
  try {
    const body = await request.json() as {event?: unknown};
    if (typeof body.event !== "string" || !allowed.has(body.event)) {
      return NextResponse.json({error:"Evento inválido."},{status:400});
    }
    // Best-effort in-memory rate limit; no IP address is persisted.
    const source = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now();
    const previous = recent.get(source);
    if (previous && now - previous < 150) return NextResponse.json({ok:true});
    recent.set(source, now);
    if (recent.size > 5000) for (const [key,time] of recent) if (now-time>WINDOW_MS) recent.delete(key);
    const sql = db();
    await sql`INSERT INTO usage_events (event_name) VALUES (${body.event})`;
    return NextResponse.json({ok:true});
  } catch {
    // Measurement must not affect the user's ability to use the site.
    return NextResponse.json({ok:false},{status:503});
  }
}
