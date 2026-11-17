-- Cupons de desconto, plano de 30 dias, pagamento com cartão (Checkout Pro),
-- e-mail para quem criou conta e ainda não comprou, e novos eventos.
CREATE TABLE IF NOT EXISTS coupons (
  code text PRIMARY KEY CHECK (code ~ '^[A-Z0-9]{3,20}$'),
  description text,
  percent_off integer CHECK (percent_off BETWEEN 1 AND 90),
  amount_off_cents integer CHECK (amount_off_cents > 0),
  plan text CHECK (plan IN ('semana', 'mes')),
  max_uses integer CHECK (max_uses > 0),
  first_purchase_only boolean NOT NULL DEFAULT false,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((percent_off IS NULL) <> (amount_off_cents IS NULL))
);

ALTER TABLE payments ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'semana';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS coupon_code text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS original_cents integer;
CREATE INDEX IF NOT EXISTS payments_coupon_idx ON payments (coupon_code) WHERE coupon_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS checkout_intents (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES app_users(id),
  plan text NOT NULL CHECK (plan IN ('semana', 'mes')),
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  original_cents integer NOT NULL CHECK (original_cents > 0),
  access_days integer NOT NULL CHECK (access_days > 0),
  coupon_code text,
  preference_id text,
  payment_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS checkout_intents_user_idx ON checkout_intents (user_id, created_at DESC);

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS nudge_sent_at timestamptz;

INSERT INTO coupons (code, description, amount_off_cents, plan, first_purchase_only)
VALUES ('PRIMEIRO', 'R$ 2,00 de desconto na primeira compra de 7 dias', 200, 'semana', true)
ON CONFLICT (code) DO NOTHING;

ALTER TABLE usage_events DROP CONSTRAINT IF EXISTS usage_events_event_name_check;
ALTER TABLE usage_events ADD CONSTRAINT usage_events_event_name_check CHECK (event_name IN ('site_visit', 'resume_started', 'pdf_print_requested', 'feedback_sent', 'donation_page_view', 'paywall_view', 'checkout_started', 'payment_approved', 'pricing_view', 'start_page_view', 'resume_imported', 'example_used', 'referral_visit', 'cover_letter_started', 'cover_letter_printed', 'docx_downloaded', 'service_requested', 'job_match_used', 'interview_view', 'applications_used', 'send_message_copied'));
