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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  ChevronDown,
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
  description: string;
  tabs: TabItem[];
}

// Grouped tabs for better organization
const tabGroups: TabGroup[] = [
  {
    id: 'capture',
    label: 'Captura',
    icon: Search,
    description: 'Encontrar novos leads',
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
    description: 'Enviar mensagens',
    tabs: [
      { id: 'mass-send', icon: Send, label: 'Disparo em Massa' },
      { id: 'campaigns', icon: Rocket, label: 'Campanhas' },
      { id: 'scheduled', icon: Calendar, label: 'Agendado' },
    ],
  },
  {
    id: 'followup',
    label: 'Follow-up',
    icon: RefreshCw,
    description: 'Acompanhamento',
    tabs: [
      { id: 'follow-up', icon: RefreshCw, label: 'Pendentes' },
      { id: 'sequences', icon: Layers, label: 'Sequências' },
    ],
  },
  {
    id: 'tools',
    label: 'Ferramentas',
    icon: Zap,
    description: 'Utilitários e IA',
    tabs: [
      { id: 'templates', icon: MessageSquareText, label: 'Templates' },
      { id: 'email-finder', icon: Mail, label: 'Buscar Emails' },
      { id: 'ab-testing', icon: FlaskConical, label: 'Teste A/B' },
      { id: 'ai-insights', icon: Brain, label: 'IA Insights' },
      { id: 'history', icon: History, label: 'Histórico' },
    ],
  },
];

// Flat list of all tab IDs for content switching
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
      // Map old tab names to new ones
      const tabMapping: Record<string, string> = {
        capture: 'maps',
      };
      const mappedTab = tabMapping[tab] || tab;
      
      if (allTabs.some(t => t.id === mappedTab)) {
        setActiveTab(mappedTab);
        // Find and set the group
        const group = tabGroups.find(g => g.tabs.some(t => t.id === mappedTab));
        if (group) setActiveGroup(group.id);
      }
    }
  }, [searchParams]);

  // Handle reprospectar from history
  const handleReprospectFromHistory = (niches: string[], locations: string[]) => {
    setPrefilledNiches(niches);
    setPrefilledLocations(locations);
    setActiveTab('maps');
    setActiveGroup('capture');
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const group = tabGroups.find(g => g.tabs.some(t => t.id === tabId));
    if (group) setActiveGroup(group.id);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'maps':
        return (
          <CaptureAndSendTab 
            prefilledNiches={prefilledNiches}
            prefilledLocations={prefilledLocations}
            onPrefilledConsumed={() => {
              setPrefilledNiches([]);
              setPrefilledLocations([]);
            }}
          />
        );
      case 'web-search':
        return <WebSearchTab />;
      case 'import':
        return <ImportTab />;
      case 'mass-send':
        return <MassSendTab />;
      case 'campaigns':
        return <CampaignsTab />;
      case 'scheduled':
        return <ScheduledProspectingTab />;
      case 'follow-up':
        return <FollowUpManager />;
      case 'sequences':
        return <FollowUpSequencesTab />;
      case 'templates':
        return <TemplatesTab />;
      case 'email-finder':
        return <EmailFinderTab />;
      case 'ab-testing':
        return <ABTestingTab />;
      case 'ai-insights':
        return <AIInsightsTab />;
      case 'history':
        return <ProspectingHistoryTab onReprospect={handleReprospectFromHistory} />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="Prospecção"
      description="Capture leads e dispare mensagens personalizadas"
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="lg"
            className="gradient-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            onClick={() => {
              setActiveTab('maps');
              setActiveGroup('capture');
            }}
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

      {/* Grouped Navigation */}
      <div className="mt-8 space-y-4">
        {/* Group Cards - Quick Access */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tabGroups.map((group) => {
            const isActive = activeGroup === group.id;
            const GroupIcon = group.icon;
            return (
              <button
                key={group.id}
                onClick={() => {
                  setActiveGroup(group.id);
                  setActiveTab(group.tabs[0].id);
                }}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all duration-200",
                  isActive
                    ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <GroupIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{group.label}</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">{group.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sub-tabs for active group */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {(() => {
                  const group = tabGroups.find(g => g.id === activeGroup);
                  if (!group) return null;
                  const GroupIcon = group.icon;
                  return (
                    <>
                      <GroupIcon className="h-5 w-5 text-primary" />
                      {group.label}
                    </>
                  );
                })()}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Sub-navigation */}
            <div className="flex flex-wrap gap-2 pb-4 border-b mb-4">
              {tabGroups
                .find(g => g.id === activeGroup)
                ?.tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const TabIcon = tab.icon;
                  return (
                    <Button
                      key={tab.id}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "transition-all",
                        isActive && "shadow-sm"
                      )}
                    >
                      <TabIcon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </Button>
                  );
                })}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
              {renderTabContent()}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
