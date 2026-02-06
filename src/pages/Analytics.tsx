import { DashboardLayout } from '@/components/DashboardLayout';
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics';
import { Loader2 } from 'lucide-react';
import { useLeads } from '@/hooks/use-leads';
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics';

export default function AnalyticsPage() {
  const { isLoading: leadsLoading } = useLeads();
  const { isLoading: metricsLoading } = useDashboardMetrics();

  const isLoading = leadsLoading || metricsLoading;

  return (
    <DashboardLayout
      title="Análise Avançada"
      description="Métricas detalhadas, gráficos e insights sobre sua prospecção"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <AdvancedAnalytics />
      )}
    </DashboardLayout>
  );
}
