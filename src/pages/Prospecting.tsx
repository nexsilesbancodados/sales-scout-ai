import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProspectingDashboard } from '@/components/prospecting/ProspectingDashboard';
import { CampaignsTab } from '@/components/prospecting/CampaignsTab';
import { MassSendTab } from '@/components/prospecting/MassSendTab';
import { CaptureAndSendTab } from '@/components/prospecting/CaptureAndSendTab';
import { ImportTab } from '@/components/prospecting/ImportTab';
import { TemplatesTab } from '@/components/prospecting/TemplatesTab';
import { SettingsTab } from '@/components/prospecting/SettingsTab';
import { AIInsightsTab } from '@/components/prospecting/AIInsightsTab';
import { ABTestingTab } from '@/components/prospecting/ABTestingTab';
import { FollowUpManager } from '@/components/followup/FollowUpManager';
import { ScheduledProspectingTab } from '@/components/prospecting/ScheduledProspectingTab';
import { FollowUpSequencesTab } from '@/components/prospecting/FollowUpSequencesTab';
import { EmailFinderTab } from '@/components/prospecting/EmailFinderTab';
import { WebSearchTab } from '@/components/prospecting/WebSearchTab';
import { ProspectingHistoryTab } from '@/components/prospecting/ProspectingHistoryTab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { NewCampaignForm } from '@/components/prospecting/NewCampaignForm';
import {
  Rocket,
  Send,
  Upload,
  MessageSquareText,
  Settings,
  Brain,
  Plus,
  Target,
  RefreshCw,
  FlaskConical,
  Calendar,
  Mail,
  Globe,
  History,
} from 'lucide-react';

const tabs = [
  { id: 'capture', icon: Target, label: 'Maps' },
  { id: 'web-search', icon: Globe, label: 'Web' },
  { id: 'history', icon: History, label: 'Histórico' },
  { id: 'campaigns', icon: Rocket, label: 'Campanhas' },
  { id: 'mass-send', icon: Send, label: 'Disparo' },
  { id: 'scheduled', icon: Calendar, label: 'Agendado' },
  { id: 'follow-up', icon: RefreshCw, label: 'Follow-up' },
  { id: 'sequences', icon: RefreshCw, label: 'Sequências' },
  { id: 'email-finder', icon: Mail, label: 'Emails' },
  { id: 'ab-testing', icon: FlaskConical, label: 'A/B Test' },
  { id: 'templates', icon: MessageSquareText, label: 'Templates' },
  { id: 'import', icon: Upload, label: 'Importar' },
  { id: 'ai-insights', icon: Brain, label: 'IA' },
  { id: 'settings', icon: Settings, label: 'Config' },
] as const;

export default function ProspectingPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('capture');
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [prefilledNiches, setPrefilledNiches] = useState<string[]>([]);
  const [prefilledLocations, setPrefilledLocations] = useState<string[]>([]);

  // Handle URL param for tab navigation
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Handle reprospectar from history
  const handleReprospectFromHistory = (niches: string[], locations: string[]) => {
    setPrefilledNiches(niches);
    setPrefilledLocations(locations);
    setActiveTab('capture');
  };

  return (
    <DashboardLayout
      title="Prospecção"
      description="Capture leads, analise dores e dispare mensagens personalizadas"
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="lg"
            className="gradient-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            onClick={() => setActiveTab('capture')}
          >
            <Target className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Capturar Leads</span>
            <span className="sm:hidden">Capturar</span>
          </Button>
          <Dialog open={isNewCampaignOpen} onOpenChange={setIsNewCampaignOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="shadow-sm">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Nova Campanha</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Campanha</DialogTitle>
                <DialogDescription>
                  Configure sua campanha de prospecção automatizada
                </DialogDescription>
              </DialogHeader>
              <NewCampaignForm onSuccess={() => setIsNewCampaignOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      {/* Stats Dashboard */}
      <ProspectingDashboard />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex h-12 p-1 bg-muted/50 backdrop-blur-sm rounded-xl gap-1 min-w-max">
            {tabs.map(({ id, icon: Icon, label }) => (
              <TabsTrigger 
                key={id}
                value={id} 
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-medium">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="mt-6">
          <TabsContent value="capture" className="animate-fade-in m-0">
            <CaptureAndSendTab 
              prefilledNiches={prefilledNiches}
              prefilledLocations={prefilledLocations}
              onPrefilledConsumed={() => {
                setPrefilledNiches([]);
                setPrefilledLocations([]);
              }}
            />
          </TabsContent>

          <TabsContent value="web-search" className="animate-fade-in m-0">
            <WebSearchTab />
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in m-0">
            <ProspectingHistoryTab onReprospect={handleReprospectFromHistory} />
          </TabsContent>

          <TabsContent value="campaigns" className="animate-fade-in m-0">
            <CampaignsTab />
          </TabsContent>

          <TabsContent value="mass-send" className="animate-fade-in m-0">
            <MassSendTab />
          </TabsContent>

          <TabsContent value="scheduled" className="animate-fade-in m-0">
            <ScheduledProspectingTab />
          </TabsContent>

          <TabsContent value="follow-up" className="animate-fade-in m-0">
            <FollowUpManager />
          </TabsContent>

          <TabsContent value="sequences" className="animate-fade-in m-0">
            <FollowUpSequencesTab />
          </TabsContent>

          <TabsContent value="email-finder" className="animate-fade-in m-0">
            <EmailFinderTab />
          </TabsContent>

          <TabsContent value="templates" className="animate-fade-in m-0">
            <TemplatesTab />
          </TabsContent>

          <TabsContent value="ab-testing" className="animate-fade-in m-0">
            <ABTestingTab />
          </TabsContent>

          <TabsContent value="import" className="animate-fade-in m-0">
            <ImportTab />
          </TabsContent>

          <TabsContent value="ai-insights" className="animate-fade-in m-0">
            <AIInsightsTab />
          </TabsContent>

          <TabsContent value="settings" className="animate-fade-in m-0">
            <SettingsTab />
          </TabsContent>
        </div>
      </Tabs>
    </DashboardLayout>
  );
}
