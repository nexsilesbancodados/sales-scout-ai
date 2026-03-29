import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  started_at: string | null;
  expires_at: string | null;
  canceled_at: string | null;
  cakto_product_id: string | null;
  cakto_subscription_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaymentEvent {
  id: string;
  event_type: string;
  amount: number;
  product_name: string | null;
  customer_email: string | null;
  created_at: string;
}

export function useSubscription() {
  const { user } = useAuth();

  const { data: subscription, isLoading, refetch } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return (data && data.length > 0 ? data[0] : null) as Subscription | null;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,
  });

  const { data: paymentHistory } = useQuery({
    queryKey: ['payment-events', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('payment_events')
        .select('id, event_type, amount, product_name, customer_email, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as PaymentEvent[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const currentPlan = subscription?.status === 'active' ? subscription.plan : 'free';
  const isActive = subscription?.status === 'active';
  const isPastDue = subscription?.status === 'past_due';

  return {
    subscription,
    paymentHistory: paymentHistory || [],
    currentPlan,
    isActive,
    isPastDue,
    isLoading,
    refetch,
  };
}
