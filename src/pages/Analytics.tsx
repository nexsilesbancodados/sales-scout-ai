import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics';
import { NichePerformanceAnalytics } from '@/components/analytics/NichePerformanceAnalytics';
import { LeadScoring } from '@/components/analytics/LeadScoring';
import { Loader2, BarChart3, Target, Trophy } from 'lucide-react';
import { useLeads } from '@/hooks/use-leads';
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AnalyticsPage() {
  const { isLoading: leadsLoading } = useLeads();
  const { isLoading: metricsLoading } = useDashboardMetrics();
  const [activeTab, setActiveTab] = useState('overview');

  const isLoading = leadsLoading || metricsLoading;

  const tabs = [
    { id: 'overview', icon: BarChart3, label: 'Visão Geral' },
    { id: 'niches', icon: Target, label: 'Análise de Nichos' },
    { id: 'scoring', icon: Trophy, label: 'Lead Scoring' },
  ];

  return (
    <DashboardLayout
      title="Análise Avançada"
      description="Métricas detalhadas, gráficos e insights sobre sua prospecção"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando análises...</p>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="inline-flex h-12 p-1 bg-muted/50 backdrop-blur-sm rounded-xl gap-1">
            {tabs.map(({ id, icon: Icon, label }) => (
              <TabsTrigger 
                key={id}
                value={id} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="animate-fade-in mt-6">
            <AdvancedAnalytics />
          </TabsContent>

          <TabsContent value="niches" className="animate-fade-in mt-6">
            <NichePerformanceAnalytics />
          </TabsContent>

          <TabsContent value="scoring" className="animate-fade-in mt-6">
            <LeadScoring />
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
}
