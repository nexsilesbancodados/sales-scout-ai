
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS auto_first_message_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_followup_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_pipeline_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_reactivation_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_lead_scoring boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS sdr_agent_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS weekly_report_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_niche text DEFAULT NULL;
