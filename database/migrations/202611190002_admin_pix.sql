-- Cobrança Pix gerada pela equipe no painel (vendas pelo WhatsApp).
-- Venda avulsa não tem conta ligada nem dias de acesso.
ALTER TABLE payments ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_access_days_check;
ALTER TABLE payments ADD CONSTRAINT payments_access_days_check CHECK (access_days >= 0);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS customer jsonb;
