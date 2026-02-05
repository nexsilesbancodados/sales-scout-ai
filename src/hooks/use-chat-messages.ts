import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, MessageSenderType } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useChatMessages(leadId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['chat-messages', leadId],
    queryFn: async () => {
      if (!leadId) throw new Error('Lead ID required');

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('lead_id', leadId)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!leadId,
  });

  const sendMessage = useMutation({
    mutationFn: async ({ content, senderType }: { content: string; senderType: MessageSenderType }) => {
      if (!leadId) throw new Error('Lead ID required');

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          lead_id: leadId,
          content,
          sender_type: senderType,
          status: 'sent',
        })
        .select()
        .single();

      if (error) throw error;
      return data as ChatMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', leadId] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao enviar mensagem',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    messages: messages || [],
    isLoading,
    error,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending,
  };
}
