import { db } from "@/lib/server/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowed = new Set([
  "site_visit",
  "resume_started",
  "pdf_print_requested",
  "feedback_sent",
  "donation_page_view",
  "paywall_view",
  "checkout_started",
  "payment_approved",
  "pricing_view",
  "start_page_view",
  "resume_imported",
  "example_used",
  "referral_visit",
  "cover_letter_started",
  "cover_letter_printed",
  "docx_downloaded",
  "service_requested",
  "job_match_used",
  "interview_view",
  "applications_used",
  "send_message_copied",
  "linkedin_used",
  "kit_gate_view",
  "robot_test_used",
]);
const recent = new Map<string, number>();
const WINDOW_MS = 60_000;

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 1024)
      return NextResponse.json({ error: "Requisição muito grande." }, { status: 413 });
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin && host && new URL(origin).host !== host)
      return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
    const raw = await request.text();
    if (raw.length > 1024) return NextResponse.json({ error: "Requisição muito grande." }, { status: 413 });
    const body = JSON.parse(raw) as { event?: unknown };
    if (typeof body.event !== "string" || !allowed.has(body.event)) {
      return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
    }
    // Best-effort in-memory rate limit; no IP address is persisted.
    const source = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now();
    const previous = recent.get(source);
    if (previous && now - previous < 150) return NextResponse.json({ ok: true });
    recent.set(source, now);
    if (recent.size > 5000) for (const [key, time] of recent) if (now - time > WINDOW_MS) recent.delete(key);
    const sql = db();
    await sql`INSERT INTO usage_events (event_name) VALUES (${body.event})`;
    return NextResponse.json({ ok: true });
  } catch {
    // Measurement must not affect the user's ability to use the site.
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
