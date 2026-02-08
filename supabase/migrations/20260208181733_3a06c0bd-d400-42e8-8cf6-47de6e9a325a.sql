-- Inserir as principais cidades de cada estado brasileiro
INSERT INTO public.brazil_cities (state_code, name) VALUES
-- São Paulo
('SP', 'São Paulo'),
('SP', 'Campinas'),
('SP', 'Guarulhos'),
('SP', 'São Bernardo do Campo'),
('SP', 'Santo André'),
('SP', 'Osasco'),
('SP', 'Sorocaba'),
('SP', 'Ribeirão Preto'),
('SP', 'São José dos Campos'),
('SP', 'Santos'),
('SP', 'Piracicaba'),
('SP', 'Jundiaí'),
('SP', 'Barueri'),
('SP', 'Mauá'),
('SP', 'Diadema'),
('SP', 'Carapicuíba'),
('SP', 'Franca'),
('SP', 'Itaquaquecetuba'),
('SP', 'Mogi das Cruzes'),
('SP', 'Taboão da Serra'),
('SP', 'São José do Rio Preto'),
('SP', 'Bauru'),
('SP', 'Limeira'),
('SP', 'Suzano'),
('SP', 'Americana'),

-- Rio de Janeiro
('RJ', 'Rio de Janeiro'),
('RJ', 'São Gonçalo'),
('RJ', 'Duque de Caxias'),
('RJ', 'Nova Iguaçu'),
('RJ', 'Niterói'),
('RJ', 'Campos dos Goytacazes'),
('RJ', 'Belford Roxo'),
('RJ', 'São João de Meriti'),
('RJ', 'Petrópolis'),
('RJ', 'Volta Redonda'),
('RJ', 'Macaé'),
('RJ', 'Angra dos Reis'),
('RJ', 'Cabo Frio'),
('RJ', 'Nova Friburgo'),
('RJ', 'Teresópolis'),

-- Minas Gerais
('MG', 'Belo Horizonte'),
('MG', 'Uberlândia'),
('MG', 'Contagem'),
('MG', 'Juiz de Fora'),
('MG', 'Betim'),
('MG', 'Montes Claros'),
('MG', 'Ribeirão das Neves'),
('MG', 'Uberaba'),
('MG', 'Governador Valadares'),
('MG', 'Ipatinga'),
('MG', 'Sete Lagoas'),
('MG', 'Divinópolis'),
('MG', 'Poços de Caldas'),
('MG', 'Patos de Minas'),
('MG', 'Barbacena'),

-- Bahia
('BA', 'Salvador'),
('BA', 'Feira de Santana'),
('BA', 'Vitória da Conquista'),
('BA', 'Camaçari'),
('BA', 'Itabuna'),
('BA', 'Juazeiro'),
('BA', 'Lauro de Freitas'),
('BA', 'Ilhéus'),
('BA', 'Jequié'),
('BA', 'Teixeira de Freitas'),
('BA', 'Porto Seguro'),

-- Rio Grande do Sul
('RS', 'Porto Alegre'),
('RS', 'Caxias do Sul'),
('RS', 'Pelotas'),
('RS', 'Canoas'),
('RS', 'Santa Maria'),
('RS', 'Gravataí'),
('RS', 'Viamão'),
('RS', 'Novo Hamburgo'),
('RS', 'São Leopoldo'),
('RS', 'Rio Grande'),
('RS', 'Passo Fundo'),
('RS', 'Sapucaia do Sul'),

-- Paraná
('PR', 'Curitiba'),
('PR', 'Londrina'),
('PR', 'Maringá'),
('PR', 'Ponta Grossa'),
('PR', 'Cascavel'),
('PR', 'São José dos Pinhais'),
('PR', 'Foz do Iguaçu'),
('PR', 'Colombo'),
('PR', 'Guarapuava'),
('PR', 'Paranaguá'),
('PR', 'Toledo'),

-- Pernambuco
('PE', 'Recife'),
('PE', 'Jaboatão dos Guararapes'),
('PE', 'Olinda'),
('PE', 'Caruaru'),
('PE', 'Petrolina'),
('PE', 'Paulista'),
('PE', 'Cabo de Santo Agostinho'),
('PE', 'Camaragibe'),
('PE', 'Vitória de Santo Antão'),
('PE', 'Garanhuns'),

-- Ceará
('CE', 'Fortaleza'),
('CE', 'Caucaia'),
('CE', 'Juazeiro do Norte'),
('CE', 'Maracanaú'),
('CE', 'Sobral'),
('CE', 'Crato'),
('CE', 'Itapipoca'),
('CE', 'Maranguape'),
('CE', 'Iguatu'),
('CE', 'Quixadá'),

-- Pará
('PA', 'Belém'),
('PA', 'Ananindeua'),
('PA', 'Santarém'),
('PA', 'Marabá'),
('PA', 'Parauapebas'),
('PA', 'Castanhal'),
('PA', 'Abaetetuba'),
('PA', 'Altamira'),
('PA', 'Bragança'),
('PA', 'Tucuruí'),

-- Maranhão
('MA', 'São Luís'),
('MA', 'Imperatriz'),
('MA', 'São José de Ribamar'),
('MA', 'Timon'),
('MA', 'Caxias'),
('MA', 'Codó'),
('MA', 'Paço do Lumiar'),
('MA', 'Açailândia'),
('MA', 'Bacabal'),
('MA', 'Balsas'),

-- Goiás
('GO', 'Goiânia'),
('GO', 'Aparecida de Goiânia'),
('GO', 'Anápolis'),
('GO', 'Rio Verde'),
('GO', 'Luziânia'),
('GO', 'Águas Lindas de Goiás'),
('GO', 'Valparaíso de Goiás'),
('GO', 'Trindade'),
('GO', 'Formosa'),
('GO', 'Novo Gama'),

-- Santa Catarina
('SC', 'Joinville'),
('SC', 'Florianópolis'),
('SC', 'Blumenau'),
('SC', 'São José'),
('SC', 'Itajaí'),
('SC', 'Criciúma'),
('SC', 'Chapecó'),
('SC', 'Jaraguá do Sul'),
('SC', 'Lages'),
('SC', 'Palhoça'),

-- Amazonas
('AM', 'Manaus'),
('AM', 'Parintins'),
('AM', 'Itacoatiara'),
('AM', 'Manacapuru'),
('AM', 'Coari'),
('AM', 'Tefé'),
('AM', 'Tabatinga'),

-- Paraíba
('PB', 'João Pessoa'),
('PB', 'Campina Grande'),
('PB', 'Santa Rita'),
('PB', 'Patos'),
('PB', 'Bayeux'),
('PB', 'Cabedelo'),
('PB', 'Cajazeiras'),

-- Rio Grande do Norte
('RN', 'Natal'),
('RN', 'Mossoró'),
('RN', 'Parnamirim'),
('RN', 'São Gonçalo do Amarante'),
('RN', 'Macaíba'),
('RN', 'Ceará-Mirim'),
('RN', 'Caicó'),

-- Espírito Santo
('ES', 'Vitória'),
('ES', 'Serra'),
('ES', 'Vila Velha'),
('ES', 'Cariacica'),
('ES', 'Cachoeiro de Itapemirim'),
('ES', 'Linhares'),
('ES', 'Colatina'),

-- Alagoas
('AL', 'Maceió'),
('AL', 'Arapiraca'),
('AL', 'Rio Largo'),
('AL', 'Palmeira dos Índios'),
('AL', 'União dos Palmares'),
('AL', 'Penedo'),

-- Piauí
('PI', 'Teresina'),
('PI', 'Parnaíba'),
('PI', 'Picos'),
('PI', 'Piripiri'),
('PI', 'Floriano'),
('PI', 'Campo Maior'),

-- Distrito Federal
('DF', 'Brasília'),

-- Mato Grosso
('MT', 'Cuiabá'),
('MT', 'Várzea Grande'),
('MT', 'Rondonópolis'),
('MT', 'Sinop'),
('MT', 'Tangará da Serra'),
('MT', 'Sorriso'),

-- Mato Grosso do Sul
('MS', 'Campo Grande'),
('MS', 'Dourados'),
('MS', 'Três Lagoas'),
('MS', 'Corumbá'),
('MS', 'Ponta Porã'),
('MS', 'Naviraí'),

-- Sergipe
('SE', 'Aracaju'),
('SE', 'Nossa Senhora do Socorro'),
('SE', 'Lagarto'),
('SE', 'Itabaiana'),
('SE', 'São Cristóvão'),
('SE', 'Estância'),

-- Rondônia
('RO', 'Porto Velho'),
('RO', 'Ji-Paraná'),
('RO', 'Ariquemes'),
('RO', 'Vilhena'),
('RO', 'Cacoal'),

-- Tocantins
('TO', 'Palmas'),
('TO', 'Araguaína'),
('TO', 'Gurupi'),
('TO', 'Porto Nacional'),
('TO', 'Paraíso do Tocantins'),

-- Acre
('AC', 'Rio Branco'),
('AC', 'Cruzeiro do Sul'),
('AC', 'Sena Madureira'),
('AC', 'Tarauacá'),

-- Amapá
('AP', 'Macapá'),
('AP', 'Santana'),
('AP', 'Laranjal do Jari'),
('AP', 'Oiapoque'),

-- Roraima
('RR', 'Boa Vista'),
('RR', 'Rorainópolis'),
('RR', 'Caracaraí')

ON CONFLICT (state_code, name) DO NOTHING;