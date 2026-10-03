BEGIN;
CREATE TABLE IF NOT EXISTS app_users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  display_name text,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS resumes (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  title text NOT NULL,
  template text NOT NULL CHECK (template IN ('essential','modern','executive')),
  accent text NOT NULL DEFAULT '#087cf0',
  density text NOT NULL DEFAULT 'comfortable' CHECK (density IN ('comfortable','compact')),
  payload jsonb NOT NULL,
  section_order jsonb NOT NULL DEFAULT '[]'::jsonb,
  hidden_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS resumes_user_updated_idx ON resumes(user_id,updated_at DESC) WHERE deleted_at IS NULL;
COMMIT;
