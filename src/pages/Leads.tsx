import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLeads } from '@/hooks/use-leads';
import { Lead, LeadStage, LeadTemperature } from '@/types/database';
import { ImportExportLeads } from '@/components/leads/ImportExportLeads';
import {
  Search,
  Plus,
  MoreHorizontal,
  Flame,
  ThermometerSun,
  Snowflake,
  MessageSquare,
  Trash2,
  Eye,
  Loader2,
  Users,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const stageColors: Record<LeadStage, string> = {
  'Contato': 'bg-stage-contact',
  'Qualificado': 'bg-stage-qualified',
  'Proposta': 'bg-stage-proposal',
  'Negociação': 'bg-stage-negotiation',
  'Ganho': 'bg-stage-won',
  'Perdido': 'bg-stage-lost',
};

const temperatureIcons: Record<LeadTemperature, React.ReactNode> = {
  'quente': <Flame className="h-4 w-4 text-temp-hot" />,
  'morno': <ThermometerSun className="h-4 w-4 text-temp-warm" />,
  'frio': <Snowflake className="h-4 w-4 text-temp-cold" />,
};

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<LeadStage | 'all'>('all');
  const [tempFilter, setTempFilter] = useState<LeadTemperature | 'all'>('all');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  const { leads, isLoading, deleteLead, deleteLeads, isDeleting } = useLeads({
    search: search || undefined,
    stage: stageFilter !== 'all' ? stageFilter : undefined,
    temperature: tempFilter !== 'all' ? tempFilter : undefined,
  });

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(l => l.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(s => s !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedLeads.length > 0) {
      deleteLeads(selectedLeads);
      setSelectedLeads([]);
    }
  };

  return (
    <DashboardLayout
      title="Leads"
      description="Gerencie todos os seus leads de prospecção"
      actions={
        <div className="flex items-center gap-2">
          <ImportExportLeads />
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar leads..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filters */}
            <Select value={stageFilter} onValueChange={(v) => setStageFilter(v as LeadStage | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estágio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Contato">Contato</SelectItem>
                <SelectItem value="Qualificado">Qualificado</SelectItem>
                <SelectItem value="Proposta">Proposta</SelectItem>
                <SelectItem value="Negociação">Negociação</SelectItem>
                <SelectItem value="Ganho">Ganho</SelectItem>
                <SelectItem value="Perdido">Perdido</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tempFilter} onValueChange={(v) => setTempFilter(v as LeadTemperature | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Temperatura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="quente">Quente</SelectItem>
                <SelectItem value="morno">Morno</SelectItem>
                <SelectItem value="frio">Frio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedLeads.length > 0 && (
            <div className="flex items-center gap-4 pt-4">
              <span className="text-sm text-muted-foreground">
                {selectedLeads.length} selecionado(s)
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhum lead encontrado</p>
              <p className="text-sm">Inicie uma prospecção ou adicione leads manualmente</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedLeads.length === leads.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Nicho</TableHead>
                    <TableHead>Estágio</TableHead>
                    <TableHead>Temp.</TableHead>
                    <TableHead>Último Contato</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={() => toggleSelect(lead.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{lead.business_name}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{lead.niche || '-'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${stageColors[lead.stage]} text-white`}>
                          {lead.stage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {temperatureIcons[lead.temperature]}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {lead.last_contact_at
                          ? formatDistanceToNow(new Date(lead.last_contact_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Ver conversa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteLead(lead.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
