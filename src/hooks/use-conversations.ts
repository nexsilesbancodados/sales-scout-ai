import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface ChatMessageRaw {
  id: string;
  lead_id: string;
  sender_type: string;
  content: string;
  sent_at: string;
  status: string | null;
}

interface LeadRaw {
  id: string;
  business_name: string;
  phone: string;
  niche: string | null;
  location: string | null;
  stage: string;
  temperature: string | null;
  last_response_at: string | null;
  last_contact_at: string | null;
  created_at: string;
  conversation_summary: string | null;
  [key: string]: any;
}

export interface ConversationSummary {
  lead: LeadRaw;
  lastMessage: ChatMessageRaw | null;
  unreadCount: number;
  hasMessages: boolean;
}

export function useConversations(search?: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['conversations', search],
    queryFn: async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, get all leads that have messages
      let leadsQuery = supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('last_response_at', { ascending: false, nullsFirst: false });

      if (search) {
        leadsQuery = leadsQuery.or(`business_name.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      const { data: leads, error: leadsError } = await leadsQuery.limit(100);

      if (leadsError) throw leadsError;
      if (!leads || leads.length === 0) return [];

      // Get latest message for each lead
      const leadIds = leads.map(l => l.id);
      
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .in('lead_id', leadIds)
        .order('sent_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Group messages by lead and get stats
      const messagesByLead = new Map<string, ChatMessageRaw[]>();
      (messages || []).forEach(msg => {
        const existing = messagesByLead.get(msg.lead_id) || [];
        existing.push(msg);
        messagesByLead.set(msg.lead_id, existing);
      });

      // Build conversation summaries
      const conversations: ConversationSummary[] = leads
        .map(lead => {
          const leadMessages = messagesByLead.get(lead.id) || [];
          const lastMessage = leadMessages[0] || null;
          
          // Count unread (messages from lead that came after last user/agent message)
          let unreadCount = 0;
          let foundUserMessage = false;
          for (const msg of leadMessages) {
            if (msg.sender_type === 'user' || msg.sender_type === 'agent') {
              foundUserMessage = true;
              break;
            }
            if (msg.sender_type === 'lead') {
              unreadCount++;
            }
          }
          // If no user messages, all lead messages are unread
          if (!foundUserMessage) {
            unreadCount = leadMessages.filter(m => m.sender_type === 'lead').length;
          }

          return {
            lead,
            lastMessage,
            unreadCount,
            hasMessages: leadMessages.length > 0,
          };
        })
        // Sort: unread first, then by last message time
        .sort((a, b) => {
          // Leads with messages first
          if (a.hasMessages !== b.hasMessages) {
            return a.hasMessages ? -1 : 1;
          }
          // Then by unread count
          if (a.unreadCount !== b.unreadCount) {
            return b.unreadCount - a.unreadCount;
          }
          // Then by last message time
          const aTime = a.lastMessage?.sent_at || a.lead.last_response_at || a.lead.created_at;
          const bTime = b.lastMessage?.sent_at || b.lead.last_response_at || b.lead.created_at;
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });

      return conversations;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Subscribe to realtime updates for chat messages
  useEffect(() => {
    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          console.log('Conversation update:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    conversations: data || [],
    isLoading,
    error,
  };
}
