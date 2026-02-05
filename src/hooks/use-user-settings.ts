import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { UserSettings, MessageVariation } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

// Helper to safely parse message variations from JSON
function parseMessageVariations(data: Json | null): MessageVariation[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data as unknown as MessageVariation[];
  }
  return [];
}

// Helper to convert UserSettings to database format
function toDbFormat(updates: Partial<UserSettings>): Record<string, unknown> {
  const dbUpdates: Record<string, unknown> = { ...updates };
  if (updates.message_variations) {
    dbUpdates.message_variations = updates.message_variations as unknown as Json;
  }
  return dbUpdates;
}

// Helper to convert database result to UserSettings
function fromDbFormat(data: Record<string, unknown>): UserSettings {
  return {
    ...data,
    message_variations: parseMessageVariations(data.message_variations as Json),
  } as UserSettings;
}

export function useUserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return fromDbFormat(data as unknown as Record<string, unknown>);
    },
    enabled: !!user?.id,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_settings')
        .update(toDbFormat(updates))
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return fromDbFormat(data as unknown as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings', user?.id] });
      toast({
        title: 'Configurações salvas',
        description: 'Suas configurações foram atualizadas com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
}
