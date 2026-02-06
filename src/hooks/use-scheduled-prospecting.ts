import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export interface ScheduledProspecting {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  niches: string[];
  locations: string[];
  prospecting_type: string;
  schedule_days: number[];
  schedule_hour: number;
  max_leads_per_run: number;
  last_run_at: string | null;
  next_run_at: string | null;
  total_leads_captured: number;
  created_at: string;
  updated_at: string;
}

export function useScheduledProspecting() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['scheduled-prospecting', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('scheduled_prospecting')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ScheduledProspecting[];
    },
    enabled: !!user?.id,
  });

  const createSchedule = useMutation({
    mutationFn: async (schedule: Partial<ScheduledProspecting>) => {
      const { data, error } = await supabase.functions.invoke('scheduled-prospecting', {
        body: {
          action: 'create',
          data: schedule,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-prospecting'] });
      toast({
        title: 'Prospecção agendada criada!',
        description: 'A captura será executada automaticamente nos horários configurados.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar agendamento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleSchedule = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase.functions.invoke('scheduled-prospecting', {
        body: {
          action: 'toggle',
          data: { id, is_active },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-prospecting'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar agendamento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke('scheduled-prospecting', {
        body: {
          action: 'delete',
          data: { id },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-prospecting'] });
      toast({
        title: 'Agendamento excluído',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir agendamento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    schedules,
    isLoading,
    createSchedule,
    toggleSchedule,
    deleteSchedule,
  };
}
