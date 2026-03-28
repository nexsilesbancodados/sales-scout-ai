import { DashboardLayout } from '@/components/DashboardLayout';
import { LeadFinderInterface } from '@/components/prospecting/LeadFinderInterface';

export default function GoogleMapsPage() {
  return (
    <DashboardLayout
      title="Google Maps"
      description="Capture leads diretamente do Google Maps"
    >
      <div className="animate-fade-in">
        <LeadFinderInterface />
      </div>
    </DashboardLayout>
  );
}
