import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProspectingDashboard } from '@/components/prospecting/ProspectingDashboard';
import { LeadFinderInterface } from '@/components/prospecting/LeadFinderInterface';
import { WebSearchTab } from '@/components/prospecting/WebSearchTab';
import { ImportTab } from '@/components/prospecting/ImportTab';
import { MassSendTab } from '@/components/prospecting/MassSendTab';
import { CampaignsTab } from '@/components/prospecting/CampaignsTab';
import { ScheduledProspectingTab } from '@/components/prospecting/ScheduledProspectingTab';
import { FollowUpManager } from '@/components/followup/FollowUpManager';
import { FollowUpSequencesTab } from '@/components/prospecting/FollowUpSequencesTab';
import { TemplatesTab } from '@/components/prospecting/TemplatesTab';
import { EmailFinderTab } from '@/components/prospecting/EmailFinderTab';
import { ABTestingTab } from '@/components/prospecting/ABTestingTab';
import { AIInsightsTab } from '@/components/prospecting/AIInsightsTab';
import { ProspectingHistoryTab } from '@/components/prospecting/ProspectingHistoryTab';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Brain,
  Plus,
  Target,
  RefreshCw,
  FlaskConical,
  Calendar,
  Mail,
  Globe,
  History,
  Search,
  Zap,
  Layers,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

interface TabGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  tabs: TabItem[];
}

// Simplified tab groups
const tabGroups: TabGroup[] = [
  {
    id: 'capture',
    label: 'Captura',
    icon: Search,
    tabs: [
      { id: 'maps', icon: Target, label: 'Google Maps' },
      { id: 'web-search', icon: Globe, label: 'Pesquisa Web' },
      { id: 'import', icon: Upload, label: 'Importar' },
    ],
  },
  {
    id: 'outreach',
    label: 'Disparo',
    icon: Send,
    tabs: [
      { id: 'mass-send', icon: Send, label: 'Em Massa' },
      { id: 'campaigns', icon: Rocket, label: 'Campanhas' },
      { id: 'scheduled', icon: Calendar, label: 'Agendado' },
    ],
  },
  {
    id: 'followup',
    label: 'Follow-up',
    icon: RefreshCw,
    tabs: [
      { id: 'follow-up', icon: RefreshCw, label: 'Pendentes' },
      { id: 'sequences', icon: Layers, label: 'Sequências' },
    ],
  },
  {
    id: 'tools',
    label: 'Ferramentas',
    icon: Zap,
    tabs: [
      { id: 'templates', icon: MessageSquareText, label: 'Templates' },
      { id: 'email-finder', icon: Mail, label: 'Emails' },
      { id: 'ab-testing', icon: FlaskConical, label: 'Teste A/B' },
      { id: 'ai-insights', icon: Brain, label: 'IA' },
      { id: 'history', icon: History, label: 'Histórico' },
    ],
  },
];

const allTabs = tabGroups.flatMap(g => g.tabs);

export default function ProspectingPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('maps');
  const [activeGroup, setActiveGroup] = useState('capture');
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [prefilledNiches, setPrefilledNiches] = useState<string[]>([]);
  const [prefilledLocations, setPrefilledLocations] = useState<string[]>([]);

  // Handle URL param for tab navigation
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      const tabMapping: Record<string, string> = { capture: 'maps' };
      const mappedTab = tabMapping[tab] || tab;
      
      if (allTabs.some(t => t.id === mappedTab)) {
        setActiveTab(mappedTab);
        const group = tabGroups.find(g => g.tabs.some(t => t.id === mappedTab));
        if (group) setActiveGroup(group.id);
      }
    }
  }, [searchParams]);

  const handleReprospectFromHistory = (niches: string[], locations: string[]) => {
    setPrefilledNiches(niches);
    setPrefilledLocations(locations);
    setActiveTab('maps');
    setActiveGroup('capture');
  };

  const activeGroupData = useMemo(() => 
    tabGroups.find(g => g.id === activeGroup), 
    [activeGroup]
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'maps':
        return <LeadFinderInterface />;
      case 'web-search': return <WebSearchTab />;
      case 'import': return <ImportTab />;
      case 'mass-send': return <MassSendTab />;
      case 'campaigns': return <CampaignsTab />;
      case 'scheduled': return <ScheduledProspectingTab />;
      case 'follow-up': return <FollowUpManager />;
      case 'sequences': return <FollowUpSequencesTab />;
      case 'templates': return <TemplatesTab />;
      case 'email-finder': return <EmailFinderTab />;
      case 'ab-testing': return <ABTestingTab />;
      case 'ai-insights': return <AIInsightsTab />;
      case 'history': return <ProspectingHistoryTab onReprospect={handleReprospectFromHistory} />;
      default: return null;
    }
  };

  return (
    <DashboardLayout
      title="Prospecção"
      description="Capture leads e envie mensagens"
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="default"
            className="gradient-primary shadow-md"
            onClick={() => {
              setActiveTab('maps');
              setActiveGroup('capture');
            }}
          >
            <Target className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Capturar</span>
          </Button>
          <Dialog open={isNewCampaignOpen} onOpenChange={setIsNewCampaignOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Campanha</DialogTitle>
                <DialogDescription>
                  Configure sua campanha de prospecção
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

      {/* Navigation */}
      <div className="mt-6 space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        {/* Group Buttons - Compact */}
        <div className="flex flex-wrap gap-2">
          {tabGroups.map((group, index) => {
            const isActive = activeGroup === group.id;
            const GroupIcon = group.icon;
            return (
              <Button
                key={group.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActiveGroup(group.id);
                  setActiveTab(group.tabs[0].id);
                }}
                className={cn(
                  "gap-2 transition-all duration-200",
                  isActive && "shadow-md scale-[1.02]"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <GroupIcon className="h-4 w-4" />
                {group.label}
              </Button>
            );
          })}
        </div>

        {/* Tab Content */}
        <Card className="animate-fade-in overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                {activeGroupData && (
                  <>
                    <activeGroupData.icon className="h-4 w-4 text-primary" />
                    {activeGroupData.label}
                  </>
                )}
              </CardTitle>
            </div>
            {/* Sub-tabs */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {activeGroupData?.tabs.map((tab, index) => {
                const isActive = activeTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "h-8 text-xs gap-1.5 transition-all duration-200",
                      isActive && "shadow-sm"
                    )}
                  >
                    <TabIcon className="h-3.5 w-3.5" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="animate-fade-in" key={activeTab}>
              {renderTabContent()}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
