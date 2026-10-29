CREATE TABLE IF NOT EXISTS usage_events (
  id BIGSERIAL PRIMARY KEY,
  event_name TEXT NOT NULL CHECK (event_name IN ('site_visit', 'resume_started', 'pdf_print_requested', 'feedback_sent', 'donation_page_view')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS usage_events_created_at_idx ON usage_events (created_at DESC);
CREATE INDEX IF NOT EXISTS usage_events_name_created_idx ON usage_events (event_name, created_at DESC);
