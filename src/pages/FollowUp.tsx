import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { FollowUpManager } from '@/components/followup/FollowUpManager';
import { FollowUpSequencesTab } from '@/components/prospecting/FollowUpSequencesTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Layers } from 'lucide-react';

export default function FollowUpPage() {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <DashboardLayout
      title="Follow-up"
      description="Gerencie follow-ups pendentes e sequências automáticas"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pendentes
          </TabsTrigger>
          <TabsTrigger value="sequences" className="gap-2">
            <Layers className="h-4 w-4" />
            Sequências
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="animate-fade-in">
          <FollowUpManager />
        </TabsContent>

        <TabsContent value="sequences" className="animate-fade-in">
          <FollowUpSequencesTab />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
