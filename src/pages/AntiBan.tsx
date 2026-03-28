import { DashboardLayout } from '@/components/DashboardLayout';
import { AntiBanDashboard } from '@/components/antiban';

export default function AntiBanPage() {
  return (
    <DashboardLayout
      title="Anti-Ban"
      description="Monitore a saúde do chip e configure proteções"
    >
      <div className="animate-fade-in">
        <AntiBanDashboard />
      </div>
    </DashboardLayout>
  );
}
