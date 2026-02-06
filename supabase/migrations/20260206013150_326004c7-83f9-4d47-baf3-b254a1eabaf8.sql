-- Add columns for user's own API keys
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS gemini_api_key TEXT,
ADD COLUMN IF NOT EXISTS serpapi_api_key TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.user_settings.gemini_api_key IS 'User personal Gemini API key for AI features';
COMMENT ON COLUMN public.user_settings.serpapi_api_key IS 'User personal SerpAPI key for lead prospecting';