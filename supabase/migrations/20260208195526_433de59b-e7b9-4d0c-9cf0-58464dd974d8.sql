-- Add Google Meet link field to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS google_meet_link text;