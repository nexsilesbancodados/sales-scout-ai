import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Lead, LeadStage, LeadTemperature } from '@/types/database';
import { useLeads } from '@/hooks/use-leads';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { temperatureIcons, stageColors, allStages, allTemperatures } from '@/constants/lead-icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  MessageSquare,
  Calendar,
  Tag,
  Star,
  ExternalLink,
  Save,
  Loader2,
  Bot,
  User,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadDetailsModalProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailsModal({ lead, open, onOpenChange }: LeadDetailsModalProps) {
  const { updateLead, isUpdating } = useLeads();
  const { messages, isLoading: messagesLoading } = useChatMessages(lead?.id || null);
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    niche: '',
    location: '',
    stage: 'Contato' as LeadStage,
    temperature: 'morno' as LeadTemperature,
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        business_name: lead.business_name || '',
        phone: lead.phone || '',
        email: lead.email || '',
        website: lead.website || '',
        address: lead.address || '',
        niche: lead.niche || '',
        location: lead.location || '',
        stage: lead.stage,
        temperature: lead.temperature,
      });
      setEditMode(false);
    }
  }, [lead]);

  const handleSave = () => {
    if (!lead) return;
    updateLead({
      id: lead.id,
      ...formData,
    });
    setEditMode(false);
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {lead.business_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">{lead.business_name}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  {temperatureIcons[lead.temperature]}
                  <Badge className={`${stageColors[lead.stage]} text-white`}>
                    {lead.stage}
                  </Badge>
                  {lead.niche && <Badge variant="secondary">{lead.niche}</Badge>}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                    Salvar
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                  Editar
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="conversation">Conversa ({messages.length})</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 overflow-auto">
            <div className="grid gap-4 py-4">
              {editMode ? (
                // Edit Mode
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="business_name">Nome da Empresa</Label>
                      <Input
                        id="business_name"
                        value={formData.business_name}
                        onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="niche">Nicho</Label>
                      <Input
                        id="niche"
                        value={formData.niche}
                        onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Localização</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço Completo</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Estágio</Label>
                      <Select value={formData.stage} onValueChange={(v) => setFormData({ ...formData, stage: v as LeadStage })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allStages.map((stage) => (
                            <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Temperatura</Label>
                      <Select value={formData.temperature} onValueChange={(v) => setFormData({ ...formData, temperature: v as LeadTemperature })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allTemperatures.map((temp) => (
                            <SelectItem key={temp} value={temp} className="capitalize">{temp}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                </div>
              ) : (
                // View Mode
                <div className="space-y-6">
                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Telefone</p>
                        <p className="font-medium">{lead.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">E-mail</p>
                        <p className="font-medium">{lead.email || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Website</p>
                        {lead.website ? (
                          <a href={lead.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline flex items-center gap-1">
                            {lead.website.replace(/https?:\/\//, '')}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <p className="font-medium">-</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Localização</p>
                        <p className="font-medium">{lead.location || lead.address || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Business Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Tag className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Nicho</p>
                        <p className="font-medium">{lead.niche || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Fonte</p>
                        <p className="font-medium">{lead.source || 'Manual'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  {lead.conversation_summary && (
                    <div className="p-4 rounded-lg border bg-card">
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Resumo da Conversa
                      </p>
                      <p className="text-sm text-muted-foreground">{lead.conversation_summary}</p>
                    </div>
                  )}


                  {/* Google Maps Link */}
                  {lead.google_maps_url && (
                    <a
                      href={lead.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <MapPin className="h-4 w-4" />
                      Ver no Google Maps
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="conversation" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[400px] p-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhuma mensagem ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-2 ${
                        message.sender_type === 'lead' ? '' : 'flex-row-reverse'
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback
                          className={
                            message.sender_type === 'agent'
                              ? 'bg-primary text-primary-foreground'
                              : message.sender_type === 'user'
                              ? 'bg-secondary text-secondary-foreground'
                              : 'bg-muted'
                          }
                        >
                          {message.sender_type === 'agent' ? (
                            <Bot className="h-4 w-4" />
                          ) : message.sender_type === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            lead.business_name[0]
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender_type === 'lead'
                            ? 'bg-muted'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender_type === 'lead'
                              ? 'text-muted-foreground'
                              : 'text-primary-foreground/70'
                          }`}
                        >
                          {formatDistanceToNow(new Date(message.sent_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-auto">
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Criado em</p>
                  <p className="font-medium">
                    {format(new Date(lead.created_at), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
              
              {lead.last_contact_at && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Último Contato</p>
                    <p className="font-medium">
                      {formatDistanceToNow(new Date(lead.last_contact_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}
              
              {lead.last_response_at && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Última Resposta</p>
                    <p className="font-medium">
                      {formatDistanceToNow(new Date(lead.last_response_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Follow-ups Enviados</p>
                  <p className="font-medium">{lead.follow_up_count || 0}</p>
                </div>
              </div>

              {lead.next_follow_up_at && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Próximo Follow-up</p>
                    <p className="font-medium text-primary">
                      {format(new Date(lead.next_follow_up_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
