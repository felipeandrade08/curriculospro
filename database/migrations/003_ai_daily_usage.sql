BEGIN;

CREATE TABLE IF NOT EXISTS ai_daily_usage (
  user_id text NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  requests integer NOT NULL DEFAULT 0 CHECK (requests >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, usage_date)
);

COMMIT;
