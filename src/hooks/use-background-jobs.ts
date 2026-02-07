import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';

export interface BackgroundJob {
  id: string;
  user_id: string;
  job_type: 'mass_send' | 'campaign' | 'follow_up' | 'prospecting' | 'import';
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  priority: number;
  payload: any;
  total_items: number;
  processed_items: number;
  failed_items: number;
  current_index: number;
  result: any;
  error_message: string | null;
  retry_count: number;
  max_retries: number;
  scheduled_at: string;
  started_at: string | null;
  completed_at: string | null;
  last_heartbeat_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useBackgroundJobs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['background-jobs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('background_jobs')
        .select('*')
        .eq('user_id', user.id) // CRITICAL: Filter by user_id to prevent data leakage
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as BackgroundJob[];
    },
    enabled: !!user?.id,
    refetchInterval: 5000, // Poll every 5 seconds for active jobs
  });

  const createJob = useMutation({
    mutationFn: async ({
      job_type,
      payload,
      total_items,
      priority = 5,
    }: {
      job_type: BackgroundJob['job_type'];
      payload: any;
      total_items: number;
      priority?: number;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.functions.invoke('job-processor', {
        body: {
          action: 'create',
          user_id: user.id,
          job_type,
          payload,
          total_items,
          priority,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['background-jobs', user?.id] });
      toast({
        title: '✓ Tarefa iniciada',
        description: 'A tarefa está sendo processada em segundo plano.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar tarefa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const pauseJob = useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase.functions.invoke('job-processor', {
        body: { action: 'pause', job_id: jobId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['background-jobs', user?.id] });
      toast({
        title: '⏸️ Tarefa pausada',
        description: 'A tarefa foi pausada e pode ser retomada depois.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao pausar tarefa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resumeJob = useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase.functions.invoke('job-processor', {
        body: { action: 'resume', job_id: jobId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['background-jobs', user?.id] });
      toast({
        title: '▶️ Tarefa retomada',
        description: 'A tarefa continuará de onde parou.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao retomar tarefa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const cancelJob = useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase.functions.invoke('job-processor', {
        body: { action: 'cancel', job_id: jobId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['background-jobs', user?.id] });
      toast({
        title: '❌ Tarefa cancelada',
        description: 'A tarefa foi cancelada.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao cancelar tarefa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Helper to get active jobs
  const activeJobs = jobs?.filter(
    (j) => j.status === 'running' || j.status === 'pending'
  ) || [];

  // Helper to get job progress percentage
  const getJobProgress = (job: BackgroundJob) => {
    if (job.total_items === 0) return 0;
    return Math.round((job.processed_items / job.total_items) * 100);
  };

  // Helper to get job status label
  const getJobStatusLabel = (status: BackgroundJob['status']) => {
    const labels: Record<BackgroundJob['status'], string> = {
      pending: 'Aguardando',
      running: 'Executando',
      paused: 'Pausado',
      completed: 'Concluído',
      failed: 'Falhou',
      cancelled: 'Cancelado',
    };
    return labels[status];
  };

  // Helper to get job type label
  const getJobTypeLabel = (type: BackgroundJob['job_type']) => {
    const labels: Record<BackgroundJob['job_type'], string> = {
      mass_send: 'Envio em Massa',
      campaign: 'Campanha',
      follow_up: 'Follow-up',
      prospecting: 'Prospecção',
      import: 'Importação',
    };
    return labels[type];
  };

  return {
    jobs: jobs || [],
    activeJobs,
    isLoading,
    refetch,
    createJob: createJob.mutate,
    pauseJob: pauseJob.mutate,
    resumeJob: resumeJob.mutate,
    cancelJob: cancelJob.mutate,
    isCreating: createJob.isPending,
    getJobProgress,
    getJobStatusLabel,
    getJobTypeLabel,
  };
}
