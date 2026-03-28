import { DashboardLayout } from '@/components/DashboardLayout';
import { AutomationsPanel } from '@/components/automations/AutomationsPanel';

export default function AutomationsPage() {
  return (
    <DashboardLayout
      title="Automações"
      description="Ligue e desligue cada automação com 1 clique — o app trabalha por você"
    >
      <div className="animate-fade-in">
        <AutomationsPanel />
      </div>
    </DashboardLayout>
  );
}
