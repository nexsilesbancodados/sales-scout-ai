import { DashboardLayout } from '@/components/DashboardLayout';
import { SDRAgentDashboard } from '@/components/sdr/SDRAgentDashboard';

export default function SDRAgentPage() {
  return (
    <DashboardLayout
      title="Agente SDR"
      description="Configure e monitore seu agente de qualificação de leads em tempo real"
    >
      <div className="animate-fade-in">
        <SDRAgentDashboard />
      </div>
    </DashboardLayout>
  );
}