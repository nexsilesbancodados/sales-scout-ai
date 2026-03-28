import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export function useAdminRole() {
  const { user } = useAuth();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['admin-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');
      return (data && data.length > 0) || false;
    },
    enabled: !!user?.id,
  });

  return { isAdmin: !!isAdmin, isLoading };
}

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  whatsapp_connected: boolean;
  auto_prospecting: boolean;
  roles: string[];
}

interface AdminStats {
  total_users: number;
  connected_whatsapp: number;
  total_leads: number;
  total_messages: number;
}

export function useAdminUsers() {
  const queryClient = useQueryClient();

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        method: 'GET',
      });
      if (error) throw error;
      return (data?.users || []) as AdminUser[];
    },
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        method: 'GET',
        headers: { 'x-action': 'stats' },
      });
      if (error) throw error;
      return data as AdminStats;
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('admin-users?action=delete', {
        body: { user_id: userId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  return {
    users: users || [],
    stats,
    loadingUsers,
    loadingStats,
    deleteUser: deleteUser.mutate,
    isDeletingUser: deleteUser.isPending,
  };
}
