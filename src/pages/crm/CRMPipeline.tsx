import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useLeads } from '@/hooks/use-leads';
import { Lead, LeadStage, LeadTemperature } from '@/types/database';
import { allStages, stageBorderColors } from '@/constants/lead-icons';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Loader2, Kanban, Plus, Flame, ThermometerSun, Snowflake,
  MapPin, DollarSign, Instagram, Facebook, MessageCircle,
} from 'lucide-react';

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 50%)`;
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const tempConfig: Record<LeadTemperature, { icon: React.ReactNode; label: string; className: string }> = {
  quente: { icon: <Flame className="h-3 w-3" />, label: '🔥 Quente', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
  morno: { icon: <ThermometerSun className="h-3 w-3" />, label: '🌡️ Morno', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  frio: { icon: <Snowflake className="h-3 w-3" />, label: '❄️ Frio', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
};

function LeadCard({ lead, onDragStart, isDragging, onClick }: {
  lead: Lead; onDragStart: (e: React.DragEvent) => void; isDragging: boolean; onClick: () => void;
}) {
  const bg = hashColor(lead.business_name);
  const temp = tempConfig[lead.temperature];

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`p-3 rounded-xl border bg-card shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 hover:shadow-md transition-all duration-200 ${isDragging ? 'opacity-50 scale-95' : ''}`}
    >
      <div className="flex items-start gap-2.5">
        <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: bg }}>
          {getInitials(lead.business_name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-sm truncate">{lead.business_name}</p>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 border ${temp.className}`}>
              {temp.label}
            </Badge>
          </div>
          {lead.location && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />{lead.location}
            </p>
          )}
        </div>
      </div>

      <Separator className="my-2" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {lead.deal_value && (
            <span className="flex items-center gap-0.5 font-medium text-foreground">
              <DollarSign className="h-3 w-3" />
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(lead.deal_value)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {lead.phone && (
            <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-green-500 hover:text-green-600">
              <MessageCircle className="h-3.5 w-3.5" />
            </a>
          )}
          {lead.instagram_url && (
            <a href={lead.instagram_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-pink-500 hover:text-pink-600">
              <Instagram className="h-3.5 w-3.5" />
            </a>
          )}
          {lead.facebook_url && (
            <a href={lead.facebook_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-blue-600 hover:text-blue-700">
              <Facebook className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {lead.last_contact_at && (
        <p className="text-[10px] text-muted-foreground mt-1.5">
          {formatDistanceToNow(new Date(lead.last_contact_at), { addSuffix: true, locale: ptBR })}
        </p>
      )}
    </div>
  );
}

function QuickAddDrawer({ stage, onClose }: { stage: LeadStage; onClose: () => void }) {
  const { createLead, isCreating } = useLeads();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [temp, setTemp] = useState<LeadTemperature>('morno');

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const handleCreate = () => {
    if (!name || !phone) return;
    createLead({
      business_name: name,
      phone: phone.replace(/\D/g, ''),
      stage,
      temperature: temp,
      source: 'manual',
      message_sent: false,
      follow_up_count: 0,
      lead_score: 0,
      score_factors: {},
      analyzed_needs: {},
      quality_score: 0,
      reviews_count: 0,
      tags: [],
    } as any);
    onClose();
  };

  return (
    <div className="space-y-4 pt-4">
      <Input placeholder="Nome da empresa" value={name} onChange={e => setName(e.target.value)} />
      <Input placeholder="(11) 99999-9999" value={phone} onChange={e => setPhone(formatPhone(e.target.value))} />
      <Select value={temp} onValueChange={v => setTemp(v as LeadTemperature)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="quente">🔥 Quente</SelectItem>
          <SelectItem value="morno">🌡️ Morno</SelectItem>
          <SelectItem value="frio">❄️ Frio</SelectItem>
        </SelectContent>
      </Select>
      <Badge variant="outline">{stage}</Badge>
      <Button className="w-full" onClick={handleCreate} disabled={isCreating || !name || !phone}>
        {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Criar Lead
      </Button>
    </div>
  );
}

export default function CRMPipelinePage() {
  const { leads, isLoading, updateLead } = useLeads();
  const navigate = useNavigate();
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<LeadStage | null>(null);
  const [addStage, setAddStage] = useState<LeadStage | null>(null);

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };
  const handleDrop = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    if (draggedLead && draggedLead.stage !== stage) updateLead({ id: draggedLead.id, stage });
    setDraggedLead(null);
    setDragOverStage(null);
  };

  const totalPipeline = leads
    .filter(l => !['Ganho', 'Perdido'].includes(l.stage))
    .reduce((s, l) => s + (l.deal_value || 0), 0);

  return (
    <CRMLayout title="Pipeline CRM" actions={
      <span className="text-sm font-medium text-muted-foreground">
        Pipeline: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalPipeline)}
      </span>
    }>
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {allStages.map((stage) => {
            const stageLeads = leads.filter(l => l.stage === stage);
            const isDragOver = dragOverStage === stage;
            const stageValue = stageLeads.reduce((s, l) => s + (l.deal_value || 0), 0);

            return (
              <div
                key={stage}
                className="flex flex-col"
                onDragOver={e => handleDragOver(e, stage)}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={e => handleDrop(e, stage)}
              >
                <Card className={`border-t-4 ${stageBorderColors[stage]} transition-all ${isDragOver ? 'ring-2 ring-primary shadow-lg' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold">{stage}</CardTitle>
                        {stageValue > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stageValue)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="h-6 w-6 rounded-full flex items-center justify-center p-0 text-xs font-bold">
                          {stageLeads.length}
                        </Badge>
                        <Sheet open={addStage === stage} onOpenChange={open => setAddStage(open ? stage : null)}>
                          <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle>Novo Lead — {stage}</SheetTitle>
                            </SheetHeader>
                            <QuickAddDrawer stage={stage} onClose={() => setAddStage(null)} />
                          </SheetContent>
                        </Sheet>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 min-h-[300px] max-h-[calc(100vh-280px)] overflow-y-auto">
                    {stageLeads.length === 0 ? (
                      <div className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl text-muted-foreground text-sm ${isDragOver ? 'border-primary bg-primary/5' : 'border-muted'}`}>
                        <Kanban className="h-5 w-5 mb-2 opacity-50" />
                        Arraste leads aqui
                      </div>
                    ) : (
                      stageLeads.map(lead => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          onDragStart={e => handleDragStart(e, lead)}
                          isDragging={draggedLead?.id === lead.id}
                          onClick={() => navigate(`/crm/contacts/${lead.id}`)}
                        />
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </CRMLayout>
  );
}
