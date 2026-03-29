import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Rocket, Zap, Shield, MessageSquare, Search, BarChart3,
  Users, ArrowRight, Check, Star, ChevronDown, ChevronUp,
  Bot, Target, TrendingUp, MapPin, Menu, X, Play,
  Sparkles, Lock, Clock, Globe,
} from 'lucide-react';
import logoImg from '@/assets/logo.png';
import heroDashboard from '@/assets/hero-dashboard.jpg';

/* ── Data ── */

const features = [
  { icon: Search, title: 'Captura Inteligente', description: 'Encontre leads via Google Maps, CNPJ Radar, Instagram, Facebook e importação em massa.', color: 'from-violet-500 to-purple-600' },
  { icon: MessageSquare, title: 'Disparo WhatsApp', description: 'Envie mensagens personalizadas em escala com anti-ban, spintax e delays humanizados.', color: 'from-emerald-500 to-teal-600' },
  { icon: Bot, title: 'Agente SDR com IA', description: 'IA que responde, qualifica e agenda reuniões automaticamente enquanto você foca no fechamento.', color: 'from-blue-500 to-indigo-600' },
  { icon: Target, title: 'CRM Completo', description: 'Pipeline visual, qualificação BANT, follow-ups automáticos e gestão completa do funil.', color: 'from-orange-500 to-red-600' },
  { icon: BarChart3, title: 'Analytics Avançado', description: 'Métricas de conversão, análise por nicho, horários ideais e performance em tempo real.', color: 'from-cyan-500 to-blue-600' },
  { icon: Shield, title: 'Sistema Anti-Ban', description: 'Warmup progressivo, rotação de chips, limites inteligentes e monitoramento de saúde.', color: 'from-pink-500 to-rose-600' },
];

const testimonials = [
  { name: 'Rafael Oliveira', role: 'CEO, Agência ROX', content: 'Em 2 semanas, conseguimos 3x mais reuniões agendadas. A automação é impressionante.', avatar: 'RO' },
  { name: 'Camila Santos', role: 'Fundadora, CS Marketing', content: 'O agente SDR responde leads às 2h da manhã e qualifica antes de eu acordar.', avatar: 'CS' },
  { name: 'Lucas Mendes', role: 'Diretor, TechFlow', content: 'Única ferramenta que combina captura + disparo + IA num só lugar. Indispensável.', avatar: 'LM' },
  { name: 'Fernanda Lima', role: 'Head de Vendas, GrowUp', content: 'Nenhum número bloqueado em 4 meses de uso intensivo. O anti-ban funciona de verdade.', avatar: 'FL' },
];

const plans = [
  { id: 'starter', name: 'Starter', price: 97, desc: 'Para quem está começando', features: ['Disparos ilimitados', '1 chip WhatsApp', 'Google Maps + CNPJ', 'Funil de vendas', 'Leads ilimitados', 'Suporte email'], highlight: false },
  { id: 'pro', name: 'Pro', price: 149, desc: 'Para escalar resultados', features: ['Tudo do Starter', '3 chips WhatsApp', 'Todos os extratores', 'Agente SDR com IA', 'Relatórios avançados', 'A/B Testing', 'Suporte prioritário'], highlight: true },
  { id: 'enterprise', name: 'Enterprise', price: 199, desc: 'Alta performance', features: ['Tudo do Pro', '10 chips WhatsApp', 'API pública', 'Múltiplos funis', 'Gerente dedicado', 'SLA garantido', 'Onboarding VIP'], highlight: false },
];

const faqs = [
  { q: 'Preciso ter um número separado?', a: 'Sim, recomendamos um chip dedicado. Nosso sistema anti-ban protege seu número, mas é uma boa prática manter separado.' },
  { q: 'Quantas mensagens posso enviar por dia?', a: 'Números novos começam com 20/dia e escalam progressivamente até 200+/dia. O sistema controla automaticamente.' },
  { q: 'A IA responde em português?', a: 'Sim! O agente SDR conversa naturalmente em português e qualifica leads com base nos critérios que você define.' },
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim, sem multa e sem burocracia. Cancele pelo painel e sua assinatura encerra no final do período.' },
  { q: 'Funciona para qualquer nicho?', a: 'Sim! Mais de 50 nichos atendidos: agências, consultorias, SaaS, clínicas, contabilidade e muito mais.' },
];

const stats = [
  { value: '50k+', label: 'Leads capturados', icon: Users },
  { value: '12k+', label: 'Mensagens/dia', icon: MessageSquare },
  { value: '3.2x', label: 'Mais reuniões', icon: TrendingUp },
  { value: '99.9%', label: 'Uptime', icon: Lock },
];

/* ── Intersection Observer Hook ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const { ref, inView } = useInView();
  return (
    <section ref={ref} id={id} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </section>
  );
}

/* ── Page ── */

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [annual, setAnnual] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  if (user) { navigate('/dashboard', { replace: true }); return null; }

  const price = (m: number) => annual ? Math.round(m * 0.8) : m;

  return (
    <div className="min-h-screen bg-[#060918] text-white overflow-x-hidden">

      {/* ═══ NAVBAR ═══ */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#060918]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            <div className="flex items-center gap-2.5">
              <img src={logoImg} alt="NexaProspect" className="h-9 w-auto" />
              <span className="font-bold text-lg tracking-tight">NexaProspect</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {['features', 'pricing', 'testimonials', 'faq'].map(s => (
                <a key={s} href={`#${s}`} className="text-[13px] text-white/50 hover:text-white transition-colors duration-200 capitalize">
                  {s === 'features' ? 'Funcionalidades' : s === 'pricing' ? 'Preços' : s === 'testimonials' ? 'Depoimentos' : 'FAQ'}
                </a>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link to="/auth"><Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/5">Entrar</Button></Link>
              <Link to="/auth">
                <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/25 border-0 gap-1.5">
                  Começar grátis <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <button className="md:hidden text-white/60" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-[#0B0F1A] border-t border-white/[0.06] p-5 space-y-3 animate-fade-in">
            {['Funcionalidades', 'Preços', 'Depoimentos', 'FAQ'].map((l, i) => (
              <a key={l} href={`#${['features', 'pricing', 'testimonials', 'faq'][i]}`} className="block text-sm text-white/50 py-2" onClick={() => setMobileMenu(false)}>{l}</a>
            ))}
            <Link to="/auth" className="block" onClick={() => setMobileMenu(false)}>
              <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 border-0">Começar grátis</Button>
            </Link>
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-[140px] pb-24 px-4 sm:px-6 lg:px-8">
        {/* Glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-violet-600/[0.12] via-indigo-600/[0.06] to-transparent rounded-full blur-[120px]" />
          <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-blue-600/[0.05] rounded-full blur-[100px]" />
        </div>
        {/* Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[13px] text-white/60 mb-8 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            Prospecção autônoma com Inteligência Artificial
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[68px] font-bold tracking-tight leading-[1.1] mb-6">
            Capture leads e agende
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              reuniões no automático
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/40 max-w-2xl mx-auto leading-relaxed mb-10">
            O NexaProspect encontra seus clientes ideais, inicia conversas via WhatsApp
            e qualifica leads com IA — tudo enquanto você foca no fechamento.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white h-[52px] px-8 text-base gap-2 rounded-xl shadow-xl shadow-violet-600/20 border-0">
                <Rocket className="h-5 w-5" />
                Começar agora — é grátis
              </Button>
            </Link>
            <a href="#demo">
              <Button size="lg" variant="outline" className="h-[52px] px-8 text-base border-white/[0.08] text-white/70 hover:bg-white/[0.04] hover:text-white rounded-xl gap-2 bg-transparent">
                <Play className="h-4 w-4" /> Ver demonstração
              </Button>
            </a>
          </div>
          <p className="text-xs text-white/25">Sem cartão • Setup em 2 min • Cancele quando quiser</p>
        </div>

        {/* Hero Dashboard Image */}
        <div id="demo" className="relative max-w-5xl mx-auto mt-16">
          <div className="absolute -inset-4 bg-gradient-to-b from-violet-600/10 via-transparent to-transparent rounded-3xl blur-2xl pointer-events-none" />
          <div className="relative rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/40">
            <div className="absolute inset-0 bg-gradient-to-t from-[#060918] via-transparent to-transparent z-10 pointer-events-none" />
            <img src={heroDashboard} alt="NexaProspect Dashboard" className="w-full" width={1440} height={900} />
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <Section className="py-16 border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center group">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-3 group-hover:bg-violet-600/10 group-hover:border-violet-600/20 transition-colors">
                  <s.icon className="h-4 w-4 text-white/40 group-hover:text-violet-400 transition-colors" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{s.value}</p>
                <p className="mt-1 text-xs text-white/30">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ FEATURES ═══ */}
      <Section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 section-glow pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600/10 border border-violet-600/20 text-xs text-violet-400 mb-4">
              <Zap className="h-3 w-3" /> Funcionalidades
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Tudo para prospectar <span className="text-gradient">em escala</span>
            </h2>
            <p className="mt-4 text-white/35 max-w-xl mx-auto">Da captura ao fechamento, automatize cada etapa do processo de vendas.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={f.title} className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:bg-white/[0.04]" style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all`}>
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-semibold mb-2 text-white/90">{f.title}</h3>
                <p className="text-sm text-white/35 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ HOW IT WORKS ═══ */}
      <Section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/10 border border-emerald-600/20 text-xs text-emerald-400 mb-4">
              <Clock className="h-3 w-3" /> Como funciona
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              3 passos para <span className="text-gradient">agendar reuniões</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: MapPin, title: 'Capture leads', desc: 'Busque empresas por nicho e localização via Google Maps, redes sociais ou importação.' },
              { step: '02', icon: MessageSquare, title: 'Envie mensagens', desc: 'Dispare mensagens via WhatsApp com anti-ban, spintax e delays humanizados.' },
              { step: '03', icon: TrendingUp, title: 'Feche negócios', desc: 'A IA qualifica, responde objeções e agenda reuniões. Você só fecha.' },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center group">
                <div className="text-[80px] font-black text-white/[0.02] absolute -top-6 left-1/2 -translate-x-1/2 select-none">{item.step}</div>
                <div className="relative pt-10">
                  <div className="h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-5 group-hover:border-violet-600/30 group-hover:bg-violet-600/5 transition-all">
                    <item.icon className="h-6 w-6 text-white/50 group-hover:text-violet-400 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-white/35">{item.desc}</p>
                </div>
                {i < 2 && <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-white/10 to-transparent" />}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ TESTIMONIALS ═══ */}
      <Section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-600/10 border border-amber-600/20 text-xs text-amber-400 mb-4">
              <Star className="h-3 w-3" /> Depoimentos
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Quem usa, recomenda</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all group">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />)}
                </div>
                <p className="text-sm text-white/50 leading-relaxed mb-5">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-medium text-white/80">{t.name}</p>
                    <p className="text-xs text-white/30">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ PRICING ═══ */}
      <Section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 section-glow pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600/10 border border-violet-600/20 text-xs text-violet-400 mb-4">
              <Sparkles className="h-3 w-3" /> Preços
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Invista menos que um <span className="text-gradient">almoço por dia</span>
            </h2>
            <p className="text-white/35 mb-6">Todos os planos incluem disparos e leads ilimitados.</p>
            <div className="flex items-center justify-center gap-3">
              <span className={`text-sm ${!annual ? 'text-white' : 'text-white/30'}`}>Mensal</span>
              <button onClick={() => setAnnual(!annual)} className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-violet-600' : 'bg-white/10'}`}>
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm ${annual ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
              <span className={`text-sm ${annual ? 'text-white' : 'text-white/30'}`}>
                Anual <span className="text-emerald-400 text-xs ml-1">-20%</span>
              </span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div key={plan.id} className={`relative rounded-2xl p-7 transition-all ${plan.highlight ? 'bg-gradient-to-b from-violet-600/10 via-white/[0.03] to-white/[0.01] border-2 border-violet-500/30 shadow-xl shadow-violet-600/5 scale-[1.03]' : 'bg-white/[0.02] border border-white/[0.06]'}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-medium shadow-lg">⭐ Mais popular</span>
                  </div>
                )}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="text-xs text-white/30 mt-1">{plan.desc}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">R$ {price(plan.price)}</span>
                  <span className="text-white/30 text-sm">/mês</span>
                </div>
                {annual && <p className="text-xs text-emerald-400 mt-1">Economia de R$ {(plan.price * 12 - price(plan.price) * 12)}/ano</p>}
                <Link to="/auth" className="block mt-5">
                  <Button className={`w-full h-11 rounded-xl border-0 ${plan.highlight ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20' : 'bg-white/[0.06] hover:bg-white/[0.1] text-white'}`}>
                    Começar agora
                  </Button>
                </Link>
                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-white/45">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ FAQ ═══ */}
      <Section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600/10 border border-violet-600/20 text-xs text-violet-400 mb-4">FAQ</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Perguntas frequentes</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden hover:border-white/[0.1] transition-colors">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-medium text-sm text-white/80 pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="h-4 w-4 text-white/25 shrink-0" /> : <ChevronDown className="h-4 w-4 text-white/25 shrink-0" />}
                </button>
                {openFaq === i && <div className="px-5 pb-5"><p className="text-sm text-white/35 leading-relaxed">{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ CTA ═══ */}
      <Section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-cyan-600/5" />
            <div className="absolute inset-0 bg-grid-pattern opacity-20" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-600/5 rounded-full blur-[80px]" />
            {/* Border */}
            <div className="absolute inset-0 rounded-3xl border border-white/[0.08]" />

            <div className="relative p-12 sm:p-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
                Pronto para prospectar no <span className="text-gradient">piloto automático?</span>
              </h2>
              <p className="text-white/35 mb-8 max-w-lg mx-auto">
                Junte-se a centenas de empresas que já usam o NexaProspect para agendar mais reuniões.
              </p>
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white h-[52px] px-10 text-base gap-2 rounded-xl shadow-xl shadow-violet-600/20 border-0">
                  <Rocket className="h-5 w-5" />
                  Criar conta grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/[0.04] py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logoImg} alt="NexaProspect" className="h-7 w-auto" />
                <span className="font-bold text-sm">NexaProspect</span>
              </div>
              <p className="text-xs text-white/25 leading-relaxed">
                Plataforma de prospecção autônoma com IA para equipes de vendas.
              </p>
            </div>
            {[
              { title: 'Produto', links: [{ l: 'Funcionalidades', h: '#features' }, { l: 'Preços', h: '#pricing' }, { l: 'FAQ', h: '#faq' }] },
              { title: 'Empresa', links: [{ l: 'Sobre', h: '#' }, { l: 'Blog', h: '#' }, { l: 'Contato', h: '#' }] },
              { title: 'Legal', links: [{ l: 'Termos de uso', h: '#' }, { l: 'Privacidade', h: '#' }] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-semibold text-xs text-white/60 mb-4 uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map(link => <li key={link.l}><a href={link.h} className="text-xs text-white/25 hover:text-white/60 transition-colors">{link.l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-6 border-t border-white/[0.04] text-center text-[11px] text-white/15">
            © {new Date().getFullYear()} NexaProspect. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
