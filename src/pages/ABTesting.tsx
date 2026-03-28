import { DashboardLayout } from '@/components/DashboardLayout';
import { ABTestingTab } from '@/components/prospecting/ABTestingTab';

export default function ABTestingPage() {
  return (
    <DashboardLayout
      title="Testes A/B"
      description="Compare variantes de mensagens e descubra qual converte mais"
    >
      <div className="animate-fade-in">
        <ABTestingTab />
      </div>
    </DashboardLayout>
  );
}
