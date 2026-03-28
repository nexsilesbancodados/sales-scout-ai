import { DashboardLayout } from '@/components/DashboardLayout';
import { MassSendTab } from '@/components/prospecting/MassSendTab';

export default function MassSendPage() {
  return (
    <DashboardLayout
      title="Disparo em Massa"
      description="Envie mensagens em massa para seus leads"
    >
      <div className="animate-fade-in">
        <MassSendTab />
      </div>
    </DashboardLayout>
  );
}
