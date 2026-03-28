import { DashboardLayout } from '@/components/DashboardLayout';
import { ProspectingHistoryTab } from '@/components/prospecting/ProspectingHistoryTab';
import { useNavigate } from 'react-router-dom';

export default function ProspectingHistoryPage() {
  const navigate = useNavigate();

  const handleReprospect = (niches: string[], locations: string[]) => {
    // Navigate to Google Maps page with prefilled data
    const params = new URLSearchParams();
    if (niches.length) params.set('niches', niches.join(','));
    if (locations.length) params.set('locations', locations.join(','));
    navigate(`/google-maps?${params.toString()}`);
  };

  return (
    <DashboardLayout
      title="Histórico de Prospecção"
      description="Veja o histórico de todas as sessões de captura e envio"
    >
      <div className="animate-fade-in">
        <ProspectingHistoryTab onReprospect={handleReprospect} />
      </div>
    </DashboardLayout>
  );
}
