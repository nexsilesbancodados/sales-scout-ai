import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const { permission, notifyLeadResponse, notifyFollowUpDue, notifyJobComplete } = usePushNotifications();
  const { toast } = useToast();

  const handleNewMessage = useCallback((payload: any) => {
    const message = payload.new;
    
    // Only notify for lead messages (incoming)
    if (message.sender_type === 'lead') {
      // Get lead info
      supabase
        .from('leads')
        .select('business_name')
        .eq('id', message.lead_id)
        .single()
        .then(({ data: lead }) => {
          if (lead) {
            // Show toast
            toast({
              title: '💬 Nova resposta!',
              description: `${lead.business_name} respondeu sua mensagem`,
            });
            
            // Send push notification if permission granted
            if (permission === 'granted') {
              notifyLeadResponse(lead.business_name, message.lead_id);
            }
          }
        });
    }
  }, [permission, notifyLeadResponse, toast]);

  const handleActivityLog = useCallback((payload: any) => {
    const activity = payload.new;
    
    if (activity.activity_type === 'followup_due') {
      toast({
        title: '⏰ Follow-up pendente',
        description: activity.description,
      });
      
      if (permission === 'granted' && activity.lead_id) {
        notifyFollowUpDue(activity.description, activity.lead_id);
      }
    }
    
    if (activity.activity_type === 'job_complete') {
      toast({
        title: '✓ Tarefa concluída',
        description: activity.description,
      });
      
      if (permission === 'granted') {
        notifyJobComplete(activity.activity_type, { 
          processed: activity.metadata?.processed || 0, 
          failed: activity.metadata?.failed || 0 
        });
      }
    }
  }, [permission, notifyFollowUpDue, notifyJobComplete, toast]);

  const handleLeadUpdate = useCallback((payload: any) => {
    const lead = payload.new;
    const oldLead = payload.old;
    
    // Notify when a lead becomes "hot"
    if (lead.temperature === 'quente' && oldLead.temperature !== 'quente') {
      toast({
        title: '🔥 Lead quente!',
        description: `${lead.business_name} está demonstrando alto interesse`,
      });
    }
    
    // Notify when a sale is won
    if (lead.stage === 'Ganho' && oldLead.stage !== 'Ganho') {
      toast({
        title: '🎉 Venda fechada!',
        description: `Parabéns! ${lead.business_name} foi convertido!`,
      });
    }
  }, [toast]);

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to chat messages
    const messagesChannel = supabase
      .channel('chat-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        handleNewMessage
      )
      .subscribe();

    // Subscribe to activity log
    const activityChannel = supabase
      .channel('activity-log-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log',
          filter: `user_id=eq.${user.id}`,
        },
        handleActivityLog
      )
      .subscribe();

    // Subscribe to lead updates
    const leadsChannel = supabase
      .channel(`leads-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads',
          filter: `user_id=eq.${user.id}`,
        },
        handleLeadUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(activityChannel);
      supabase.removeChannel(leadsChannel);
    };
  }, [user?.id, handleNewMessage, handleActivityLog, handleLeadUpdate]);

  return null;
}
