import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useConversations, ConversationSummary } from '@/hooks/use-conversations';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { QuickReplies } from '@/components/chat/QuickReplies';
import { AIReplyButton } from '@/components/chat/AIReplyButton';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Search, Loader2, MessageCircle, Send, Bot, Flame, ThermometerSun,
  Snowflake, Phone, ExternalLink, User, ArrowLeft, Zap, Sparkles,
  Filter, Tag,
} from 'lucide-react';

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 55%, 50%)`;
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const tempIcon = (t: string | null) => {
  if (t === 'quente') return <Flame className="h-3 w-3 text-red-500" />;
  if (t === 'morno') return <ThermometerSun className="h-3 w-3 text-amber-500" />;
  return <Snowflake className="h-3 w-3 text-blue-500" />;
};

function ConversationItem({ conv, isActive, onClick }: {
  conv: ConversationSummary; isActive: boolean; onClick: () => void;
}) {
  const lead = conv.lead;
  const lastMsg = conv.lastMessage;
  
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 cursor-pointer transition-all duration-150 border-b border-border/30 hover:bg-accent/50 ${
        isActive ? 'bg-primary/10 border-l-2 border-l-primary' : ''
      }`}
    >
      <div className="relative shrink-0">
        <div className="h-11 w-11 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: hashColor(lead.business_name) }}>
          {getInitials(lead.business_name)}
        </div>
        {conv.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-primary flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary-foreground">{conv.unreadCount}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold' : 'font-medium'}`}>{lead.business_name}</p>
          {lastMsg && (
            <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
              {formatDistanceToNow(new Date(lastMsg.sent_at), { locale: ptBR, addSuffix: false })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {tempIcon(lead.temperature)}
          <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            {lastMsg
              ? `${lastMsg.sender_type === 'lead' ? '' : 'Você: '}${lastMsg.content.slice(0, 50)}${lastMsg.content.length > 50 ? '...' : ''}`
              : 'Nenhuma mensagem'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

function ChatPanel({ leadId, lead, onBack }: {
  leadId: string;
  lead: any;
  onBack: () => void;
}) {
  const { messages, isLoading, sendMessage, isSending } = useChatMessages(leadId);
  const [msgInput, setMsgInput] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!msgInput.trim()) return;
    sendMessage({ content: msgInput, senderType: 'user' });
    setMsgInput('');
  };

  const lastLeadMessage = [...messages].reverse().find(m => m.sender_type === 'lead');

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="shrink-0 p-3 border-b border-border/50 flex items-center gap-3 bg-card">
        <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden shrink-0" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: hashColor(lead.business_name) }}>
          {getInitials(lead.business_name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{lead.business_name}</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">{lead.phone}</p>
            {lead.niche && <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">{lead.niche}</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/crm/contacts/${leadId}`)}>
                <User className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver perfil</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Abrir WhatsApp</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-3">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {!isLoading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm">Nenhuma mensagem ainda</p>
              <p className="text-xs">Envie a primeira mensagem para iniciar a conversa</p>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender_type === 'lead' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                msg.sender_type === 'lead'
                  ? 'bg-card border border-border/50 rounded-bl-md'
                  : msg.sender_type === 'agent'
                  ? 'bg-purple-500 text-white rounded-br-md'
                  : 'bg-emerald-500 text-white rounded-br-md'
              }`}>
                {msg.sender_type === 'agent' && (
                  <div className="flex items-center gap-1 mb-1 opacity-70">
                    <Bot className="h-3 w-3" />
                    <span className="text-[10px]">Agente IA</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 ${
                  msg.sender_type === 'lead' ? 'text-muted-foreground' : 'opacity-70'
                }`}>
                  <span className="text-[10px]">{format(new Date(msg.sent_at), 'HH:mm')}</span>
                  {(msg.status as string) === 'sending' && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick replies */}
      {showQuickReplies && (
        <QuickReplies
          onSelectReply={(msg) => { setMsgInput(msg); setShowQuickReplies(false); }}
          leadName={lead.business_name}
        />
      )}

      {/* Input */}
      <div className="shrink-0 p-3 border-t border-border/50 bg-card">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => setShowQuickReplies(!showQuickReplies)}>
                <Zap className={`h-4 w-4 ${showQuickReplies ? 'text-primary' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Respostas rápidas</TooltipContent>
          </Tooltip>
          <AIReplyButton
            leadId={leadId}
            lastMessage={lastLeadMessage?.content}
            onUseReply={(msg) => setMsgInput(msg)}
          />
          <Input
            placeholder="Digite uma mensagem..."
            value={msgInput}
            onChange={e => setMsgInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1 rounded-xl"
          />
          <Button size="icon" className="h-9 w-9 rounded-xl shrink-0" onClick={handleSend} disabled={isSending || !msgInput.trim()}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CRMInboxPage() {
  const [search, setSearch] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'hot'>('all');
  const { conversations, isLoading } = useConversations(search);

  const filtered = useMemo(() => {
    let result = conversations;
    if (filterType === 'unread') result = result.filter(c => c.unreadCount > 0);
    if (filterType === 'hot') result = result.filter(c => c.lead.temperature === 'quente');
    return result;
  }, [conversations, filterType]);

  const selectedConv = useMemo(() => filtered.find(c => c.lead.id === selectedLeadId), [filtered, selectedLeadId]);
  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <div className="flex h-[calc(100vh-56px)] md:h-screen overflow-hidden">
      {/* Conversation list */}
      <div className={`w-full md:w-[340px] lg:w-[380px] border-r border-border/50 flex flex-col bg-background shrink-0 ${selectedLeadId ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-3 border-b border-border/50 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base">Conversas</h2>
              {totalUnread > 0 && (
                <Badge className="bg-primary text-primary-foreground h-5 min-w-5 px-1.5 rounded-full text-[10px]">{totalUnread}</Badge>
              )}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-xl text-sm"
            />
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'unread', label: 'Não lidas' },
              { key: 'hot', label: '🔥 Quentes' },
            ].map(f => (
              <Button
                key={f.key}
                variant={filterType === f.key ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs rounded-lg"
                onClick={() => setFilterType(f.key as any)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* List */}
        <ScrollArea className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground px-4">
              <MessageCircle className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm text-center">Nenhuma conversa encontrada</p>
            </div>
          ) : (
            filtered.map(conv => (
              <ConversationItem
                key={conv.lead.id}
                conv={conv}
                isActive={selectedLeadId === conv.lead.id}
                onClick={() => setSelectedLeadId(conv.lead.id)}
              />
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat panel */}
      <div className={`flex-1 min-w-0 ${!selectedLeadId ? 'hidden md:flex' : 'flex'}`}>
        {selectedConv ? (
          <ChatPanel
            leadId={selectedConv.lead.id}
            lead={selectedConv.lead}
            onBack={() => setSelectedLeadId(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <MessageCircle className="h-10 w-10 text-primary/50" />
            </div>
            <p className="text-lg font-semibold mb-1">Inbox do CRM</p>
            <p className="text-sm">Selecione uma conversa para responder</p>
          </div>
        )}
      </div>
    </div>
  );
}
