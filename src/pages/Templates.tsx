import { DashboardLayout } from '@/components/DashboardLayout';
import { TemplatesTab } from '@/components/prospecting/TemplatesTab';

export default function TemplatesPage() {
  return (
    <DashboardLayout
      title="Templates de Mensagem"
      description="Crie e gerencie templates para suas campanhas"
    >
      <div className="animate-fade-in">
        <TemplatesTab />
      </div>
    </DashboardLayout>
  );
}
