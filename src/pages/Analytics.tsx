import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics';
import { NichePerformanceAnalytics } from '@/components/analytics/NichePerformanceAnalytics';
import { Loader2 } from 'lucide-react';
import { useLeads } from '@/hooks/use-leads';
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Target } from 'lucide-react';

export default function AnalyticsPage() {
  const { isLoading: leadsLoading } = useLeads();
  const { isLoading: metricsLoading } = useDashboardMetrics();
  const [activeTab, setActiveTab] = useState('overview');

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="niches" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Análise de Nichos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdvancedAnalytics />
          </TabsContent>

          <TabsContent value="niches">
            <NichePerformanceAnalytics />
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
}
