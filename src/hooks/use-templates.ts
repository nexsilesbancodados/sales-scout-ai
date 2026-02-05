import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export interface MessageTemplate {
  id: string;
  user_id: string;
  name: string;
  niche: string;
  content: string;
  variables: string[];
  usage_count: number;
  response_rate: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Default templates for each niche
export const DEFAULT_TEMPLATES: Record<string, { name: string; content: string; variables: string[] }[]> = {
  'Restaurantes': [
    {
      name: 'Apresentação Digital',
      content: 'Olá! Vi o {nome_empresa} no Google Maps e adorei as avaliações! 🍽️\n\nNotei que muitos clientes descobrem vocês pela internet. Trabalho ajudando restaurantes a aumentarem pedidos com cardápio digital e presença online otimizada.\n\nPosso mostrar como outros restaurantes da região aumentaram 40% nos pedidos?',
      variables: ['nome_empresa', 'localização'],
    },
    {
      name: 'Delivery & Pedidos',
      content: 'Oi! Tudo bem? Encontrei o {nome_empresa} buscando restaurantes em {localização}.\n\nTrabalho com soluções que ajudam restaurantes a receber mais pedidos sem depender só do iFood. Já pensaram em ter um sistema próprio de delivery?\n\nPosso explicar como funciona?',
      variables: ['nome_empresa', 'localização'],
    },
  ],
  'Clínicas': [
    {
      name: 'Agenda Online',
      content: 'Olá! Vi a {nome_empresa} e percebi que vocês têm ótimas avaliações! 🏥\n\nTrabalho com clínicas ajudando a organizar agendamentos online e reduzir faltas de pacientes.\n\nVocês já usam algum sistema de confirmação automática? Posso mostrar uma solução que reduz 60% das faltas.',
      variables: ['nome_empresa'],
    },
    {
      name: 'Marketing Médico',
      content: 'Oi! Encontrei a {nome_empresa} buscando clínicas em {localização}.\n\nAjudo clínicas a aparecerem melhor no Google e atrair mais pacientes da região. Muitos pacientes buscam "clínica perto de mim" - vocês aparecem nas primeiras posições?\n\nPosso fazer uma análise gratuita?',
      variables: ['nome_empresa', 'localização'],
    },
  ],
  'Academias': [
    {
      name: 'Retenção de Alunos',
      content: 'E aí! Vi a {nome_empresa} e curti o espaço! 💪\n\nTrabalho com academias ajudando a reduzir cancelamentos e manter alunos motivados com apps de treino personalizados.\n\nVocês têm algum sistema para acompanhar a evolução dos alunos? Posso mostrar como outras academias aumentaram 35% na retenção.',
      variables: ['nome_empresa'],
    },
  ],
  'Salões de Beleza': [
    {
      name: 'Agendamento Inteligente',
      content: 'Oi! Encontrei o {nome_empresa} e vi que tem ótimas avaliações! 💇‍♀️\n\nTrabalho com salões ajudando a organizar agendas e reduzir horários vagos. Vocês ainda recebem muitas marcações por WhatsApp?\n\nPosso mostrar como automatizar isso e ainda enviar lembretes automáticos pros clientes!',
      variables: ['nome_empresa'],
    },
  ],
  'Escritórios de Advocacia': [
    {
      name: 'Captação de Clientes',
      content: 'Olá, boa tarde! Vi o escritório {nome_empresa} em {localização}.\n\nTrabalho ajudando escritórios de advocacia a captarem mais clientes através de presença digital estratégica.\n\nVocês já recebem consultas pelo site ou redes sociais? Posso mostrar como outros escritórios triplicaram as consultas.',
      variables: ['nome_empresa', 'localização'],
    },
  ],
  'Imobiliárias': [
    {
      name: 'Leads Qualificados',
      content: 'Olá! Vi a {nome_empresa} e o portfólio de imóveis que vocês têm! 🏠\n\nTrabalho com imobiliárias ajudando a captar leads mais qualificados e automatizar o primeiro contato.\n\nVocês recebem muitos contatos que não viram negócio? Posso mostrar como filtrar melhor os interessados.',
      variables: ['nome_empresa'],
    },
  ],
  'Lojas de Roupas': [
    {
      name: 'E-commerce & Instagram',
      content: 'Oi! Adorei os produtos da {nome_empresa}! 👗\n\nTrabalho ajudando lojas a venderem mais pelo Instagram e WhatsApp com catálogo digital.\n\nVocês já vendem online ou só presencialmente? Posso mostrar como lojas da região triplicaram as vendas com estratégias digitais.',
      variables: ['nome_empresa'],
    },
  ],
  'Petshops': [
    {
      name: 'Fidelização Pet',
      content: 'Oi! Vi o {nome_empresa} e adorei! 🐾\n\nTrabalho com petshops ajudando a criar programas de fidelidade e lembretes automáticos de banho/vacinas.\n\nVocês já usam algum sistema para lembrar os tutores dos agendamentos? Posso mostrar uma solução simples!',
      variables: ['nome_empresa'],
    },
  ],
  'Oficinas Mecânicas': [
    {
      name: 'Gestão de Serviços',
      content: 'E aí! Vi a oficina {nome_empresa} em {localização}. 🔧\n\nTrabalho com oficinas ajudando a organizar orçamentos, ordens de serviço e lembretes de revisão para clientes.\n\nVocês ainda usam papel ou planilhas? Posso mostrar um sistema que facilita muito o dia a dia!',
      variables: ['nome_empresa', 'localização'],
    },
  ],
  'Dentistas': [
    {
      name: 'Captação de Pacientes',
      content: 'Olá! Vi o consultório {nome_empresa} e as avaliações positivas! 🦷\n\nTrabalho ajudando dentistas a captarem mais pacientes pela internet e reduzirem faltas.\n\nVocês já aparecem bem nas buscas locais? Posso fazer uma análise gratuita do posicionamento online.',
      variables: ['nome_empresa'],
    },
  ],
  'Psicólogos': [
    {
      name: 'Atendimento Online',
      content: 'Olá! Encontrei seu perfil profissional em {localização}. 🧠\n\nTrabalho ajudando psicólogos a organizarem agenda e expandirem para atendimento online.\n\nVocê já oferece sessões por vídeo? Posso mostrar plataformas seguras e conformes com o CFP.',
      variables: ['localização'],
    },
  ],
  'Contadores': [
    {
      name: 'Automação Contábil',
      content: 'Olá! Vi o escritório {nome_empresa} em {localização}.\n\nTrabalho ajudando contadores a automatizarem processos e melhorarem a comunicação com clientes.\n\nVocês ainda recebem muitos documentos por e-mail ou WhatsApp? Posso mostrar como organizar isso de forma profissional.',
      variables: ['nome_empresa', 'localização'],
    },
  ],
};

export function useTemplates(nicheFilter?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['templates', user?.id, nicheFilter],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      let query = supabase
        .from('message_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('response_rate', { ascending: false });

      if (nicheFilter) {
        query = query.eq('niche', nicheFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MessageTemplate[];
    },
    enabled: !!user?.id,
  });

  const createTemplate = useMutation({
    mutationFn: async (template: Omit<MessageTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'usage_count' | 'response_rate'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('message_templates')
        .insert({ ...template, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as MessageTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', user?.id] });
      toast({
        title: 'Template criado',
        description: 'O template foi salvo com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MessageTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('message_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as MessageTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', user?.id] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', user?.id] });
      toast({
        title: 'Template excluído',
        description: 'O template foi removido com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const initializeDefaultTemplates = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const templatesToCreate: any[] = [];

      for (const [niche, nicheTemplates] of Object.entries(DEFAULT_TEMPLATES)) {
        for (const template of nicheTemplates) {
          templatesToCreate.push({
            user_id: user.id,
            name: template.name,
            niche,
            content: template.content,
            variables: template.variables,
            is_default: true,
          });
        }
      }

      const { error } = await supabase
        .from('message_templates')
        .insert(templatesToCreate);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', user?.id] });
      toast({
        title: 'Templates inicializados',
        description: 'Os templates padrão foram criados com sucesso.',
      });
    },
  });

  return {
    templates: templates || [],
    isLoading,
    error,
    createTemplate: createTemplate.mutate,
    updateTemplate: updateTemplate.mutate,
    deleteTemplate: deleteTemplate.mutate,
    initializeDefaultTemplates: initializeDefaultTemplates.mutate,
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending,
  };
}

// Helper function to replace variables in template
export function applyTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}
