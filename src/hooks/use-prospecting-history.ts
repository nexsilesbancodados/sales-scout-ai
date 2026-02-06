import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';

export interface ProspectingHistoryLead {
  id: string;
  business_name: string;
  phone: string;
  status: 'pending' | 'sent' | 'error' | 'duplicate' | 'saved';
  error_message?: string;
}

export interface ProspectingHistory {
  id: string;
  user_id: string;
  session_type: 'capture' | 'mass_send' | 'campaign' | 'import' | 'web_search';
  niche: string | null;
  location: string | null;
  total_found: number;
  total_saved: number;
  total_sent: number;
  total_errors: number;
  total_duplicates: number;
  total_pending: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  error_message: string | null;
  leads_data: ProspectingHistoryLead[];
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useProspectingHistory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: history, isLoading, refetch } = useQuery({
    queryKey: ['prospecting-history'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('prospecting_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        leads_data: (Array.isArray(item.leads_data) ? item.leads_data : []) as unknown as ProspectingHistoryLead[],
      })) as ProspectingHistory[];
    },
    enabled: !!user,
  });

  const createSession = useMutation({
    mutationFn: async ({
      session_type,
      niche,
      location,
    }: {
      session_type: ProspectingHistory['session_type'];
      niche?: string;
      location?: string;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('prospecting_history')
        .insert({
          user_id: user.id,
          session_type,
          niche,
          location,
          status: 'running',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospecting-history'] });
    },
  });

  const updateSession = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<ProspectingHistory> & { id: string }) => {
      const { data, error } = await supabase
        .from('prospecting_history')
        .update({
          ...updates,
          leads_data: updates.leads_data ? JSON.parse(JSON.stringify(updates.leads_data)) : undefined,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospecting-history'] });
    },
  });

  const deleteSession = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('prospecting_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospecting-history'] });
      toast({
        title: '✓ Histórico removido',
        description: 'O registro foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const clearAllHistory = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('prospecting_history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospecting-history'] });
      toast({
        title: '✓ Histórico limpo',
        description: 'Todo o histórico foi excluído.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao limpar histórico',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Helper to get session type label
  const getSessionTypeLabel = (type: ProspectingHistory['session_type']) => {
    const labels: Record<ProspectingHistory['session_type'], string> = {
      capture: 'Captura Maps',
      mass_send: 'Disparo em Massa',
      campaign: 'Campanha',
      import: 'Importação',
      web_search: 'Busca Web',
    };
    return labels[type];
  };

  // Helper to get status label
  const getStatusLabel = (status: ProspectingHistory['status']) => {
    const labels: Record<ProspectingHistory['status'], string> = {
      running: 'Em Andamento',
      completed: 'Concluído',
      failed: 'Falhou',
      cancelled: 'Cancelado',
    };
    return labels[status];
  };

  // Stats
  const totalSessions = history?.length || 0;
  const totalLeadsFound = history?.reduce((acc, h) => acc + h.total_found, 0) || 0;
  const totalLeadsSent = history?.reduce((acc, h) => acc + h.total_sent, 0) || 0;
  const totalErrors = history?.reduce((acc, h) => acc + h.total_errors, 0) || 0;

  return {
    history: history || [],
    isLoading,
    refetch,
    createSession: createSession.mutateAsync,
    updateSession: updateSession.mutateAsync,
    deleteSession: deleteSession.mutate,
    clearAllHistory: clearAllHistory.mutate,
    isCreating: createSession.isPending,
    getSessionTypeLabel,
    getStatusLabel,
    stats: {
      totalSessions,
      totalLeadsFound,
      totalLeadsSent,
      totalErrors,
    },
  };
}
