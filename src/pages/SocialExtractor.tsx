import { DashboardLayout } from '@/components/DashboardLayout';
import { SocialExtractorTab } from '@/components/prospecting/SocialExtractorTab';

export default function SocialExtractorPage() {
  return (
    <DashboardLayout
      title="Extrator Social"
      description="Capture leads do Instagram e Facebook por nicho e localização"
    >
      <div className="animate-fade-in">
        <SocialExtractorTab />
      </div>
    </DashboardLayout>
  );
}
