
CREATE TABLE public.community_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  phone text NOT NULL,
  address text,
  rating numeric,
  reviews_count integer,
  website text,
  email text,
  google_maps_url text,
  niche text NOT NULL,
  location text NOT NULL,
  niche_normalized text NOT NULL,
  location_normalized text NOT NULL,
  source text DEFAULT 'serpapi',
  contributed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(phone, niche_normalized, location_normalized)
);

CREATE INDEX idx_community_leads_niche_location ON public.community_leads(niche_normalized, location_normalized);
CREATE INDEX idx_community_leads_phone ON public.community_leads(phone);

ALTER TABLE public.community_leads ENABLE ROW LEVEL SECURITY;

-- Everyone can read community leads
CREATE POLICY "Anyone authenticated can read community leads"
  ON public.community_leads FOR SELECT TO authenticated
  USING (true);

-- Anyone can insert (contribute)
CREATE POLICY "Anyone authenticated can insert community leads"
  ON public.community_leads FOR INSERT TO authenticated
  WITH CHECK (true);
