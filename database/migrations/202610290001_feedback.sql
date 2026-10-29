CREATE TABLE IF NOT EXISTS user_feedback (
  id BIGSERIAL PRIMARY KEY,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  category TEXT NOT NULL CHECK (category IN ('suggestion', 'problem', 'praise')),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 3 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_feedback_created_at_idx
  ON user_feedback (created_at DESC);
