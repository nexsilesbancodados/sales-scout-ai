import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLeads } from '@/hooks/use-leads';
import { Lead, LeadStage } from '@/types/database';
import {
  Flame,
  ThermometerSun,
  Snowflake,
  GripVertical,
  Loader2,
  Kanban,
} from 'lucide-react';

const stages: LeadStage[] = ['Contato', 'Qualificado', 'Proposta', 'Negociação', 'Ganho', 'Perdido'];

const stageColors: Record<LeadStage, string> = {
  'Contato': 'border-t-stage-contact',
  'Qualificado': 'border-t-stage-qualified',
  'Proposta': 'border-t-stage-proposal',
  'Negociação': 'border-t-stage-negotiation',
  'Ganho': 'border-t-stage-won',
  'Perdido': 'border-t-stage-lost',
};

const temperatureIcons = {
  'quente': <Flame className="h-3 w-3 text-temp-hot" />,
  'morno': <ThermometerSun className="h-3 w-3 text-temp-warm" />,
  'frio': <Snowflake className="h-3 w-3 text-temp-cold" />,
};

export default function FunnelPage() {
  const { leads, isLoading, updateLead } = useLeads();
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  const getLeadsByStage = (stage: LeadStage) => {
    return leads.filter(lead => lead.stage === stage);
  };

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    if (draggedLead && draggedLead.stage !== stage) {
      updateLead({ id: draggedLead.id, stage });
    }
    setDraggedLead(null);
  };

  return (
    <DashboardLayout
      title="Funil de Vendas"
      description="Arraste e solte leads entre os estágios do funil"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stages.map((stage) => (
            <div
              key={stage}
              className="flex flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <Card className={`border-t-4 ${stageColors[stage]}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    {stage}
                    <Badge variant="secondary" className="ml-2">
                      {getLeadsByStage(stage).length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 min-h-[400px]">
                  {getLeadsByStage(stage).length === 0 ? (
                    <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                      <Kanban className="h-5 w-5 mr-2" />
                      Arraste leads aqui
                    </div>
                  ) : (
                    getLeadsByStage(stage).map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead)}
                        className="p-3 rounded-lg border bg-card cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {lead.business_name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {lead.phone}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {temperatureIcons[lead.temperature]}
                              {lead.niche && (
                                <Badge variant="secondary" className="text-xs">
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
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
