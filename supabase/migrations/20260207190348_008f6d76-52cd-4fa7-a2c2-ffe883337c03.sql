-- Add Serper.dev API key and preferred search API fields to user_settings
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS serper_api_key text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS preferred_search_api text DEFAULT 'serper';