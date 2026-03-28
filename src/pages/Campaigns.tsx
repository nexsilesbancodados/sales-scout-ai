import { DashboardLayout } from '@/components/DashboardLayout';
import { CampaignsTab } from '@/components/prospecting/CampaignsTab';

export default function CampaignsPage() {
  return (
    <DashboardLayout
      title="Campanhas"
      description="Gerencie suas campanhas de prospecção"
    >
      <div className="animate-fade-in">
        <CampaignsTab />
      </div>
    </DashboardLayout>
  );
}
