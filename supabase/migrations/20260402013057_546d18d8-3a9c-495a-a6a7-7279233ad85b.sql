ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS chip_rotation_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS chip_rotation_strategy text DEFAULT 'single',
  ADD COLUMN IF NOT EXISTS extra_chip_instances jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS active_chip_ids text[] DEFAULT '{}'::text[];