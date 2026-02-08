-- Add photo_url column to leads for storing Google Maps photos
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT NULL;

-- Add lead_group column for AI categorization
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS lead_group TEXT DEFAULT NULL;

-- Add service_opportunities column for storing AI-identified needs
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS service_opportunities TEXT[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN public.leads.photo_url IS 'URL da foto do estabelecimento do Google Maps';
COMMENT ON COLUMN public.leads.lead_group IS 'Grupo do lead identificado pela IA (ex: Sem Site, Avaliação Baixa, etc)';
COMMENT ON COLUMN public.leads.service_opportunities IS 'Oportunidades de serviço identificadas pela IA';