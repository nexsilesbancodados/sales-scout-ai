import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed';
export type CampaignType = 'automatic' | 'manual';

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  status: CampaignStatus;
  campaign_type: CampaignType;
  niches: string[];
  locations: string[];
  message_template: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  leads_found: number;
  leads_contacted: number;
  leads_responded: number;
  created_at: string;
  updated_at: string;
}

export function useCampaigns() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['campaigns', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!user?.id,
  });

  const createCampaign = useMutation({
    mutationFn: async (campaign: Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'leads_found' | 'leads_contacted' | 'leads_responded'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('campaigns')
        .insert({ ...campaign, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as Campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', user?.id] });
      toast({
        title: 'Campanha criada',
        description: 'A campanha foi criada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar campanha',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Campaign> & { id: string }) => {
      const { data, error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', user?.id] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar campanha',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', user?.id] });
      toast({
        title: 'Campanha excluída',
        description: 'A campanha foi removida com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir campanha',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    campaigns: campaigns || [],
    isLoading,
    error,
    createCampaign: createCampaign.mutate,
    updateCampaign: updateCampaign.mutate,
    deleteCampaign: deleteCampaign.mutate,
    isCreating: createCampaign.isPending,
    isUpdating: updateCampaign.isPending,
    isDeleting: deleteCampaign.isPending,
  };
}
