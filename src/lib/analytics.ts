import { isTeamBrowser } from "@/lib/team";
import { ACCESS_PRICE_CENTS } from "@/lib/billing";
export type UsageEvent =
  | "site_visit"
  | "resume_started"
  | "pdf_print_requested"
  | "feedback_sent"
  | "donation_page_view"
  | "paywall_view"
  | "checkout_started"
  | "payment_approved"
  | "pricing_view"
  | "start_page_view"
  | "resume_imported"
  | "example_used"
  | "referral_visit"
  | "cover_letter_started"
  | "cover_letter_printed"
  | "docx_downloaded"
  | "service_requested"
  | "job_match_used"
  | "interview_view"
  | "applications_used"
  | "send_message_copied"
  | "linkedin_used"
  | "kit_gate_view"
  | "robot_test_used"
  | "ad_landing_view"
  | "whatsapp_click"
  | "grade_used";

const repeatable = new Set<UsageEvent>([
  "pdf_print_requested",
  "feedback_sent",
  "checkout_started",
  "payment_approved",
  "cover_letter_printed",
  "docx_downloaded",
  "service_requested",
  "send_message_copied",
]);

// Eventos do site que também vão para o Meta Pixel (se houver consentimento).
const META_EVENTS: Partial<Record<UsageEvent, string>> = {
  resume_started: "Lead",
  checkout_started: "InitiateCheckout",
  whatsapp_click: "Contact",
};

export function trackUsage(event: UsageEvent) {
  if (typeof window === "undefined") return;
  // A equipe não entra nas métricas nem no Pixel (não é cliente).
  if (isTeamBrowser()) return;
  const metaEvent = META_EVENTS[event];
  if (metaEvent)
    void import("@/lib/meta-pixel").then((m) =>
      m.metaTrack(
        metaEvent,
        metaEvent === "InitiateCheckout" ? { value: ACCESS_PRICE_CENTS / 100, currency: "BRL" } : undefined,
      ),
    );
  try {
    const key = "curriculospro.metrics.once.v1:" + event;
    if (!repeatable.has(event) && sessionStorage.getItem(key)) return;
    if (!repeatable.has(event)) sessionStorage.setItem(key, "1");
    void fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Analytics are optional and must never interrupt resume creation.
  }
}
