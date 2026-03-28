import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/ui/empty-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLeads } from '@/hooks/use-leads';
import { Lead, LeadStage } from '@/types/database';
import { LeadDetailsModal } from '@/components/leads/LeadDetailsModal';
import { temperatureIconsSmall, stageBorderColors, allStages } from '@/constants/lead-icons';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  GripVertical,
  Loader2,
  Kanban,
  Plus,
  Globe,
  MessageSquare,
} from 'lucide-react';

const stageDescriptions: Record<LeadStage, string> = {
  'Contato': 'Primeiro contato',
  'Qualificado': 'Lead qualificado',
  'Proposta': 'Proposta enviada',
  'Negociação': 'Em negociação',
  'Ganho': 'Vendas ganhas',
  'Perdido': 'Vendas perdidas',
};

const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(value);

export default function FunnelPage() {
  const { leads, isLoading, updateLead, createLead } = useLeads();
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<LeadStage | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Quick add state
  const [quickAddStage, setQuickAddStage] = useState<LeadStage | null>(null);
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');

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

  const openQuickAdd = (stage: LeadStage) => {
    setQuickAddStage(stage);
    setQuickName('');
    setQuickPhone('');
  };

  const handleQuickCreate = () => {
    if (!quickName.trim() || !quickAddStage) return;
    createLead({
      business_name: quickName.trim(),
      phone: quickPhone.trim() || '0',
      stage: quickAddStage,
      temperature: 'morno',
      source: 'manual',
    } as any);
    setQuickAddStage(null);
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
            const totalDealValue = stageLeads.reduce((sum, l) => sum + ((l as any).deal_value || 0), 0);
            
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
                      <div className="flex items-center gap-1.5">
                        {totalDealValue > 0 && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            {formatCompactCurrency(totalDealValue)}
                          </span>
                        )}
                        <Badge 
                          variant="secondary" 
                          className="h-6 w-6 rounded-full flex items-center justify-center p-0 font-bold text-xs"
                        >
                          {stageLeads.length}
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => openQuickAdd(stage)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
                              <p className="font-medium text-sm truncate">{lead.business_name}</p>
                              {lead.location && (
                                <p className="text-xs text-muted-foreground truncate mt-0.5">{lead.location}</p>
                              )}
                              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                {temperatureIconsSmall[lead.temperature]}
                                {(lead as any).deal_value > 0 && (
                                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                                    {formatCompactCurrency((lead as any).deal_value)}
                                  </span>
                                )}
                                {lead.niche && (
                                  <Badge variant="secondary" className="text-xs rounded-full px-2">{lead.niche}</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                {(lead as any).instagram_url && (
                                  <a href={(lead as any).instagram_url} target="_blank" rel="noopener noreferrer"
                                     onClick={e => e.stopPropagation()}
                                     className="text-muted-foreground hover:text-primary transition-colors">
                                    <Globe className="h-3 w-3" />
                                  </a>
                                )}
                                {lead.phone && (
                                  <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                                     onClick={e => e.stopPropagation()}
                                     className="text-muted-foreground hover:text-green-500 transition-colors">
                                    <MessageSquare className="h-3 w-3" />
                                  </a>
                                )}
                                {lead.last_contact_at && (
                                  <span className="text-[10px] text-muted-foreground ml-auto">
                                    {formatDistanceToNow(new Date(lead.last_contact_at), { locale: ptBR, addSuffix: true })}
                                  </span>
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

      {/* Quick Add Dialog */}
      <Dialog open={!!quickAddStage} onOpenChange={(o) => !o && setQuickAddStage(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Novo lead em {quickAddStage}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Nome da empresa *</Label>
              <Input value={quickName} onChange={e => setQuickName(e.target.value)} placeholder="Ex: Pizzaria Central" autoFocus />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={quickPhone} onChange={e => setQuickPhone(e.target.value)} placeholder="(11) 99999-9999" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setQuickAddStage(null)}>Cancelar</Button>
            <Button onClick={handleQuickCreate} disabled={!quickName.trim()}>Criar Lead</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lead Details Modal */}
      <LeadDetailsModal
        lead={selectedLead}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </DashboardLayout>
  );
}
