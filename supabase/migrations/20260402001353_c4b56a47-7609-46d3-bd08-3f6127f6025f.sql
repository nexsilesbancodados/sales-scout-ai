
-- Add geo columns to leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lat double precision;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lng double precision;

-- Add instagram enrichment columns
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS instagram_bio text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS instagram_fetched_at timestamptz;

-- Create lead_notes table
CREATE TABLE IF NOT EXISTS public.lead_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lead notes"
  ON public.lead_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lead notes"
  ON public.lead_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lead notes"
  ON public.lead_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead notes"
  ON public.lead_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster geo queries
CREATE INDEX IF NOT EXISTS idx_leads_lat_lng ON public.leads (lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;
