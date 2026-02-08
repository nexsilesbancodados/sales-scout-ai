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
import { Card, CardContent } from '@/components/ui/card';
import {
  Rocket,
  Send,
  Upload,
  MessageSquareText,
  Brain,
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
  const [prefilledNiches, setPrefilledNiches] = useState<string[]>([]);
  const [prefilledLocations, setPrefilledLocations] = useState<string[]>([]);

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
    >
      {/* Stats Dashboard */}
      <div className="animate-fade-in">
        <ProspectingDashboard />
      </div>

      {/* Navigation */}
      <div className="mt-8 space-y-4">
        {/* Group Tabs */}
        <div className="flex flex-wrap gap-2 p-1 bg-muted/50 rounded-xl border">
          {tabGroups.map((group) => {
            const isActive = activeGroup === group.id;
            const GroupIcon = group.icon;
            return (
              <Button
                key={group.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setActiveGroup(group.id);
                  setActiveTab(group.tabs[0].id);
                }}
                className={cn(
                  "gap-2 transition-all duration-200 h-10",
                  isActive && "shadow-md"
                )}
              >
                <GroupIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{group.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Tab Content */}
        <Card className="overflow-hidden animate-fade-in">
          {/* Sub-tabs Header */}
          <div className="border-b bg-muted/30 p-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                {activeGroupData && (
                  <>
                    <activeGroupData.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{activeGroupData.label}</h3>
                  </>
                )}
              </div>
              
              {/* Sub-tabs */}
              <div className="flex flex-wrap gap-1.5">
                {activeGroupData?.tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const TabIcon = tab.icon;
                  return (
                    <Button
                      key={tab.id}
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "h-8 text-xs gap-1.5 transition-all",
                        isActive && "shadow-sm bg-background"
                      )}
                    >
                      <TabIcon className="h-3.5 w-3.5" />
                      {tab.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Content */}
          <CardContent className="p-6">
            <div key={activeTab} className="animate-fade-in">
              {renderTabContent()}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
