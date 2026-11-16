-- Depoimentos públicos (com autorização e moderação), resposta do admin,
-- liberações manuais de acesso e novos eventos de uso.
ALTER TABLE user_feedback ADD COLUMN IF NOT EXISTS author_name text;
ALTER TABLE user_feedback ADD COLUMN IF NOT EXISTS author_role text;
ALTER TABLE user_feedback ADD COLUMN IF NOT EXISTS allow_public boolean NOT NULL DEFAULT false;
ALTER TABLE user_feedback ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';
ALTER TABLE user_feedback ADD COLUMN IF NOT EXISTS admin_reply text;
ALTER TABLE user_feedback ADD COLUMN IF NOT EXISTS replied_at timestamptz;
ALTER TABLE user_feedback ADD COLUMN IF NOT EXISTS published_at timestamptz;
ALTER TABLE user_feedback ADD COLUMN IF NOT EXISTS user_id text;
ALTER TABLE user_feedback DROP CONSTRAINT IF EXISTS user_feedback_status_check;
ALTER TABLE user_feedback ADD CONSTRAINT user_feedback_status_check CHECK (status IN ('new', 'read', 'published', 'hidden'));
CREATE INDEX IF NOT EXISTS user_feedback_public_idx ON user_feedback (published_at DESC) WHERE status = 'published';

CREATE TABLE IF NOT EXISTS access_grants (
  id bigserial PRIMARY KEY,
  user_id text NOT NULL REFERENCES app_users(id),
  days integer NOT NULL CHECK (days BETWEEN 1 AND 365),
  reason text,
  granted_by text NOT NULL,
  access_until_after timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE usage_events DROP CONSTRAINT IF EXISTS usage_events_event_name_check;
ALTER TABLE usage_events ADD CONSTRAINT usage_events_event_name_check CHECK (event_name IN ('site_visit', 'resume_started', 'pdf_print_requested', 'feedback_sent', 'donation_page_view', 'paywall_view', 'checkout_started', 'payment_approved', 'pricing_view', 'start_page_view', 'resume_imported', 'example_used'));
