-- Arquivos anexados ao pedido "Fazemos para você" (currículo antigo em PDF, Word ou foto).
-- Ficam só para montar o currículo e são apagados 60 dias depois do pedido encerrado.
CREATE TABLE IF NOT EXISTS service_files (
  id bigserial PRIMARY KEY,
  request_id bigint NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES app_users(id),
  filename text NOT NULL,
  content_type text NOT NULL,
  size_bytes integer NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 4194304),
  data bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS service_files_request_idx ON service_files (request_id);
