import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProspectingDashboard } from '@/components/prospecting/ProspectingDashboard';
import { CampaignsTab } from '@/components/prospecting/CampaignsTab';
import { MassSendTab } from '@/components/prospecting/MassSendTab';
import { CaptureAndSendTab } from '@/components/prospecting/CaptureAndSendTab';
import { ImportTab } from '@/components/prospecting/ImportTab';
import { TemplatesTab } from '@/components/prospecting/TemplatesTab';
import { SettingsTab } from '@/components/prospecting/SettingsTab';
import { AIInsightsTab } from '@/components/prospecting/AIInsightsTab';
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
} from 'lucide-react';

export default function ProspectingPage() {
  const [activeTab, setActiveTab] = useState('capture');
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);

  return (
    <DashboardLayout
      title="Prospecção"
      description="Capture leads, analise dores e dispare mensagens personalizadas"
      actions={
        <Dialog open={isNewCampaignOpen} onOpenChange={setIsNewCampaignOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Campanha</DialogTitle>
              <DialogDescription>
                Configure sua campanha de prospecção
              </DialogDescription>
            </DialogHeader>
            <NewCampaignForm onSuccess={() => setIsNewCampaignOpen(false)} />
          </DialogContent>
        </Dialog>
      }
    >
      {/* Stats Dashboard */}
      <ProspectingDashboard />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 mt-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="capture" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Capturar</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            <span className="hidden sm:inline">Campanhas</span>
          </TabsTrigger>
          <TabsTrigger value="mass-send" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Disparo</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Importar</span>
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">IA</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="capture">
          <CaptureAndSendTab />
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignsTab />
        </TabsContent>

        <TabsContent value="mass-send">
          <MassSendTab />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>

        <TabsContent value="import">
          <ImportTab />
        </TabsContent>

        <TabsContent value="ai-insights">
          <AIInsightsTab />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
