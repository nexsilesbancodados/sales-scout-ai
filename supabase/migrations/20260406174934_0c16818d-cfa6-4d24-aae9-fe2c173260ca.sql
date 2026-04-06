
CREATE TABLE public.ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  niche TEXT,
  status TEXT NOT NULL DEFAULT 'running',
  variant_a_template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
  variant_b_template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
  variant_a_name TEXT NOT NULL,
  variant_b_name TEXT NOT NULL,
  variant_a_content TEXT NOT NULL,
  variant_b_content TEXT NOT NULL,
  variant_a_sent INTEGER NOT NULL DEFAULT 0,
  variant_b_sent INTEGER NOT NULL DEFAULT 0,
  variant_a_responses INTEGER NOT NULL DEFAULT 0,
  variant_b_responses INTEGER NOT NULL DEFAULT 0,
  variant_a_conversions INTEGER NOT NULL DEFAULT 0,
  variant_b_conversions INTEGER NOT NULL DEFAULT 0,
  winner TEXT,
  confidence NUMERIC,
  min_sample_size INTEGER NOT NULL DEFAULT 50,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own AB tests" ON public.ab_tests
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
