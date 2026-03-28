import { DashboardLayout } from '@/components/DashboardLayout';
import { WhatsAppGroupImport } from '@/components/prospecting/WhatsAppGroupImport';

export default function WhatsAppGroupsPage() {
  return (
    <DashboardLayout
      title="Grupos WhatsApp"
      description="Importe leads de grupos do WhatsApp"
    >
      <div className="animate-fade-in">
        <WhatsAppGroupImport />
      </div>
    </DashboardLayout>
  );
}
