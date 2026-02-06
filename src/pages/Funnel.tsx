import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useLeads } from '@/hooks/use-leads';
import { Lead, LeadStage } from '@/types/database';
import { LeadDetailsModal } from '@/components/leads/LeadDetailsModal';
import { temperatureIconsSmall, stageBorderColors, allStages } from '@/constants/lead-icons';
import {
  GripVertical,
  Loader2,
  Kanban,
  Plus,
} from 'lucide-react';

const stageDescriptions: Record<LeadStage, string> = {
  'Contato': 'Primeiro contato',
  'Qualificado': 'Lead qualificado',
  'Proposta': 'Proposta enviada',
  'Negociação': 'Em negociação',
  'Ganho': 'Vendas ganhas',
  'Perdido': 'Vendas perdidas',
};

export default function FunnelPage() {
  const { leads, isLoading, updateLead } = useLeads();
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<LeadStage | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const getLeadsByStage = (stage: LeadStage) => {
    return leads.filter(lead => lead.stage === stage);
  };

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    if (draggedLead && draggedLead.stage !== stage) {
      updateLead({ id: draggedLead.id, stage });
    }
    setDraggedLead(null);
    setDragOverStage(null);
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailsOpen(true);
  };

  return (
    <DashboardLayout
      title="Funil de Vendas"
      description="Arraste e solte leads entre os estágios do funil"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando funil...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {allStages.map((stage, stageIndex) => {
            const stageLeads = getLeadsByStage(stage);
            const isDragOver = dragOverStage === stage;
            
            return (
              <div
                key={stage}
                className="flex flex-col animate-fade-in"
                style={{ animationDelay: `${stageIndex * 0.05}s` }}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage)}
              >
                <Card className={`
                  border-t-4 ${stageBorderColors[stage]} 
                  transition-all duration-200
                  ${isDragOver ? 'ring-2 ring-primary ring-offset-2 shadow-lg' : ''}
                `}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold">{stage}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {stageDescriptions[stage]}
                        </p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="h-7 w-7 rounded-full flex items-center justify-center p-0 font-bold"
                      >
                        {stageLeads.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 min-h-[350px] max-h-[500px] overflow-y-auto">
                    {stageLeads.length === 0 ? (
                      <div className={`
                        flex flex-col items-center justify-center h-32 
                        border-2 border-dashed rounded-xl 
                        text-muted-foreground text-sm
                        transition-colors duration-200
                        ${isDragOver ? 'border-primary bg-primary/5' : 'border-muted'}
                      `}>
                        <Kanban className="h-5 w-5 mb-2 opacity-50" />
                        <span>Arraste leads aqui</span>
                      </div>
                    ) : (
                      stageLeads.map((lead, index) => (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead)}
                          onClick={() => handleLeadClick(lead)}
                          className={`
                            p-3 rounded-xl border bg-card shadow-sm
                            cursor-grab active:cursor-grabbing 
                            hover:border-primary/50 hover:shadow-md
                            transition-all duration-200
                            ${draggedLead?.id === lead.id ? 'opacity-50 scale-95' : ''}
                          `}
                          style={{ animationDelay: `${index * 0.03}s` }}
                        >
                          <div className="flex items-start gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {lead.business_name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {lead.phone}
                              </p>
                              <div className="flex items-center gap-2 mt-2.5">
                                {temperatureIconsSmall[lead.temperature]}
                                {lead.niche && (
                                  <Badge variant="secondary" className="text-xs rounded-full px-2">
                                    {lead.niche}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Lead Details Modal */}
      <LeadDetailsModal
        lead={selectedLead}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </DashboardLayout>
  );
}
