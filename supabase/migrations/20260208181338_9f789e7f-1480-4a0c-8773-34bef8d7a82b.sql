-- Tabela de estados brasileiros
CREATE TABLE public.brazil_states (
  id SERIAL PRIMARY KEY,
  code CHAR(2) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  region TEXT NOT NULL
);

-- Tabela de cidades brasileiras
CREATE TABLE public.brazil_cities (
  id SERIAL PRIMARY KEY,
  state_code CHAR(2) NOT NULL REFERENCES public.brazil_states(code),
  name TEXT NOT NULL,
  ibge_code INTEGER,
  UNIQUE(state_code, name)
);

-- Tabela de faixas de CEP por região
CREATE TABLE public.brazil_cep_ranges (
  id SERIAL PRIMARY KEY,
  state_code CHAR(2) NOT NULL REFERENCES public.brazil_states(code),
  city_name TEXT,
  cep_start TEXT NOT NULL,
  cep_end TEXT NOT NULL,
  region_name TEXT
);

-- Tabela de histórico de buscas do usuário
CREATE TABLE public.search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  search_type TEXT NOT NULL DEFAULT 'niche',
  search_term TEXT NOT NULL,
  location TEXT,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de leads favoritos
CREATE TABLE public.favorite_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lead_id)
);

-- Índices para performance
CREATE INDEX idx_brazil_cities_state ON public.brazil_cities(state_code);
CREATE INDEX idx_brazil_cities_name ON public.brazil_cities(name);
CREATE INDEX idx_brazil_cep_ranges_state ON public.brazil_cep_ranges(state_code);
CREATE INDEX idx_search_history_user ON public.search_history(user_id);
CREATE INDEX idx_search_history_created ON public.search_history(created_at DESC);
CREATE INDEX idx_favorite_leads_user ON public.favorite_leads(user_id);

-- RLS para search_history
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own search history"
ON public.search_history
FOR ALL
USING (auth.uid() = user_id);

-- RLS para favorite_leads
ALTER TABLE public.favorite_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites"
ON public.favorite_leads
FOR ALL
USING (auth.uid() = user_id);

-- Tabelas de referência (estados e CEPs) são públicas para leitura
ALTER TABLE public.brazil_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read states"
ON public.brazil_states FOR SELECT USING (true);

ALTER TABLE public.brazil_cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cities"
ON public.brazil_cities FOR SELECT USING (true);

ALTER TABLE public.brazil_cep_ranges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read CEP ranges"
ON public.brazil_cep_ranges FOR SELECT USING (true);

-- Inserir todos os estados brasileiros
INSERT INTO public.brazil_states (code, name, region) VALUES
('AC', 'Acre', 'Norte'),
('AL', 'Alagoas', 'Nordeste'),
('AP', 'Amapá', 'Norte'),
('AM', 'Amazonas', 'Norte'),
('BA', 'Bahia', 'Nordeste'),
('CE', 'Ceará', 'Nordeste'),
('DF', 'Distrito Federal', 'Centro-Oeste'),
('ES', 'Espírito Santo', 'Sudeste'),
('GO', 'Goiás', 'Centro-Oeste'),
('MA', 'Maranhão', 'Nordeste'),
('MT', 'Mato Grosso', 'Centro-Oeste'),
('MS', 'Mato Grosso do Sul', 'Centro-Oeste'),
('MG', 'Minas Gerais', 'Sudeste'),
('PA', 'Pará', 'Norte'),
('PB', 'Paraíba', 'Nordeste'),
('PR', 'Paraná', 'Sul'),
('PE', 'Pernambuco', 'Nordeste'),
('PI', 'Piauí', 'Nordeste'),
('RJ', 'Rio de Janeiro', 'Sudeste'),
('RN', 'Rio Grande do Norte', 'Nordeste'),
('RS', 'Rio Grande do Sul', 'Sul'),
('RO', 'Rondônia', 'Norte'),
('RR', 'Roraima', 'Norte'),
('SC', 'Santa Catarina', 'Sul'),
('SP', 'São Paulo', 'Sudeste'),
('SE', 'Sergipe', 'Nordeste'),
('TO', 'Tocantins', 'Norte');

-- Inserir faixas de CEP por estado
INSERT INTO public.brazil_cep_ranges (state_code, cep_start, cep_end, region_name) VALUES
('SP', '01000-000', '19999-999', 'São Paulo'),
('RJ', '20000-000', '28999-999', 'Rio de Janeiro'),
('ES', '29000-000', '29999-999', 'Espírito Santo'),
('MG', '30000-000', '39999-999', 'Minas Gerais'),
('BA', '40000-000', '48999-999', 'Bahia'),
('SE', '49000-000', '49999-999', 'Sergipe'),
('PE', '50000-000', '56999-999', 'Pernambuco'),
('AL', '57000-000', '57999-999', 'Alagoas'),
('PB', '58000-000', '58999-999', 'Paraíba'),
('RN', '59000-000', '59999-999', 'Rio Grande do Norte'),
('CE', '60000-000', '63999-999', 'Ceará'),
('PI', '64000-000', '64999-999', 'Piauí'),
('MA', '65000-000', '65999-999', 'Maranhão'),
('PA', '66000-000', '68899-999', 'Pará'),
('AP', '68900-000', '68999-999', 'Amapá'),
('AM', '69000-000', '69299-999', 'Amazonas'),
('RR', '69300-000', '69399-999', 'Roraima'),
('AM', '69400-000', '69899-999', 'Amazonas Interior'),
('AC', '69900-000', '69999-999', 'Acre'),
('DF', '70000-000', '72799-999', 'Distrito Federal'),
('GO', '72800-000', '76799-999', 'Goiás'),
('TO', '77000-000', '77999-999', 'Tocantins'),
('MT', '78000-000', '78899-999', 'Mato Grosso'),
('RO', '78900-000', '78999-999', 'Rondônia'),
('MS', '79000-000', '79999-999', 'Mato Grosso do Sul'),
('PR', '80000-000', '87999-999', 'Paraná'),
('SC', '88000-000', '89999-999', 'Santa Catarina'),
('RS', '90000-000', '99999-999', 'Rio Grande do Sul');