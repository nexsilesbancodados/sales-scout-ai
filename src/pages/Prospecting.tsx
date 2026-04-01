import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProspectingDashboard } from '@/components/prospecting/ProspectingDashboard';
import { LeadFinderInterface } from '@/components/prospecting/LeadFinderInterface';
import { WebSearchTab } from '@/components/prospecting/WebSearchTab';
import { ImportTab } from '@/components/prospecting/ImportTab';
import { WhatsAppGroupImport } from '@/components/prospecting/WhatsAppGroupImport';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Upload,
  Target,
  Globe,
  LucideIcon,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string;
}

const captureTabs: TabItem[] = [
  { id: 'maps', icon: Target, label: 'Google Maps', description: 'Buscar no Maps' },
  { id: 'web-search', icon: Globe, label: 'Pesquisa Web', description: 'Buscar na web' },
  { id: 'whatsapp-groups', icon: MessageCircle, label: 'WhatsApp', description: 'Grupos' },
  { id: 'import', icon: Upload, label: 'Importar', description: 'CSV/Arquivo' },
];

export default function ProspectingPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('maps');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      const tabMapping: Record<string, string> = { capture: 'maps' };
      const mappedTab = tabMapping[tab] || tab;
      if (captureTabs.some(t => t.id === mappedTab)) {
        setActiveTab(mappedTab);
      }
    }
  }, [searchParams]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'maps': return <LeadFinderInterface />;
      case 'web-search': return <WebSearchTab />;
      case 'whatsapp-groups': return <WhatsAppGroupImport />;
      case 'import': return <ImportTab />;
      default: return null;
    }
  };

  return (
    <DashboardLayout
      title="Prospecção"
      description="Capture leads do Google Maps, web e WhatsApp"
    >
      {/* Stats */}
      <ProspectingDashboard />

      {/* Main Content */}
      <div className="mt-6">
        <Card className="overflow-hidden border-border/50">
          {/* Tab Navigation */}
          <div className="border-b border-border/50 bg-muted/20 px-4 py-3">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              {captureTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "h-9 px-4 text-xs gap-2 rounded-lg transition-all duration-200 shrink-0",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary/90 hover:text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <TabIcon className="h-3.5 w-3.5" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-5 sm:p-6">
            <div key={activeTab} className="animate-fade-in">
              {renderTabContent()}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
