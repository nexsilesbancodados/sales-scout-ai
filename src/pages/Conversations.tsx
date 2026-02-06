import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLeads } from '@/hooks/use-leads';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { Lead } from '@/types/database';
import { LeadDetailsModal } from '@/components/leads/LeadDetailsModal';
import { temperatureIconsSmall } from '@/constants/lead-icons';
import {
  Search,
  MessageSquare,
  Send,
  Bot,
  User,
  Loader2,
  Eye,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ConversationsPage() {
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { leads, isLoading: leadsLoading } = useLeads({ search: search || undefined });
  const { messages, isLoading: messagesLoading, sendMessage, isSending } = useChatMessages(selectedLead?.id || null);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedLead) return;
    sendMessage({ content: newMessage, senderType: 'user' });
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleViewDetails = () => {
    if (selectedLead) {
      setDetailsOpen(true);
    }
  };

  return (
    <DashboardLayout
      title="Conversas"
      description="Visualize e gerencie conversas com seus leads"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-340px)]">
              {leadsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : leads.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground px-4">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhuma conversa encontrada</p>
                </div>
              ) : (
                <div className="divide-y">
                  {leads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                        selectedLead?.id === lead.id ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {lead.business_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{lead.business_name}</p>
                            {temperatureIconsSmall[lead.temperature]}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {lead.conversation_summary || 'Sem mensagens'}
                          </p>
                          {lead.last_contact_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(lead.last_contact_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {lead.stage}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedLead ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedLead.business_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{selectedLead.business_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedLead.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {temperatureIconsSmall[selectedLead.temperature]}
                    <Badge>{selectedLead.stage}</Badge>
                    <Button variant="outline" size="sm" onClick={handleViewDetails}>
                      <Eye className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
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
                                selectedLead.business_name[0]
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
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isSending}
                    />
                    <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Selecione uma conversa</p>
                <p className="text-sm">Escolha um lead para ver o histórico de mensagens</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Lead Details Modal */}
      <LeadDetailsModal
        lead={selectedLead}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </DashboardLayout>
  );
}
