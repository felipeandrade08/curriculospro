-- Entrega do "Fazemos para você": o PDF enviado pela equipe fica junto do pedido.
ALTER TABLE service_files ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'upload';
ALTER TABLE service_files DROP CONSTRAINT IF EXISTS service_files_kind_check;
ALTER TABLE service_files ADD CONSTRAINT service_files_kind_check CHECK (kind IN ('upload', 'delivery'));
