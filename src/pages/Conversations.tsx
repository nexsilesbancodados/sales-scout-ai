import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/ui/empty-state';
import { useConversations, ConversationSummary } from '@/hooks/use-conversations';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { useUserSettings } from '@/hooks/use-user-settings';
import { LeadDetailsModal } from '@/components/leads/LeadDetailsModal';
import { QuickReplies } from '@/components/chat/QuickReplies';
import { MediaUpload } from '@/components/chat/MediaUpload';
import { AIReplyButton } from '@/components/chat/AIReplyButton';
import { temperatureIconsSmall } from '@/constants/lead-icons';
import {
  Search,
  MessageSquare,
  Send,
  Bot,
  User,
  Loader2,
  Eye,
  Sparkles,
  MessageCircle,
  CheckCheck,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ConversationsPage() {
  const [search, setSearch] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<ConversationSummary | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { conversations, isLoading: conversationsLoading } = useConversations(search || undefined);
  const { messages, isLoading: messagesLoading, sendMessage, isSending } = useChatMessages(selectedConversation?.lead.id || null);
  const { settings } = useUserSettings();

  // Auto-select first conversation with messages
  useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      const firstWithMessages = conversations.find(c => c.hasMessages);
      if (firstWithMessages) {
        setSelectedConversation(firstWithMessages);
      }
    }
  }, [conversations, selectedConversation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
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
    if (selectedConversation) {
      setDetailsOpen(true);
    }
  };

  const handleQuickReply = (message: string) => {
    setNewMessage(message);
  };

  const handleAIReply = (message: string) => {
    setNewMessage(message);
  };

  const lastLeadMessage = messages
    .filter(m => m.sender_type === 'lead')
    .slice(-1)[0]?.content;

  // Filter conversations - show all but highlight those with messages
  const activeConversations = conversations.filter(c => c.hasMessages);
  const inactiveConversations = conversations.filter(c => !c.hasMessages);

  return (
    <DashboardLayout
      title="Conversas"
      description="Conversas do WhatsApp em tempo real"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] animate-fade-in">
        {/* Conversations List */}
        <Card className="lg:col-span-1 overflow-hidden">
          <CardHeader className="pb-3 bg-muted/30 border-b">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <span className="font-semibold">WhatsApp</span>
                {settings?.whatsapp_connected && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
                    Conectado
                  </Badge>
                )}
              </div>
              {activeConversations.length > 0 && (
                <Badge className="rounded-full">{activeConversations.length} ativas</Badge>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                className="pl-10 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-340px)]">
              {conversationsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : conversations.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="Nenhuma conversa"
                  description="Conecte o WhatsApp e capture leads para ver conversas"
                  className="py-12"
                />
              ) : (
                <div className="divide-y">
                  {/* Active conversations with messages */}
                  {activeConversations.map((conv, index) => (
                    <button
                      key={conv.lead.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 text-left transition-all duration-200 ${
                        selectedConversation?.lead.id === conv.lead.id 
                          ? 'bg-primary/5 border-l-2 border-l-primary' 
                          : 'hover:bg-muted/50'
                      }`}
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-11 w-11 ring-2 ring-offset-2 ring-transparent transition-all">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {conv.lead.business_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          {conv.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
                              {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold truncate ${conv.unreadCount > 0 ? 'text-foreground' : ''}`}>
                              {conv.lead.business_name}
                            </p>
                            {temperatureIconsSmall[conv.lead.temperature || 'morno']}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {conv.lastMessage?.sender_type !== 'lead' && (
                              <CheckCheck className="h-3 w-3 text-primary shrink-0" />
                            )}
                            <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                              {conv.lastMessage?.content || 'Sem mensagens'}
                            </p>
                          </div>
                          {conv.lastMessage && (
                            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(conv.lastMessage.sent_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary" className="shrink-0 rounded-full text-xs">
                          {conv.lead.stage}
                        </Badge>
                      </div>
                    </button>
                  ))}

                  {/* Separator if there are both active and inactive */}
                  {activeConversations.length > 0 && inactiveConversations.length > 0 && (
                    <div className="px-4 py-2 bg-muted/50">
                      <span className="text-xs text-muted-foreground">Leads sem conversas</span>
                    </div>
                  )}

                  {/* Inactive conversations (no messages) */}
                  {inactiveConversations.slice(0, 10).map((conv) => (
                    <button
                      key={conv.lead.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-3 text-left transition-all duration-200 opacity-60 hover:opacity-100 ${
                        selectedConversation?.lead.id === conv.lead.id 
                          ? 'bg-primary/5 border-l-2 border-l-primary' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                            {conv.lead.business_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{conv.lead.business_name}</p>
                          <p className="text-xs text-muted-foreground">{conv.lead.phone}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b bg-muted/30 py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {selectedConversation.lead.business_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{selectedConversation.lead.business_name}</CardTitle>
                    <p className="text-sm text-muted-foreground font-mono">{selectedConversation.lead.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Auto-reply toggle */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                      <Switch
                        id="auto-reply"
                        checked={autoReplyEnabled}
                        onCheckedChange={setAutoReplyEnabled}
                        className="scale-90"
                      />
                      <Label htmlFor="auto-reply" className="text-xs flex items-center gap-1 font-medium">
                        <Sparkles className="h-3 w-3" />
                        Auto
                      </Label>
                    </div>
                    {temperatureIconsSmall[selectedConversation.lead.temperature || 'morno']}
                    <Badge className="rounded-full">{selectedConversation.lead.stage}</Badge>
                    <Button variant="outline" size="sm" onClick={handleViewDetails} className="rounded-full">
                      <Eye className="h-4 w-4 mr-1.5" />
                      Detalhes
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : messages.length === 0 ? (
                    <EmptyState
                      icon={MessageSquare}
                      title="Nenhuma mensagem"
                      description="Inicie uma conversa com este lead"
                      className="py-12"
                    />
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div
                          key={message.id}
                          className={`flex items-end gap-2 animate-fade-in ${
                            message.sender_type === 'lead' ? '' : 'flex-row-reverse'
                          }`}
                          style={{ animationDelay: `${index * 0.02}s` }}
                        >
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback
                              className={
                                message.sender_type === 'agent'
                                  ? 'bg-success text-success-foreground'
                                  : message.sender_type === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }
                            >
                              {message.sender_type === 'agent' ? (
                                <Bot className="h-4 w-4" />
                              ) : message.sender_type === 'user' ? (
                                <User className="h-4 w-4" />
                              ) : (
                                selectedConversation.lead.business_name[0]
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
                              message.sender_type === 'lead'
                                ? 'bg-muted rounded-bl-sm'
                                : message.sender_type === 'agent'
                                ? 'bg-success text-success-foreground rounded-br-sm'
                                : 'bg-primary text-primary-foreground rounded-br-sm'
                            }`}
                          >
                            {message.sender_type === 'agent' && (
                              <div className="flex items-center gap-1 text-xs opacity-80 mb-1">
                                <Bot className="h-3 w-3" />
                                <span>IA</span>
                              </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            <div className={`flex items-center gap-1 mt-2 ${
                              message.sender_type === 'lead' ? 'text-muted-foreground' : 'opacity-70'
                            }`}>
                              <span className="text-xs">
                                {formatDistanceToNow(new Date(message.sent_at), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </span>
                              {message.sender_type !== 'lead' && message.status === 'sent' && (
                                <CheckCheck className="h-3 w-3 text-primary" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Quick Replies */}
                <QuickReplies 
                  onSelectReply={handleQuickReply} 
                  leadName={selectedConversation.lead.business_name}
                />

                {/* Message Input */}
                <div className="p-4 border-t bg-muted/20">
                  <div className="flex gap-2">
                    {/* Media Upload */}
                    {settings?.whatsapp_instance_id && (
                      <MediaUpload
                        leadPhone={selectedConversation.lead.phone}
                        instanceId={settings.whatsapp_instance_id}
                        onMediaSent={() => {}}
                      />
                    )}

                    {/* AI Reply Button */}
                    <AIReplyButton
                      leadId={selectedConversation.lead.id}
                      lastMessage={lastLeadMessage}
                      onUseReply={handleAIReply}
                    />

                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isSending}
                      className="flex-1 h-11"
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={isSending || !newMessage.trim()}
                      className="h-11 px-5"
                    >
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
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={MessageSquare}
                title="Selecione uma conversa"
                description="Escolha um lead na lista para ver o histórico de mensagens"
              />
            </div>
          )}
        </Card>
      </div>

      {/* Lead Details Modal */}
      <LeadDetailsModal
        lead={selectedConversation?.lead as any}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </DashboardLayout>
  );
}
