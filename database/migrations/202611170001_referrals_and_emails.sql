-- Indicação com dias extras e e-mails automáticos.
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS referral_code text;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS referred_by text REFERENCES app_users(id);
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS referred_at timestamptz;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS email_opt_out boolean NOT NULL DEFAULT false;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS expiry_reminder_for timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS app_users_referral_code_idx ON app_users (referral_code) WHERE referral_code IS NOT NULL;

ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_sent_at timestamptz;

CREATE TABLE IF NOT EXISTS referral_rewards (
  id bigserial PRIMARY KEY,
  referrer_id text NOT NULL REFERENCES app_users(id),
  referred_id text NOT NULL UNIQUE REFERENCES app_users(id),
  payment_id text NOT NULL REFERENCES payments(id),
  referrer_days integer NOT NULL,
  referred_days integer NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS referral_rewards_referrer_idx ON referral_rewards (referrer_id, created_at DESC);

ALTER TABLE usage_events DROP CONSTRAINT IF EXISTS usage_events_event_name_check;
ALTER TABLE usage_events ADD CONSTRAINT usage_events_event_name_check CHECK (event_name IN ('site_visit', 'resume_started', 'pdf_print_requested', 'feedback_sent', 'donation_page_view', 'paywall_view', 'checkout_started', 'payment_approved', 'pricing_view', 'start_page_view', 'resume_imported', 'example_used', 'referral_visit', 'cover_letter_started', 'cover_letter_printed'));
