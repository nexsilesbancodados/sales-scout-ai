export interface CapturedLead {
  id: string;
  business_name: string;
  phone: string;
  address?: string;
  rating?: number;
  reviews_count?: number;
  website?: string;
  niche: string;
  location: string;
  google_maps_url?: string;
  photo_url?: string;
  qualityScore?: number;
  isDuplicate?: boolean;
  lead_group?: string;
  service_opportunities?: string[];
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'duplicate';
}

export type ProcessStatus = 'idle' | 'capturing' | 'completed' | 'stopped';

export interface ProgressInfo {
  current: number;
  total: number;
  phase: string;
}

export const AVAILABLE_SERVICES = [
  { id: 'auto', label: 'IA Automática', description: 'IA analisa e oferece o serviço ideal' },
  { id: 'all', label: 'Todos os Serviços', description: 'Usar serviços do perfil' },
  { id: 'trafego_pago', label: 'Tráfego Pago', description: 'Anúncios e campanhas' },
  { id: 'automacao', label: 'Automação', description: 'Processos e sistemas' },
  { id: 'social_media', label: 'Social Media', description: 'Redes sociais' },
  { id: 'websites', label: 'Sites e Landing Pages', description: 'Criação de sites' },
  { id: 'seo', label: 'SEO', description: 'Otimização para buscadores' },
  { id: 'design', label: 'Design Gráfico', description: 'Identidade visual' },
  { id: 'consultoria', label: 'Consultoria', description: 'Consultoria em marketing' },
];

export const CAPTURE_FILTERS = [
  { id: 'all', label: 'Todos', description: 'Sem filtro', icon: '📋' },
  { id: 'no_website', label: 'Sem Site', description: 'Empresas sem website', icon: '🌐' },
  { id: 'low_rating', label: 'Avaliação Baixa', description: '< 4 estrelas', icon: '⭐' },
  { id: 'few_reviews', label: 'Poucos Reviews', description: '< 10 avaliações', icon: '💬' },
  { id: 'small_business', label: 'Pequenos Negócios', description: 'Microempresas', icon: '🏪' },
  { id: 'premium', label: 'Premium', description: 'Alta avaliação + reviews', icon: '👑' },
  { id: 'no_social', label: 'Sem Redes Sociais', description: 'Sem Instagram/Facebook', icon: '📱' },
  { id: 'new_business', label: 'Negócios Novos', description: 'Poucos reviews recentes', icon: '🆕' },
];

export const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevância', description: 'Padrão do Google' },
  { id: 'rating_desc', label: 'Melhor Avaliação', description: 'Maior rating primeiro' },
  { id: 'reviews_desc', label: 'Mais Reviews', description: 'Mais avaliações primeiro' },
  { id: 'quality_desc', label: 'Maior Qualidade', description: 'Score de qualidade' },
];
