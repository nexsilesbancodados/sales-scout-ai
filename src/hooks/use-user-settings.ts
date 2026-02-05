import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { UserSettings, PersonalityTrait } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

// Helper to safely parse arrays from JSON
function parseJsonArray<T>(data: Json | null, defaultValue: T[] = []): T[] {
  if (!data) return defaultValue;
  if (Array.isArray(data)) {
    return data as unknown as T[];
  }
  return defaultValue;
}

// Helper to convert UserSettings to database format
function toDbFormat(updates: Partial<UserSettings>): Record<string, unknown> {
  const dbUpdates: Record<string, unknown> = { ...updates };
  if (updates.message_variations !== undefined) {
    dbUpdates.message_variations = updates.message_variations as unknown as Json;
  }
  if (updates.personality_traits !== undefined) {
    dbUpdates.personality_traits = updates.personality_traits as unknown as Json;
  }
  return dbUpdates;
}

// Helper to convert database result to UserSettings
function fromDbFormat(data: Record<string, unknown>): UserSettings {
  return {
    ...data,
    message_variations: parseJsonArray(data.message_variations as Json),
    personality_traits: parseJsonArray<PersonalityTrait>(data.personality_traits as Json),
    // Ensure all new fields have defaults
    agent_type: (data.agent_type as string) || 'consultivo',
    communication_style: (data.communication_style as string) || 'formal',
    response_length: (data.response_length as string) || 'medio',
    emoji_usage: (data.emoji_usage as string) || 'moderado',
    objection_handling: (data.objection_handling as string) || 'suave',
    closing_style: (data.closing_style as string) || 'consultivo',
    follow_up_tone: (data.follow_up_tone as string) || 'amigavel',
    greeting_style: (data.greeting_style as string) || 'padrao',
    value_proposition_focus: (data.value_proposition_focus as string) || 'beneficios',
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
