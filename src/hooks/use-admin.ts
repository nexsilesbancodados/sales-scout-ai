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

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  whatsapp_connected: boolean;
  auto_prospecting: boolean;
  roles: string[];
  is_blocked: boolean;
}

interface AdminStats {
  total_users: number;
  connected_whatsapp: number;
  total_leads: number;
  total_messages: number;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_name: string | null;
  user_email: string | null;
  support_messages: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  content: string;
  sender_type: string;
  sender_id: string;
  created_at: string;
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

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: { user_id: userId },
        headers: { 'x-action': 'delete' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: { user_id: userId, reason },
        headers: { 'x-action': 'block' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const unblockUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: { user_id: userId },
        headers: { 'x-action': 'unblock' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async ({ userId, title, message }: { userId: string; title: string; message: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: { user_id: userId, title, message },
        headers: { 'x-action': 'send-notification' },
      });
      if (error) throw error;
      return data;
    },
  });

  return {
    users: users || [],
    stats,
    loadingUsers,
    loadingStats,
    deleteUser: deleteUserMutation.mutate,
    isDeletingUser: deleteUserMutation.isPending,
    blockUser: blockUserMutation.mutate,
    isBlockingUser: blockUserMutation.isPending,
    unblockUser: unblockUserMutation.mutate,
    isUnblockingUser: unblockUserMutation.isPending,
    sendNotification: sendNotificationMutation.mutate,
    isSendingNotification: sendNotificationMutation.isPending,
  };
}

export function useAdminSupport() {
  const queryClient = useQueryClient();

  const { data: tickets, isLoading: loadingTickets } = useQuery({
    queryKey: ['admin-support-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        method: 'GET',
        headers: { 'x-action': 'support-tickets' },
      });
      if (error) throw error;
      return (data?.tickets || []) as SupportTicket[];
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ ticketId, content }: { ticketId: string; content: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: { ticket_id: ticketId, content },
        headers: { 'x-action': 'reply-ticket' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
    },
  });

  const closeTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: { ticket_id: ticketId },
        headers: { 'x-action': 'close-ticket' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
    },
  });

  return {
    tickets: tickets || [],
    loadingTickets,
    replyToTicket: replyMutation.mutate,
    isReplying: replyMutation.isPending,
    closeTicket: closeTicketMutation.mutate,
    isClosingTicket: closeTicketMutation.isPending,
  };
}
