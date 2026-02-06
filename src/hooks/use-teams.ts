import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  invited_by: string | null;
  joined_at: string;
  created_at: string;
  profile?: {
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface TeamInvite {
  id: string;
  team_id: string;
  email: string;
  role: 'admin' | 'member';
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at: string;
  created_at: string;
}

export function useTeams() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Team[];
    },
    enabled: !!user,
  });

  const createTeam = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Create the team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({ name, owner_id: user.id })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add the creator as owner member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      return team as Team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast({
        title: '✓ Equipe criada',
        description: 'Sua equipe foi criada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar equipe',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteTeam = useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast({
        title: '✓ Equipe excluída',
        description: 'A equipe foi excluída com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir equipe',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    teams: teams || [],
    teamsLoading,
    createTeam: createTeam.mutate,
    deleteTeam: deleteTeam.mutate,
    isCreating: createTeam.isPending,
    isDeleting: deleteTeam.isPending,
  };
}

export function useTeamMembers(teamId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      if (!teamId) return [];

      // Get team members
      const { data: teamMembers, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get profiles for each member
      const userIds = teamMembers.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return teamMembers.map(member => ({
        ...member,
        role: member.role as 'owner' | 'admin' | 'member',
        profile: profileMap.get(member.user_id) || undefined,
      })) as TeamMember[];
    },
    enabled: !!teamId,
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
      toast({
        title: '✓ Membro removido',
        description: 'O membro foi removido da equipe.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover membro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMemberRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: 'admin' | 'member' }) => {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
      toast({
        title: '✓ Cargo atualizado',
        description: 'O cargo do membro foi atualizado.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar cargo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    members: members || [],
    isLoading,
    removeMember: removeMember.mutate,
    updateMemberRole: updateMemberRole.mutate,
  };
}

export function useTeamInvites(teamId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: invites, isLoading } = useQuery({
    queryKey: ['team-invites', teamId],
    queryFn: async () => {
      if (!teamId) return [];

      const { data, error } = await supabase
        .from('team_invites')
        .select('*')
        .eq('team_id', teamId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TeamInvite[];
    },
    enabled: !!teamId,
  });

  const sendInvite = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: 'admin' | 'member' }) => {
      if (!teamId || !user) throw new Error('Dados inválidos');

      const { data, error } = await supabase
        .from('team_invites')
        .insert({
          team_id: teamId,
          email,
          role,
          invited_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as TeamInvite;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invites', teamId] });
      toast({
        title: '✓ Convite enviado',
        description: 'O convite foi enviado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao enviar convite',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const cancelInvite = useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase
        .from('team_invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invites', teamId] });
      toast({
        title: '✓ Convite cancelado',
        description: 'O convite foi cancelado.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao cancelar convite',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    invites: invites || [],
    isLoading,
    sendInvite: sendInvite.mutate,
    cancelInvite: cancelInvite.mutate,
    isSending: sendInvite.isPending,
  };
}
