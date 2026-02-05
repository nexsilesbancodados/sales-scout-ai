import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { DashboardMetrics, LeadStage } from '@/types/database';

export function useDashboardMetrics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-metrics', user?.id],
    queryFn: async (): Promise<DashboardMetrics> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get all leads
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id, stage, temperature, created_at')
        .eq('user_id', user.id);

      if (leadsError) throw leadsError;

      // Get meetings
      const { data: meetings, error: meetingsError } = await supabase
        .from('meetings')
        .select('id, scheduled_at, status')
        .eq('user_id', user.id);

      if (meetingsError) throw meetingsError;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());

      // Calculate metrics
      const totalLeads = leads?.length || 0;
      const leadsThisMonth = leads?.filter(l => new Date(l.created_at) >= startOfMonth).length || 0;
      
      const scheduledMeetings = meetings?.filter(m => m.status === 'scheduled') || [];
      const meetingsScheduled = scheduledMeetings.length;
      const meetingsThisWeek = scheduledMeetings.filter(m => new Date(m.scheduled_at) >= startOfWeek).length;

      const wonLeads = leads?.filter(l => l.stage === 'Ganho').length || 0;
      const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

      const hotLeads = leads?.filter(l => l.temperature === 'quente').length || 0;
      const warmLeads = leads?.filter(l => l.temperature === 'morno').length || 0;
      const coldLeads = leads?.filter(l => l.temperature === 'frio').length || 0;

      const stages: LeadStage[] = ['Contato', 'Qualificado', 'Proposta', 'Negociação', 'Ganho', 'Perdido'];
      const leadsByStage = stages.reduce((acc, stage) => {
        acc[stage] = leads?.filter(l => l.stage === stage).length || 0;
        return acc;
      }, {} as Record<LeadStage, number>);

      return {
        totalLeads,
        leadsThisMonth,
        meetingsScheduled,
        meetingsThisWeek,
        conversionRate,
        hotLeads,
        warmLeads,
        coldLeads,
        leadsByStage,
      };
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Refetch every minute
  });
}
