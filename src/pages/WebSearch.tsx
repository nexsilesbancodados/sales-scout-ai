import { DashboardLayout } from '@/components/DashboardLayout';
import { WebSearchTab } from '@/components/prospecting/WebSearchTab';

export default function WebSearchPage() {
  return (
    <DashboardLayout
      title="Pesquisa Web"
      description="Busque leads na web via Google Search e diretórios"
    >
      <div className="animate-fade-in">
        <WebSearchTab />
      </div>
    </DashboardLayout>
  );
}
