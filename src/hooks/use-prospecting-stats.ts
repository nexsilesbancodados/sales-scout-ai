import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface ProspectingStats {
  id: string;
  user_id: string;
  niche: string;
  location: string | null;
  hour_of_day: number | null;
  day_of_week: number | null;
  messages_sent: number;
  responses_received: number;
  positive_responses: number;
  date: string;
  created_at: string;
}

export interface BestTimeSlot {
  hour: number;
  responseRate: number;
  messagesSent: number;
}

export interface NichePerformance {
  niche: string;
  totalSent: number;
  totalResponses: number;
  responseRate: number;
  positiveRate: number;
}

export function useProspectingStats() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['prospecting-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('prospecting_stats')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1000);

      if (error) throw error;
      return data as ProspectingStats[];
    },
    enabled: !!user?.id,
  });

  // Calculate best time slots based on response rates
  const getBestTimeSlots = (niche?: string): BestTimeSlot[] => {
    if (!stats) return [];

    const filteredStats = niche 
      ? stats.filter(s => s.niche === niche)
      : stats;

    const hourlyData: Record<number, { sent: number; responses: number }> = {};

    for (const stat of filteredStats) {
      if (stat.hour_of_day !== null) {
        if (!hourlyData[stat.hour_of_day]) {
          hourlyData[stat.hour_of_day] = { sent: 0, responses: 0 };
        }
        hourlyData[stat.hour_of_day].sent += stat.messages_sent;
        hourlyData[stat.hour_of_day].responses += stat.responses_received;
      }
    }

    return Object.entries(hourlyData)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        messagesSent: data.sent,
        responseRate: data.sent > 0 ? (data.responses / data.sent) * 100 : 0,
      }))
      .filter(slot => slot.messagesSent >= 5) // Minimum sample size
      .sort((a, b) => b.responseRate - a.responseRate);
  };

  // Calculate niche performance
  const getNichePerformance = (): NichePerformance[] => {
    if (!stats) return [];

    const nicheData: Record<string, { sent: number; responses: number; positive: number }> = {};

    for (const stat of stats) {
      if (!nicheData[stat.niche]) {
        nicheData[stat.niche] = { sent: 0, responses: 0, positive: 0 };
      }
      nicheData[stat.niche].sent += stat.messages_sent;
      nicheData[stat.niche].responses += stat.responses_received;
      nicheData[stat.niche].positive += stat.positive_responses;
    }

    return Object.entries(nicheData)
      .map(([niche, data]) => ({
        niche,
        totalSent: data.sent,
        totalResponses: data.responses,
        responseRate: data.sent > 0 ? (data.responses / data.sent) * 100 : 0,
        positiveRate: data.responses > 0 ? (data.positive / data.responses) * 100 : 0,
      }))
      .sort((a, b) => b.responseRate - a.responseRate);
  };

  // Record a stat entry
  const recordStat = useMutation({
    mutationFn: async (stat: Omit<ProspectingStats, 'id' | 'user_id' | 'created_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('prospecting_stats')
        .insert({ ...stat, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospecting-stats', user?.id] });
    },
  });

  // Get the best hour to contact for a specific niche
  const getBestHourForNiche = (niche: string): number | null => {
    const slots = getBestTimeSlots(niche);
    return slots.length > 0 ? slots[0].hour : null;
  };

  return {
    stats: stats || [],
    isLoading,
    getBestTimeSlots,
    getNichePerformance,
    getBestHourForNiche,
    recordStat: recordStat.mutate,
  };
}
