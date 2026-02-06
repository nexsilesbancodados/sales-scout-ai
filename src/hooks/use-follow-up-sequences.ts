import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export interface FollowUpSequence {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  trigger_type: 'no_response' | 'new_lead' | 'stage_change';
  trigger_after_days: number[];
  message_templates: {
    day: number;
    template_id?: string;
    message: string;
  }[];
  created_at: string;
  updated_at: string;
}

export function useFollowUpSequences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sequences, isLoading } = useQuery({
    queryKey: ['follow-up-sequences', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('follow_up_sequences')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FollowUpSequence[];
    },
    enabled: !!user?.id,
  });

  const createSequence = useMutation({
    mutationFn: async (sequence: Partial<FollowUpSequence>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('follow_up_sequences')
        .insert({
          user_id: user.id,
          name: sequence.name,
          description: sequence.description,
          trigger_type: sequence.trigger_type || 'no_response',
          trigger_after_days: sequence.trigger_after_days || [1, 3, 5, 7, 14],
          message_templates: sequence.message_templates || [],
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-up-sequences'] });
      toast({
        title: 'Sequência criada!',
        description: 'A sequência de follow-up foi criada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar sequência',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateSequence = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FollowUpSequence> & { id: string }) => {
      const { data, error } = await supabase
        .from('follow_up_sequences')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-up-sequences'] });
      toast({
        title: 'Sequência atualizada!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar sequência',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteSequence = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('follow_up_sequences')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-up-sequences'] });
      toast({
        title: 'Sequência excluída',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir sequência',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleSequence = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('follow_up_sequences')
        .update({ is_active })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-up-sequences'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar sequência',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    sequences,
    isLoading,
    createSequence,
    updateSequence,
    deleteSequence,
    toggleSequence,
  };
}
