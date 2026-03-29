import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Rocket, Zap, Shield, MessageSquare, Search, BarChart3,
  Users, ArrowRight, Check, Star, ChevronDown, ChevronUp,
  Globe, Bot, Target, Smartphone, Clock, TrendingUp,
  Mail, MapPin, Instagram, Facebook, Menu, X
} from 'lucide-react';
import logoImg from '@/assets/logo.png';
import dashboardMockup from '@/assets/dashboard-mockup.jpg';

const features = [
  {
    icon: Search,
    title: 'Captura Inteligente',
    description: 'Encontre leads automaticamente via Google Maps, CNPJ Radar, Instagram, Facebook e importação em massa.',
  },
  {
    icon: MessageSquare,
    title: 'Disparo via WhatsApp',
    description: 'Envie mensagens personalizadas em escala com sistema anti-ban, spintax e delays humanizados.',
  },
  {
    icon: Bot,
    title: 'Agente SDR com IA',
    description: 'IA que responde, qualifica e agenda reuniões automaticamente enquanto você foca no fechamento.',
  },
  {
    icon: Target,
    title: 'CRM Completo',
    description: 'Pipeline visual, qualificação BANT, follow-ups automáticos e gestão completa do funil de vendas.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Avançado',
    description: 'Métricas de conversão, análise por nicho, horários ideais e performance de templates em tempo real.',
  },
  {
    icon: Shield,
    title: 'Sistema Anti-Ban',
    description: 'Warmup progressivo, rotação de chips, limites inteligentes e monitoramento de saúde do número.',
  },
];

const testimonials = [
  {
    name: 'Rafael Oliveira',
    role: 'CEO, Agência Digital ROX',
    content: 'Em 2 semanas usando o NexaProspect, conseguimos 3x mais reuniões agendadas do que no mês inteiro anterior. A automação é impressionante.',
    rating: 5,
  },
  {
    name: 'Camila Santos',
    role: 'Fundadora, CS Marketing',
    content: 'O agente SDR mudou completamente nosso jogo. Ele responde leads às 2h da manhã e já qualifica antes de eu acordar.',
    rating: 5,
  },
  {
    name: 'Lucas Mendes',
    role: 'Diretor Comercial, TechFlow',
    content: 'Testei várias ferramentas de prospecção. O NexaProspect é a única que combina captura + disparo + IA num só lugar.',
    rating: 5,
  },
  {
    name: 'Fernanda Lima',
    role: 'Head de Vendas, GrowUp',
    content: 'O sistema anti-ban nos deu tranquilidade total. Nenhum número bloqueado em 4 meses de uso intensivo.',
    rating: 5,
  },
];

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 97,
    description: 'Para quem está começando a prospectar',
    features: ['Disparos ilimitados', '1 chip WhatsApp', 'Google Maps + CNPJ Radar', 'Funil de vendas', 'Leads ilimitados', 'Suporte por email'],
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 149,
    description: 'Para quem quer escalar resultados',
    features: ['Tudo do Starter', '3 chips WhatsApp', 'Todos os extratores', 'Agente SDR com IA', 'Relatórios avançados', 'A/B Testing', 'Suporte prioritário'],
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    description: 'Para operações de alta performance',
    features: ['Tudo do Pro', '10 chips WhatsApp', 'API pública', 'Múltiplos funis', 'Gerente dedicado', 'SLA garantido', 'Onboarding personalizado'],
    highlight: false,
  },
];

const faqs = [
  {
    question: 'Preciso ter um número de WhatsApp separado?',
    answer: 'Sim, recomendamos usar um chip dedicado para prospecção. Nosso sistema anti-ban protege seu número, mas é uma boa prática manter separado do pessoal.',
  },
  {
    question: 'O envio é pelo WhatsApp oficial ou API?',
    answer: 'Usamos a Evolution API que se conecta ao WhatsApp Web. Isso garante que as mensagens sejam enviadas como se fossem manuais, com delays humanizados.',
  },
  {
    question: 'Quantas mensagens posso enviar por dia?',
    answer: 'Depende do aquecimento do chip. Números novos começam com 20/dia e vão escalando progressivamente até 200+/dia. O sistema controla isso automaticamente.',
  },
  {
    question: 'A IA responde em português?',
    answer: 'Sim! O agente SDR é treinado para conversar naturalmente em português, adaptar o tom ao seu negócio e qualificar leads com base nos critérios que você define.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer: 'Sim, sem multa e sem burocracia. Basta cancelar pelo painel e sua assinatura encerra no final do período pago.',
  },
  {
    question: 'Funciona para qualquer nicho?',
    answer: 'Sim! Já temos clientes em mais de 50 nichos: agências, consultorias, SaaS, clínicas, contabilidade, advocacia, construção civil e muito mais.',
  },
];

const stats = [
  { value: '50k+', label: 'Leads capturados' },
  { value: '12k+', label: 'Mensagens enviadas/dia' },
  { value: '3.2x', label: 'Mais reuniões agendadas' },
  { value: '98%', label: 'Uptime da plataforma' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const getPrice = (monthly: number) => isAnnual ? Math.round(monthly * 0.8) : monthly;

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white overflow-x-hidden">
      {/* ═══════════════ NAVBAR ═══════════════ */}
      <nav className="fixed top-0 w-full z-50 bg-[#0A0D14]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="NexaProspect" className="h-8 w-auto" />
              <span className="font-bold text-lg hidden sm:block">NexaProspect</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-400 hover:text-white transition">Funcionalidades</a>
              <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition">Preços</a>
              <a href="#testimonials" className="text-sm text-gray-400 hover:text-white transition">Depoimentos</a>
              <a href="#faq" className="text-sm text-gray-400 hover:text-white transition">FAQ</a>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" className="text-gray-300 hover:text-white">Entrar</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                  Começar grátis <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <button className="md:hidden text-gray-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#111827] border-t border-white/5 p-4 space-y-3">
            <a href="#features" className="block text-sm text-gray-400 py-2" onClick={() => setMobileMenuOpen(false)}>Funcionalidades</a>
            <a href="#pricing" className="block text-sm text-gray-400 py-2" onClick={() => setMobileMenuOpen(false)}>Preços</a>
            <a href="#testimonials" className="block text-sm text-gray-400 py-2" onClick={() => setMobileMenuOpen(false)}>Depoimentos</a>
            <a href="#faq" className="block text-sm text-gray-400 py-2" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <Link to="/auth" className="block" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Começar grátis</Button>
            </Link>
          </div>
        )}
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px]" />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 mb-6 px-4 py-1.5">
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            Prospecção autônoma com IA
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
            Capture leads, envie mensagens
            <br />
            e <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">agende reuniões no piloto automático</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            O NexaProspect encontra seus clientes ideais, inicia conversas via WhatsApp
            e qualifica leads com IA — tudo enquanto você foca no fechamento.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white h-14 px-8 text-lg gap-2 rounded-xl shadow-lg shadow-indigo-500/25">
                <Rocket className="h-5 w-5" />
                Começar agora — é grátis
              </Button>
            </Link>
            <a href="#demo">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/10 text-gray-300 hover:bg-white/5 rounded-xl">
                Ver demonstração
              </Button>
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">Sem cartão de crédito • Setup em 2 minutos • Cancele quando quiser</p>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ DEMO / SCREENSHOT ═══════════════ */}
      <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-indigo-500/5">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-transparent to-transparent z-10 pointer-events-none" />
            <img src={dashboardMockup} alt="Dashboard NexaProspect" className="w-full" />
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 mb-4">Funcionalidades</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">Tudo que você precisa para prospectar em escala</h2>
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
              Da captura ao fechamento, automatize cada etapa do seu processo de vendas.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-6 rounded-2xl bg-[#111827] border border-white/5 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5"
                >
                  <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition">
                    <Icon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#111827]/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mb-4">Como funciona</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">3 passos para agendar reuniões no automático</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: MapPin, title: 'Capture leads', desc: 'Busque empresas por nicho e localização via Google Maps, CNPJ Radar, redes sociais ou importação.' },
              { step: '02', icon: MessageSquare, title: 'Envie mensagens', desc: 'Dispare mensagens personalizadas via WhatsApp com anti-ban, spintax e delays humanizados.' },
              { step: '03', icon: TrendingUp, title: 'Feche negócios', desc: 'A IA qualifica, responde objeções e agenda reuniões. Você só aparece para fechar.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative text-center">
                  <div className="text-6xl font-bold text-indigo-500/10 absolute -top-4 left-1/2 -translate-x-1/2">{item.step}</div>
                  <div className="relative pt-8">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-7 w-7 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 mb-4">Depoimentos</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">Quem usa, recomenda</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl bg-[#111827] border border-white/5">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">"{t.content}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ PRICING ═══════════════ */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#111827]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 mb-4">Preços</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">Invista menos que um almoço por dia</h2>
            <p className="mt-4 text-gray-400">Todos os planos incluem disparos e leads ilimitados.</p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-sm ${!isAnnual ? 'text-white font-medium' : 'text-gray-500'}`}>Mensal</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative w-12 h-6 rounded-full transition-colors ${isAnnual ? 'bg-indigo-600' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
              <span className={`text-sm ${isAnnual ? 'text-white font-medium' : 'text-gray-500'}`}>
                Anual <span className="text-emerald-400 text-xs ml-1">-20%</span>
              </span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 transition-all ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-indigo-500/10 to-[#111827] border-2 border-indigo-500/40 shadow-lg shadow-indigo-500/10 scale-[1.02]'
                    : 'bg-[#111827] border border-white/5'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white shadow-md">
                      <Star className="h-3 w-3 mr-1" /> Mais popular
                    </Badge>
                  </div>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">R$ {getPrice(plan.price)}</span>
                  <span className="text-gray-500">/mês</span>
                </div>
                {isAnnual && (
                  <p className="text-xs text-emerald-400 mt-1">
                    Economia de R$ {(plan.price * 12 - getPrice(plan.price) * 12).toLocaleString()}/ano
                  </p>
                )}
                <Link to="/auth" className="block mt-6">
                  <Button
                    className={`w-full h-11 rounded-xl ${
                      plan.highlight
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                    }`}
                  >
                    Começar agora
                  </Button>
                </Link>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FAQ ═══════════════ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 mb-4">FAQ</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">Perguntas frequentes</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl bg-[#111827] border border-white/5 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-sm pr-4">{faq.question}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 text-gray-500 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-gray-400 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative rounded-3xl bg-gradient-to-br from-indigo-600/20 to-emerald-500/10 border border-indigo-500/20 p-12 sm:p-16 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Pronto para prospectar no piloto automático?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Junte-se a centenas de empresas que já usam o NexaProspect para agendar mais reuniões com menos esforço.
              </p>
              <Link to="/auth">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white h-14 px-10 text-lg gap-2 rounded-xl shadow-lg shadow-indigo-500/25">
                  <Rocket className="h-5 w-5" />
                  Criar conta grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logoImg} alt="NexaProspect" className="h-7 w-auto" />
                <span className="font-bold">NexaProspect</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Plataforma de prospecção autônoma com IA para equipes de vendas que querem escalar resultados.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-white transition">Funcionalidades</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Preços</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-white transition">Sobre nós</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-white transition">Termos de uso</a></li>
                <li><a href="#" className="hover:text-white transition">Política de privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} NexaProspect. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
