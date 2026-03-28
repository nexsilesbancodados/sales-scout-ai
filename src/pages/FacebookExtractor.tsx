import { DashboardLayout } from '@/components/DashboardLayout';
import { FacebookExtractorTab } from '@/components/prospecting/FacebookExtractorTab';

export default function FacebookExtractorPage() {
  return (
    <DashboardLayout
      title="Extrator Facebook"
      description="Encontre páginas de negócios no Facebook por nicho e cidade"
    >
      <div className="animate-fade-in">
        <FacebookExtractorTab />
      </div>
    </DashboardLayout>
  );
}
