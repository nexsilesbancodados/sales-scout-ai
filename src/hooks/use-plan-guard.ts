import { useSubscription } from '@/hooks/use-subscription';

type Feature =
  | 'whatsapp_chips'
  | 'sdr_agent'
  | 'api_access'
  | 'advanced_reports'
  | 'all_extractors'
  | 'multiple_funnels'
  | 'scheduled_prospecting'
  | 'ab_testing';

const PLAN_LIMITS: Record<string, {
  chips: number;
  features: Feature[];
}> = {
  free: {
    chips: 1,
    features: [],
  },
  starter: {
    chips: 1,
    features: ['scheduled_prospecting'],
  },
  pro: {
    chips: 3,
    features: ['sdr_agent', 'advanced_reports', 'all_extractors', 'scheduled_prospecting', 'ab_testing'],
  },
  enterprise: {
    chips: 10,
    features: ['sdr_agent', 'api_access', 'advanced_reports', 'all_extractors', 'multiple_funnels', 'scheduled_prospecting', 'ab_testing'],
  },
};

export function usePlanGuard() {
  const { currentPlan, isActive, isLoading } = useSubscription();

  const limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.free;

  const canUse = (feature: Feature): boolean => {
    if (!isActive && currentPlan !== 'free') return false;
    return limits.features.includes(feature);
  };

  const maxChips = limits.chips;

  const planName = currentPlan === 'free' ? 'Gratuito' : currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);

  return {
    currentPlan,
    planName,
    isActive,
    isLoading,
    canUse,
    maxChips,
    limits,
  };
}
