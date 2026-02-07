-- Add anti-block configuration columns to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS work_days_only boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS operate_all_day boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS warmup_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS warmup_day integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS warmup_start_date timestamptz DEFAULT null,
ADD COLUMN IF NOT EXISTS randomize_interval boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS randomize_order boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS typing_simulation boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS pause_on_error boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS cooldown_after_batch boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS batch_size integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS cooldown_minutes integer DEFAULT 15;