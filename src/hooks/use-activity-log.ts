import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { ActivityLog } from '@/types/database';

export function useActivityLog(limit: number = 20) {
  const { user } = useAuth();

  const { data: activities, isLoading, error, refetch } = useQuery({
    queryKey: ['activity-log', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          *,
          lead:leads(id, business_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as ActivityLog[];
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    activities: activities || [],
    isLoading,
    error,
    refetch,
  };
}
