import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Meeting, MeetingStatus } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export function useMeetings(filters?: {
  status?: MeetingStatus;
  fromDate?: Date;
  toDate?: Date;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: meetings, isLoading, error } = useQuery({
    queryKey: ['meetings', user?.id, filters],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      let query = supabase
        .from('meetings')
        .select(`
          *,
          lead:leads(*)
        `)
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: true });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.fromDate) {
        query = query.gte('scheduled_at', filters.fromDate.toISOString());
      }
      if (filters?.toDate) {
        query = query.lte('scheduled_at', filters.toDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Meeting[];
    },
    enabled: !!user?.id,
  });

  // Subscribe to realtime updates for meetings
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('meetings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meetings',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Meeting realtime update:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['meetings', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const createMeeting = useMutation({
    mutationFn: async (meeting: Omit<Meeting, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('meetings')
        .insert({ ...meeting, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as Meeting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings', user?.id] });
      toast({
        title: 'Reunião agendada',
        description: 'A reunião foi agendada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao agendar reunião',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMeeting = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Meeting> & { id: string }) => {
      const { data, error } = await supabase
        .from('meetings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Meeting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings', user?.id] });
      toast({
        title: 'Reunião atualizada',
        description: 'A reunião foi atualizada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar reunião',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    meetings: meetings || [],
    isLoading,
    error,
    createMeeting: createMeeting.mutate,
    updateMeeting: updateMeeting.mutate,
    isCreating: createMeeting.isPending,
    isUpdating: updateMeeting.isPending,
  };
}
