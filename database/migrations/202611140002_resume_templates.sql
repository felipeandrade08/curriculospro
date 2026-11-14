-- Aceita todos os modelos visuais. A restrição original só permitia 3 modelos,
-- o que fazia a sincronização falhar para Minimalista e Criativo.
ALTER TABLE resumes DROP CONSTRAINT IF EXISTS resumes_template_check;

ALTER TABLE resumes ADD CONSTRAINT resumes_template_check CHECK (template IN ('essential', 'modern', 'executive', 'minimal', 'creative', 'professional', 'elegant', 'compact', 'tech', 'corporate'));
