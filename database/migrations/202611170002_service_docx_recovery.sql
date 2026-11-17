-- Recuperação de Pix não pago, pedidos do serviço "Fazemos para você" e novos eventos.
ALTER TABLE payments ADD COLUMN IF NOT EXISTS recovery_sent_at timestamptz;

CREATE TABLE IF NOT EXISTS service_requests (
  id bigserial PRIMARY KEY,
  user_id text NOT NULL REFERENCES app_users(id),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'delivered', 'cancelled')),
  data jsonb NOT NULL,
  admin_note text,
  delivered_resume_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz
);
CREATE INDEX IF NOT EXISTS service_requests_status_idx ON service_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS service_requests_user_idx ON service_requests (user_id, created_at DESC);

ALTER TABLE usage_events DROP CONSTRAINT IF EXISTS usage_events_event_name_check;
ALTER TABLE usage_events ADD CONSTRAINT usage_events_event_name_check CHECK (event_name IN ('site_visit', 'resume_started', 'pdf_print_requested', 'feedback_sent', 'donation_page_view', 'paywall_view', 'checkout_started', 'payment_approved', 'pricing_view', 'start_page_view', 'resume_imported', 'example_used', 'referral_visit', 'cover_letter_started', 'cover_letter_printed', 'docx_downloaded', 'service_requested'));
