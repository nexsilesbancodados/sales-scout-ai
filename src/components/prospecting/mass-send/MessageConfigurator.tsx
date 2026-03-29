import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Send,
  Loader2,
  Sparkles,
  AlertCircle,
  Activity,
  Zap,
  MessageSquare,
  Filter,
  Briefcase,
  Users,
} from 'lucide-react';
import { Lead } from '@/types/database';

export const AVAILABLE_SERVICES = [
  { id: 'auto', label: 'IA Automática', description: 'IA analisa o lead e oferece o serviço ideal' },
  { id: 'all', label: 'Todos os Serviços', description: 'Usar serviços configurados no perfil' },
  { id: 'trafego_pago', label: 'Tráfego Pago', description: 'Gestão de anúncios e campanhas pagas' },
  { id: 'automacao', label: 'Automação', description: 'Automação de processos e sistemas' },
  { id: 'social_media', label: 'Social Media', description: 'Gestão de redes sociais' },
  { id: 'websites', label: 'Sites e Landing Pages', description: 'Criação de sites e páginas' },
  { id: 'seo', label: 'SEO', description: 'Otimização para buscadores' },
  { id: 'design', label: 'Design Gráfico', description: 'Identidade visual e materiais' },
  { id: 'consultoria', label: 'Consultoria', description: 'Consultoria em marketing digital' },
];

export const LEAD_FILTERS = [
  { id: 'all', label: 'Todos os Leads', description: 'Sem filtro de características' },
  { id: 'no_website', label: 'Sem Site', description: 'Empresas que não possuem website' },
  { id: 'low_rating', label: 'Avaliação Baixa', description: 'Menos de 4 estrelas no Google' },
  { id: 'few_reviews', label: 'Poucos Reviews', description: 'Menos de 10 avaliações' },
  { id: 'no_social', label: 'Sem Redes Sociais', description: 'Sem Instagram/Facebook cadastrado' },
  { id: 'small_business', label: 'Pequenos Negócios', description: 'Perfil de microempresa' },
  { id: 'premium', label: 'Leads Premium', description: 'Alta avaliação e muitos reviews' },
];

interface MessageConfiguratorProps {
  sendMode: 'template' | 'direct';
  setSendMode: (mode: 'template' | 'direct') => void;
  massMessage: string;
  setMassMessage: (msg: string) => void;
  useAIPersonalization: boolean;
  setUseAIPersonalization: (val: boolean) => void;
  selectedService: string;
  setSelectedService: (val: string) => void;
  leadFilter: string;
  setLeadFilter: (val: string) => void;
  previewMessage: string;
  previewLead: string | null;
  isGeneratingPreview: boolean;
  leadsToSendCount: number;
  hasActiveMassSend: boolean;
  isCreating: boolean;
  canSend: boolean;
  onSend: () => void;
  leads: Lead[];
  messageIntervalSeconds?: number | null;
}

export function MessageConfigurator({
  sendMode,
  setSendMode,
  massMessage,
  setMassMessage,
  useAIPersonalization,
  setUseAIPersonalization,
  selectedService,
  setSelectedService,
  leadFilter,
  setLeadFilter,
  previewMessage,
  previewLead,
  isGeneratingPreview,
  leadsToSendCount,
  hasActiveMassSend,
  isCreating,
  canSend,
  onSend,
  leads,
  messageIntervalSeconds,
}: MessageConfiguratorProps) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4 text-primary" />
            Filtros Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Users className="h-3.5 w-3.5" />
                Tipo de Empresa
              </Label>
              <Select value={leadFilter} onValueChange={setLeadFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_FILTERS.map((filter) => (
                    <SelectItem key={filter.id} value={filter.id}>
                      <div>
                        <span className="text-sm">{filter.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">— {filter.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Briefcase className="h-3.5 w-3.5" />
                Serviço a Oferecer
              </Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_SERVICES.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div>
                        <span className="text-sm">{service.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">— {service.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedService === 'auto' && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/15">
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
              <p className="text-xs text-primary">
                A IA vai analisar cada lead e oferecer o serviço mais adequado automaticamente
              </p>
            </div>
          )}

          {leadFilter === 'no_website' && selectedService === 'auto' && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-warning/10 border border-warning/20">
              <Sparkles className="h-4 w-4 text-warning flex-shrink-0" />
              <p className="text-xs text-warning">
                💡 Para empresas sem site, considere selecionar "Sites e Landing Pages" diretamente
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Config */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Configurar Mensagem
          </CardTitle>
          <CardDescription>
            Escolha como as mensagens serão geradas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={sendMode} onValueChange={(v) => setSendMode(v as 'template' | 'direct')}>
            <TabsList className="grid w-full grid-cols-2 h-10">
              <TabsTrigger value="template" className="gap-2 text-sm">
                <MessageSquare className="h-4 w-4" />
                Com Template
              </TabsTrigger>
              <TabsTrigger value="direct" className="gap-2 text-sm">
                <Zap className="h-4 w-4" />
                IA Direta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="template" className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <Label htmlFor="ai-personalization" className="text-sm font-medium">Personalização com IA</Label>
                  <p className="text-xs text-muted-foreground">Adapta tom e conteúdo para cada nicho</p>
                </div>
                <Switch
                  id="ai-personalization"
                  checked={useAIPersonalization}
                  onCheckedChange={setUseAIPersonalization}
                />
              </div>

              <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/50">
                <AlertCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  Variáveis: <code className="bg-muted px-1 rounded text-primary">{'{empresa}'}</code> <code className="bg-muted px-1 rounded text-primary">{'{nicho}'}</code> <code className="bg-muted px-1 rounded text-primary">{'{cidade}'}</code>
                </p>
              </div>

              <Textarea
                placeholder={`Olá! Vi que a {empresa} atua no segmento de {nicho} em {cidade}. Tenho uma solução que pode ajudar vocês a crescer...`}
                value={massMessage}
                onChange={(e) => setMassMessage(e.target.value)}
                rows={5}
                className="resize-none text-sm"
              />

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{massMessage.length} caracteres</span>
                <span>{leadsToSendCount} destinatários</span>
              </div>
            </TabsContent>

            <TabsContent value="direct" className="space-y-4 mt-4">
              <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-sm">Disparo Direto com IA</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  A IA gera uma mensagem única para cada lead baseada nos dados do lead, persona do agente, serviço selecionado e base de conhecimento.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['Mensagens únicas', 'Menor chance de ban', 'Sem template', 'Ultra personalizado'].map(benefit => (
                    <div key={benefit} className="flex items-center gap-1.5 text-[11px] text-primary">
                      <span className="h-1 w-1 rounded-full bg-primary" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-sm text-muted-foreground text-center py-2">
                <span className="text-2xl font-bold text-foreground">{leadsToSendCount}</span>
                <span className="ml-1">leads selecionados</span>
              </div>
            </TabsContent>
          </Tabs>

          {/* Preview */}
          {previewMessage && previewLead && (
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Prévia: {leads.find(l => l.id === previewLead)?.business_name}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {leads.find(l => l.id === previewLead)?.niche || 'Sem nicho'}
                </Badge>
              </div>
              {isGeneratingPreview ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando prévia com IA...
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap bg-background p-3 rounded-md border">{previewMessage}</p>
              )}
            </div>
          )}

          {/* Send Button */}
          <Button
            className="w-full h-12 text-base font-semibold gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all"
            onClick={onSend}
            disabled={isCreating || hasActiveMassSend || !canSend}
          >
            {isCreating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : hasActiveMassSend ? (
              <Activity className="h-5 w-5 animate-pulse" />
            ) : sendMode === 'direct' ? (
              <Zap className="h-5 w-5" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            {hasActiveMassSend
              ? 'Envio em andamento...'
              : sendMode === 'direct'
                ? `Disparar IA Direta — ${leadsToSendCount} leads`
                : `Enviar para ${leadsToSendCount} leads${useAIPersonalization ? ' (com IA)' : ''}`
            }
          </Button>

          {messageIntervalSeconds && messageIntervalSeconds > 0 && (
            <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
              ⚡ Intervalo aleatório de {Math.round(messageIntervalSeconds * 0.5)}s a {Math.round(messageIntervalSeconds * 1.5)}s entre mensagens.
              <br />
              <strong>O envio continua mesmo se você fechar a página.</strong>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
