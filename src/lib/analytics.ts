export type UsageEvent = "site_visit" | "resume_started" | "pdf_print_requested" | "feedback_sent" | "donation_page_view";

export function trackUsage(event: UsageEvent) {
  if (typeof window === "undefined") return;
  try {
    const key = "curriculospro.metrics.once.v1:" + event;
    if (event !== "pdf_print_requested" && sessionStorage.getItem(key)) return;
    if (event !== "pdf_print_requested") sessionStorage.setItem(key, "1");
    void fetch("/api/metrics", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({event}),
      keepalive: true
    }).catch(() => {});
  } catch {
    // Analytics are optional and must never interrupt resume creation.
  }
}
