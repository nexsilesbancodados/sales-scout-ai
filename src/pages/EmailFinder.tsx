import { DashboardLayout } from '@/components/DashboardLayout';
import { EmailFinderTab } from '@/components/prospecting/EmailFinderTab';

export default function EmailFinderPage() {
  return (
    <DashboardLayout
      title="Buscar Emails"
      description="Encontre emails de leads via Hunter.io"
    >
      <div className="animate-fade-in">
        <EmailFinderTab />
      </div>
    </DashboardLayout>
  );
}
