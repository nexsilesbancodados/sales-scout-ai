ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS deal_value numeric DEFAULT NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS tasks jsonb DEFAULT '[]'::jsonb;