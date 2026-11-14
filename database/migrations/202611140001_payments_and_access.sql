-- Acesso pago por período e pagamentos Pix via Mercado Pago.
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS access_until timestamptz;

CREATE TABLE IF NOT EXISTS payments (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES app_users(id),
  provider text NOT NULL DEFAULT 'mercadopago',
  method text NOT NULL DEFAULT 'pix',
  status text NOT NULL,
  status_detail text,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  access_days integer NOT NULL CHECK (access_days > 0),
  qr_code text,
  qr_code_base64 text,
  ticket_url text,
  expires_at timestamptz,
  approved_at timestamptz,
  granted_at timestamptz,
  revoked_at timestamptz,
  access_until_after timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_user_created_idx ON payments (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS payments_status_created_idx ON payments (status, created_at DESC);

ALTER TABLE usage_events DROP CONSTRAINT IF EXISTS usage_events_event_name_check;

ALTER TABLE usage_events ADD CONSTRAINT usage_events_event_name_check CHECK (event_name IN ('site_visit', 'resume_started', 'pdf_print_requested', 'feedback_sent', 'donation_page_view', 'paywall_view', 'checkout_started', 'payment_approved', 'pricing_view'));
