-- Origem das vendas (canal/campanha) e envio da compra para a API de Conversões da Meta.
ALTER TABLE payments ADD COLUMN IF NOT EXISTS source jsonb;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS capi_sent_at timestamptz;
ALTER TABLE checkout_intents ADD COLUMN IF NOT EXISTS source jsonb;
