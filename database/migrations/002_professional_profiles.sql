BEGIN;

CREATE TABLE IF NOT EXISTS professional_profiles (
  user_id text PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  payload jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
