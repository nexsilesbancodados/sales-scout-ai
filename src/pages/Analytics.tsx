import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics';
import { NichePerformanceAnalytics } from '@/components/analytics/NichePerformanceAnalytics';
import { LeadScoring } from '@/components/analytics/LeadScoring';
import { ConversionFunnel } from '@/components/analytics/ConversionFunnel';
import { SentimentAnalysis } from '@/components/analytics/SentimentAnalysis';
import { AgentIntelligenceDashboard } from '@/components/analytics/AgentIntelligenceDashboard';
import { Loader2, BarChart3, Target, Trophy, TrendingUp, Sparkles, Brain } from 'lucide-react';
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
    { id: 'intelligence', icon: Brain, label: 'Inteligência IA' },
    { id: 'funnel', icon: TrendingUp, label: 'Funil' },
    { id: 'sentiment', icon: Sparkles, label: 'Sentimento' },
    { id: 'niches', icon: Target, label: 'Nichos' },
    { id: 'scoring', icon: Trophy, label: 'Scoring' },
  ];

  return (
    <DashboardLayout
      title="Análise Avançada"
      description="Métricas detalhadas e insights sobre sua prospecção"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <div className="relative p-4 rounded-full bg-primary/10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Carregando análises...</p>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto -mx-1 px-1">
            <TabsList className="inline-flex h-11 p-1 bg-muted/60 backdrop-blur-sm rounded-xl gap-0.5 w-full sm:w-auto">
              {tabs.map(({ id, icon: Icon, label }) => (
                <TabsTrigger 
                  key={id}
                  value={id} 
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview" className="animate-fade-in mt-4">
            <AdvancedAnalytics />
          </TabsContent>

          <TabsContent value="intelligence" className="animate-fade-in mt-4">
            <AgentIntelligenceDashboard />
          </TabsContent>

          <TabsContent value="funnel" className="animate-fade-in mt-4">
            <ConversionFunnel />
          </TabsContent>

          <TabsContent value="sentiment" className="animate-fade-in mt-4">
            <SentimentAnalysis />
          </TabsContent>

          <TabsContent value="niches" className="animate-fade-in mt-4">
            <NichePerformanceAnalytics />
          </TabsContent>

          <TabsContent value="scoring" className="animate-fade-in mt-4">
            <LeadScoring />
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
}
