import { DashboardLayout } from '@/components/DashboardLayout';
import { InstagramExtractorTab } from '@/components/prospecting/InstagramExtractorTab';

export default function InstagramExtractorPage() {
  return (
    <DashboardLayout
      title="Extrator Instagram"
      description="Encontre perfis de negócios no Instagram por nicho e localização"
    >
      <div className="animate-fade-in">
        <InstagramExtractorTab />
      </div>
    </DashboardLayout>
  );
}