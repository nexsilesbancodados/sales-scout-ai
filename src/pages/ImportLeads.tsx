import { DashboardLayout } from '@/components/DashboardLayout';
import { ImportTab } from '@/components/prospecting/ImportTab';

export default function ImportLeadsPage() {
  return (
    <DashboardLayout
      title="Importar Leads"
      description="Importe leads via CSV ou arquivo"
    >
      <div className="animate-fade-in">
        <ImportTab />
      </div>
    </DashboardLayout>
  );
}
