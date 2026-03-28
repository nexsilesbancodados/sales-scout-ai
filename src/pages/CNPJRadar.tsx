import { DashboardLayout } from '@/components/DashboardLayout';
import { CNPJRadarTab } from '@/components/prospecting/CNPJRadarTab';

export default function CNPJRadarPage() {
  return (
    <DashboardLayout
      title="Radar CNPJ"
      description="Encontre empresas brasileiras por CNAE, cidade e porte"
    >
      <div className="animate-fade-in">
        <CNPJRadarTab />
      </div>
    </DashboardLayout>
  );
}