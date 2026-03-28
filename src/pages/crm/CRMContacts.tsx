import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLeads } from '@/hooks/use-leads';
import { Lead, LeadStage, LeadTemperature } from '@/types/database';
import { allStages, allTemperatures, stageColors } from '@/constants/lead-icons';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Search, Loader2, LayoutGrid, TableIcon, Download, Upload,
  MessageCircle, Eye, Flame, ThermometerSun, Snowflake, Trash2,
} from 'lucide-react';

function hashColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360}, 55%, 50%)`;
}

function ScoreBadge({ score }: { score: number }) {
  const cls = score <= 30 ? 'bg-red-500/10 text-red-600' : score <= 60 ? 'bg-amber-500/10 text-amber-600' : 'bg-green-500/10 text-green-600';
  return <Badge variant="outline" className={`text-xs ${cls}`}>{score}</Badge>;
}

const tempIcons: Record<LeadTemperature, React.ReactNode> = {
  quente: <Flame className="h-3 w-3 text-red-500" />,
  morno: <ThermometerSun className="h-3 w-3 text-amber-500" />,
  frio: <Snowflake className="h-3 w-3 text-blue-500" />,
};

export default function CRMContactsPage() {
  const { leads, isLoading, deleteLeads } = useLeads();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [tempFilter, setTempFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let result = leads;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(l => l.business_name.toLowerCase().includes(s) || l.phone.includes(s) || l.niche?.toLowerCase().includes(s));
    }
    if (stageFilter !== 'all') result = result.filter(l => l.stage === stageFilter);
    if (tempFilter !== 'all') result = result.filter(l => l.temperature === tempFilter);
    return result;
  }, [leads, search, stageFilter, tempFilter]);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(l => l.id)));
  };

  const handleBulkDelete = () => {
    if (selected.size > 0) {
      deleteLeads(Array.from(selected));
      setSelected(new Set());
    }
  };

  const exportCSV = () => {
    const headers = ['Nome', 'Telefone', 'Email', 'Nicho', 'Estágio', 'Temperatura', 'Score'];
    const rows = filtered.map(l => [l.business_name, l.phone, l.email || '', l.niche || '', l.stage, l.temperature, l.lead_score]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'contatos.csv'; a.click();
  };

  return (
    <CRMLayout title="Contatos CRM">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar nome, telefone..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Estágio" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {allStages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={tempFilter} onValueChange={setTempFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Temperatura" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {allTemperatures.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 border rounded-md p-0.5">
          <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('table')}><TableIcon className="h-4 w-4" /></Button>
          <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('grid')}><LayoutGrid className="h-4 w-4" /></Button>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />Exportar</Button>
        {selected.size > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}><Trash2 className="h-4 w-4 mr-1" />{selected.size} selecionados</Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"><Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} /></TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Estágio</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Temp.</TableHead>
                  <TableHead>Último contato</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(lead => (
                  <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/crm/contacts/${lead.id}`)}>
                    <TableCell onClick={e => e.stopPropagation()}><Checkbox checked={selected.has(lead.id)} onCheckedChange={() => toggleSelect(lead.id)} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: hashColor(lead.business_name) }}>
                          {lead.business_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{lead.business_name}</p>
                          <p className="text-xs text-muted-foreground">{lead.niche || '—'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{lead.phone}</TableCell>
                    <TableCell><Badge className={`${stageColors[lead.stage]} text-white text-xs`}>{lead.stage}</Badge></TableCell>
                    <TableCell><ScoreBadge score={lead.lead_score} /></TableCell>
                    <TableCell><div className="flex items-center gap-1">{tempIcons[lead.temperature]}<span className="text-xs capitalize">{lead.temperature}</span></div></TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {lead.last_contact_at ? formatDistanceToNow(new Date(lead.last_contact_at), { addSuffix: true, locale: ptBR }) : '—'}
                    </TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank"><MessageCircle className="h-3.5 w-3.5 text-green-500" /></a>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/crm/contacts/${lead.id}`)}><Eye className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(lead => (
            <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/crm/contacts/${lead.id}`)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: hashColor(lead.business_name) }}>
                    {lead.business_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{lead.business_name}</p>
                    <p className="text-xs text-muted-foreground">{lead.niche || lead.phone}</p>
                  </div>
                  <ScoreBadge score={lead.lead_score} />
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${stageColors[lead.stage]} text-white text-xs`}>{lead.stage}</Badge>
                  <div className="flex items-center gap-1">{tempIcons[lead.temperature]}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </CRMLayout>
  );
}
