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
  Search,
  LucideIcon,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

const captureTabs: TabItem[] = [
  { id: 'maps', icon: Target, label: 'Google Maps' },
  { id: 'web-search', icon: Globe, label: 'Pesquisa Web' },
  { id: 'whatsapp-groups', icon: MessageCircle, label: 'WhatsApp' },
  { id: 'import', icon: Upload, label: 'Importar' },
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
      case 'maps':
        return <LeadFinderInterface />;
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
      {/* Stats Dashboard */}
      <div className="animate-fade-in">
        <ProspectingDashboard />
      </div>

      {/* Navigation */}
      <div className="mt-8 space-y-4">
        <Card className="overflow-hidden animate-fade-in">
          {/* Sub-tabs Header */}
          <div className="border-b bg-muted/30 p-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Captura</h3>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {captureTabs.map((tab) => {
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
