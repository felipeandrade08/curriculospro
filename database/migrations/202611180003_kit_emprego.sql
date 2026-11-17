-- Kit Emprego: o plano de 30 dias libera as ferramentas de busca de emprego.
-- kit_until guarda até quando a pessoa tem o Kit; "upgrade" completa 30 dias para quem comprou o Currículo.
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS kit_until timestamptz;

-- Quem já comprou o plano de 30 dias recebe o Kit até o fim do acesso atual.
UPDATE app_users u SET kit_until = u.access_until
WHERE u.kit_until IS NULL AND u.access_until > now()
  AND EXISTS (SELECT 1 FROM payments p WHERE p.user_id = u.id AND p.plan = 'mes' AND p.granted_at IS NOT NULL AND p.revoked_at IS NULL);

ALTER TABLE checkout_intents DROP CONSTRAINT IF EXISTS checkout_intents_plan_check;
ALTER TABLE checkout_intents ADD CONSTRAINT checkout_intents_plan_check CHECK (plan IN ('semana', 'mes', 'upgrade'));

ALTER TABLE usage_events DROP CONSTRAINT IF EXISTS usage_events_event_name_check;
ALTER TABLE usage_events ADD CONSTRAINT usage_events_event_name_check CHECK (event_name IN ('site_visit', 'resume_started', 'pdf_print_requested', 'feedback_sent', 'donation_page_view', 'paywall_view', 'checkout_started', 'payment_approved', 'pricing_view', 'start_page_view', 'resume_imported', 'example_used', 'referral_visit', 'cover_letter_started', 'cover_letter_printed', 'docx_downloaded', 'service_requested', 'job_match_used', 'interview_view', 'applications_used', 'send_message_copied', 'linkedin_used', 'kit_gate_view', 'robot_test_used'));
