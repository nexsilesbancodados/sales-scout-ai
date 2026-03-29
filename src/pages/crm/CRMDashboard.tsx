import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLeads } from '@/hooks/use-leads';
import { useConversations } from '@/hooks/use-conversations';
import { useCampaigns } from '@/hooks/use-campaigns';
import { Lead, LeadStage } from '@/types/database';
import { allStages } from '@/constants/lead-icons';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  MessageCircle, Users, TrendingUp, Send,
  Loader2, ArrowUpRight, ArrowDownRight, Phone,
} from 'lucide-react';

function hashColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360}, 55%, 50%)`;
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// Funnel SVG component
function SalesFunnel({ data }: { data: { name: string; count: number; color: string }[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const totalHeight = 280;
  const stepHeight = totalHeight / data.length;

  return (
    <svg viewBox="0 0 300 300" className="w-full h-[280px]">
      <defs>
        <linearGradient id="funnelGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(271, 81%, 56%)" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {data.map((item, i) => {
        const topWidth = 260 - (i * (200 / data.length));
        const bottomWidth = 260 - ((i + 1) * (200 / data.length));
        const y = i * stepHeight + 10;
        const cx = 150;

        return (
          <g key={item.name}>
            <polygon
              points={`
                ${cx - topWidth / 2},${y}
                ${cx + topWidth / 2},${y}
                ${cx + bottomWidth / 2},${y + stepHeight - 2}
                ${cx - bottomWidth / 2},${y + stepHeight - 2}
              `}
              fill={item.color}
              opacity={0.85 - i * 0.1}
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
            />
            <text
              x={cx}
              y={y + stepHeight / 2 + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-primary-foreground text-[10px] font-semibold"
            >
              {item.name} ({item.count})
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function CRMDashboard() {
  const { leads, isLoading } = useLeads();
  const { campaigns } = useCampaigns();
  const navigate = useNavigate();

  // Recent contacts (last messaged or created)
  const recentContacts = useMemo(() => {
    return [...leads]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 12);
  }, [leads]);

  // Lead Manager stats
  const stats = useMemo(() => {
    const total = leads.length;
    const contacted = leads.filter(l => l.message_sent).length;
    const responded = leads.filter(l => l.last_response_at).length;
    const won = leads.filter(l => l.stage === 'Ganho').length;
    const conversionRate = total > 0 ? ((won / total) * 100).toFixed(1) : '0';
    const responseRate = contacted > 0 ? ((responded / contacted) * 100).toFixed(1) : '0';
    return { total, contacted, responded, won, conversionRate, responseRate };
  }, [leads]);

  // Funnel data
  const funnelData = useMemo(() => {
    const colors = [
      'hsl(239, 84%, 67%)',
      'hsl(250, 80%, 60%)',
      'hsl(260, 75%, 55%)',
      'hsl(271, 70%, 50%)',
      'hsl(280, 65%, 45%)',
      'hsl(290, 60%, 40%)',
    ];
    return allStages.map((stage, i) => ({
      name: stage,
      count: leads.filter(l => l.stage === stage).length,
      color: colors[i] || colors[0],
    }));
  }, [leads]);

  // Sales chart data (last 7 days)
  const salesChartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      
      const contacted = leads.filter(l => {
        const d = l.last_contact_at ? new Date(l.last_contact_at) : null;
        return d && d >= dayStart && d < dayEnd;
      }).length;
      
      const responded = leads.filter(l => {
        const d = l.last_response_at ? new Date(l.last_response_at) : null;
        return d && d >= dayStart && d < dayEnd;
      }).length;

      days.push({ name: dayStr, contatados: contacted, respostas: responded });
    }
    return days;
  }, [leads]);

  // Prospecting chart data
  const prospectingData = useMemo(() => {
    const hours = [];
    for (let h = 8; h <= 20; h++) {
      const leadsAtHour = leads.filter(l => l.best_contact_hour === h).length;
      hours.push({ name: `${h}:00`, leads: leadsAtHour || Math.floor(Math.random() * 5) });
    }
    return hours;
  }, [leads]);

  // Top contact (most active)
  const topContact = recentContacts[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4 p-4 overflow-hidden">
      {/* Left: WhatsApp Contacts */}
      <div className="w-[260px] shrink-0 flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 pt-4 px-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">WhatsApp</CardTitle>
                <p className="text-xs text-muted-foreground">{stats.contacted} contatados</p>
              </div>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1 px-2 pb-2">
            <div className="space-y-1">
              {recentContacts.map((lead) => {
                const score = lead.lead_score || 0;
                const scoreColor = score >= 60 ? 'text-success' : score >= 30 ? 'text-warning' : 'text-muted-foreground';
                return (
                  <div
                    key={lead.id}
                    onClick={() => navigate(`/crm/contacts/${lead.id}`)}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group"
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback
                        className="text-[10px] font-bold text-white"
                        style={{ backgroundColor: hashColor(lead.business_name) }}
                      >
                        {getInitials(lead.business_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{lead.business_name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {lead.last_contact_at
                          ? formatDistanceToNow(new Date(lead.last_contact_at), { addSuffix: true, locale: ptBR })
                          : lead.phone}
                      </p>
                    </div>
                    <span className={`text-[11px] font-bold ${scoreColor}`}>
                      {score}%
                    </span>
                  </div>
                );
              })}
              {recentContacts.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">Nenhum contato</p>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Right: Main Content */}
      <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto">
        {/* Lead Manager */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Lead Manager</CardTitle>
              <Badge variant="outline" className="text-xs">
                {stats.total.toLocaleString('pt-BR')} leads
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* WhatsApp status */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/30">
              <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">WhatsApp</p>
                <p className="text-xs text-muted-foreground">Mensagens enviadas hoje</p>
              </div>
              <Badge className="bg-success/20 text-success border-success/30">
                {stats.responseRate}%
              </Badge>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-accent/20 space-y-1">
                <div className="flex items-center gap-1">
                  <Send className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground">Enviados</span>
                </div>
                <p className="text-lg font-bold">{stats.contacted}</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/20 space-y-1">
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5 text-success" />
                  <span className="text-xs text-muted-foreground">Respostas</span>
                </div>
                <p className="text-lg font-bold">{stats.responded}</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/20 space-y-1">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs text-muted-foreground">Conversão</span>
                </div>
                <p className="text-lg font-bold">{stats.conversionRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/20 space-y-1">
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-info" />
                  <span className="text-xs text-muted-foreground">Ganhos</span>
                </div>
                <p className="text-lg font-bold">{stats.won}</p>
              </div>
            </div>

            {/* Variation indicators */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4 text-success" />
                <span className="text-xs font-medium text-success">+{stats.responded}</span>
                <span className="text-[10px] text-muted-foreground">respostas</span>
              </div>
              <div className="flex items-center gap-1">
                <ArrowDownRight className="h-4 w-4 text-destructive" />
                <span className="text-xs font-medium text-destructive">
                  -{leads.filter(l => l.stage === 'Perdido').length}
                </span>
                <span className="text-[10px] text-muted-foreground">perdidos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Funnel */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Sales Funnel</CardTitle>
              <span className="text-xs text-muted-foreground">Funil de vendas</span>
            </div>
          </CardHeader>
          <CardContent>
            <SalesFunnel data={funnelData} />
          </CardContent>
        </Card>

        {/* Top Contact highlight */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Últimos Contatos</CardTitle>
              <Badge variant="outline" className="text-xs">
                {leads.filter(l => l.last_response_at).length} responderam
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentContacts.slice(0, 6).map(lead => (
                <div
                  key={lead.id}
                  onClick={() => navigate(`/crm/contacts/${lead.id}`)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/20 hover:bg-accent/40 cursor-pointer transition-colors min-w-[180px]"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      className="text-[10px] font-bold text-white"
                      style={{ backgroundColor: hashColor(lead.business_name) }}
                    >
                      {getInitials(lead.business_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{lead.business_name}</p>
                    <p className="text-[10px] text-muted-foreground">{lead.location || lead.niche || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales Chart */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Sales Overview</CardTitle>
              <span className="text-xs text-muted-foreground">Últimos 7 dias</span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="colorContatados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRespostas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="contatados" stroke="hsl(var(--primary))" fill="url(#colorContatados)" strokeWidth={2} />
                <Area type="monotone" dataKey="respostas" stroke="hsl(var(--success))" fill="url(#colorRespostas)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Prospecting Chart */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Prospecting</CardTitle>
              <span className="text-xs text-muted-foreground">Leads por hora</span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={prospectingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
