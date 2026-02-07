-- Add remaining anti-block configuration columns to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS hourly_message_limit integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS message_interval_max integer DEFAULT 180,
ADD COLUMN IF NOT EXISTS max_consecutive_errors integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS pause_duration_minutes integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS typing_delay_ms integer DEFAULT 2000,
ADD COLUMN IF NOT EXISTS read_receipt_delay boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_slowdown boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS slowdown_threshold integer DEFAULT 5;