import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import {
  ArrowRight, Star, Target, Bot, MessageSquare, Zap, BarChart3,
  Check, ChevronDown, Menu, X, Columns3, Sparkles, Shield, Globe
} from 'lucide-react';
import aiHeroImg from '@/assets/ai-hero-clean.png';
import mobileImg from '@/assets/mobile-mockup.png';
import logoImg from '@/assets/logo.png';
import { LiquidButton } from '@/components/ui/liquid-button';
import { PremiumPricingCard } from '@/components/landing/PremiumPricingCard';
import { ParallaxSection, AnimatedCounter } from '@/components/landing/ScrollEffects';
import { DashboardMockup } from '@/components/landing/DashboardMockup';
import { ComparisonTable } from '@/components/landing/ComparisonTable';
import { ROICalculator } from '@/components/landing/ROICalculator';
import { TrustSection } from '@/components/landing/TrustSection';
import { BeforeAfterSection } from '@/components/landing/BeforeAfterSection';
import { CosmicBackground } from '@/components/landing/CosmicBackground';
import { UrgencyCTABanner, SocialProofStrip, FeatureHighlightStrip } from '@/components/landing/BannerStrips';

/* ─── Intersection Observer Hook ─── */
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

/* ─── Animated Section Wrapper ─── */
function AnimSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.97)',
        transition: `opacity 0.8s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.8s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Staggered reveal for cards ─── */
function StaggerReveal({ children, className = '', index = 0 }: { children: React.ReactNode; className?: string; index?: number }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) rotateX(0deg)' : 'translateY(60px) rotateX(8deg)',
        transition: `all 0.7s cubic-bezier(.16,1,.3,1) ${0.08 * index}s`,
        transformOrigin: 'bottom center',
      }}
    >
      {children}
    </div>
  );
}

/* ─── FEATURES DATA ─── */
const FEATURES = [
  { icon: Target, title: 'Prospecção automática', desc: 'Encontre até 500 leads/semana no Google Maps, Instagram e Facebook — sem digitar uma linha.', color: '#7B2FF2' },
  { icon: Bot, title: 'Agente SDR com IA', desc: 'Sua IA responde em segundos, qualifica com BANT e agenda reuniões — 24h por dia, 7 dias por semana.', color: '#E91E8C' },
  { icon: MessageSquare, title: 'WhatsApp integrado', desc: 'Dispare mensagens personalizadas em massa com anti-ban, spintax e delays que imitam comportamento humano.', color: '#00B4D8' },
  { icon: Columns3, title: 'CRM completo', desc: 'Pipeline visual com deal value, qualificação BANT e integração direta com Meta Ads.', color: '#F7941D' },
  { icon: Zap, title: '9 automações poderosas', desc: 'Prospecção agendada, reativação de leads frios, relatórios automáticos. Liga e desliga com 1 clique.', color: '#7B2FF2' },
  { icon: BarChart3, title: 'Analytics em tempo real', desc: 'Saiba exatamente qual nicho, horário e template converte mais — e otimize cada centavo investido.', color: '#E91E8C' },
];

const TESTIMONIALS = [
  { name: 'Rafael M.', role: 'Agência de Marketing, SP', text: 'Em 14 dias: 800 leads capturados, 12 contratos fechados. O SDR da IA converte melhor que minha equipe de 3 pessoas.' },
  { name: 'Camila S.', role: 'Consultora de Vendas, RJ', text: 'Acordo com 5 reuniões agendadas. A IA prospectou, qualificou e respondeu enquanto eu dormia. Surreal.' },
  { name: 'Lucas P.', role: 'Startup B2B, BH', text: 'Reduzi meu custo por lead de R$18 para R$0,80. O CRM + Meta Ads me dá visibilidade total do funil.' },
  { name: 'Marina L.', role: 'Agência Digital, Curitiba', text: 'De 8 reuniões/mês para 27 no primeiro mês. O follow-up automático recupera leads que eu já tinha dado como perdidos.' },
  { name: 'Pedro R.', role: 'Imobiliária, Florianópolis', text: 'Meus clientes perguntam como respondo tão rápido. Não conto que é a IA — eles acham que tenho uma equipe enorme.' },
  { name: 'Ana C.', role: 'E-commerce, Porto Alegre', text: '400 leads qualificados na primeira semana via Instagram. ROI de 23x sobre o plano. Nunca vi nada igual.' },
];

const INTEGRATIONS = ['Google Maps', 'WhatsApp', 'Meta / Facebook', 'Instagram', 'Serper', 'Hunter.io', 'Apify', 'DeepSeek'];

const NAV_LINKS = [
  { label: 'Recursos', href: '#recursos' },
  { label: 'Produto', href: '#produto' },
  { label: 'Preços', href: '#precos' },
  { label: 'Cases', href: '#cases' },
  { label: 'FAQ', href: '#faq' },
];

const PLANS = [
  {
    name: 'Starter', price: 97, annual: 78,
    features: ['1 chip WhatsApp', 'Google Maps + Web Search', '200 leads/mês', 'Follow-up automático', 'Prospecção agendada', 'Suporte por email'],
    cta: 'Começar agora', highlight: false,
  },
  {
    name: 'Pro', price: 149, annual: 119,
    features: ['3 chips WhatsApp', 'Todos os extratores', '1.000 leads/mês', 'Agente SDR com IA', 'Analytics avançado', 'A/B Testing', 'Suporte prioritário'],
    cta: 'Escolher Pro', highlight: true,
  },
  {
    name: 'Enterprise', price: 297, annual: 237,
    features: ['10 chips WhatsApp', 'Todos os recursos', 'Leads ilimitados', 'API completa', 'Múltiplos funis', 'Equipe ilimitada', 'Gerente dedicado'],
    cta: 'Falar com vendas', highlight: false,
  },
];

const STATS = [
  { value: 2400, suffix: '+', label: 'Usuários ativos' },
  { value: 850, suffix: 'K', label: 'Leads capturados' },
  { value: 94, suffix: '%', label: 'Taxa de entrega' },
  { value: 12, suffix: 'x', label: 'ROI médio' },
];

/* ═══════════════════════════════════════════════════ */
export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [annual, setAnnual] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="text-white min-h-screen overflow-x-hidden relative">
      {/* Fixed cosmic background */}
      <CosmicBackground />

      {/* ═══ NAVBAR ═══ */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#0B0D15]/95 border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.4)]' : 'bg-transparent'}`}>
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="NexaProspect" className="h-8 w-8 rounded-lg object-contain" />
            <span className="text-[15px] font-bold tracking-[-0.02em] text-white">NexaProspect</span>
          </div>

          <div className="hidden lg:flex items-center bg-white/[0.08] border border-white/[0.08] rounded-full px-1.5 py-1">
            {NAV_LINKS.map((l, i) => (
              <a key={l.label} href={l.href}
                className={`text-[13px] px-5 py-1.5 rounded-full transition-all duration-200 font-medium ${i === 0 ? 'text-white bg-white/[0.1]' : 'text-white/45 hover:text-white/80 hover:bg-white/[0.06]'}`}
              >{l.label}</a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link to="/auth" className="hidden lg:block text-[13px] text-white/50 hover:text-white/80 transition-colors font-medium">Entrar</Link>
            <div className="hidden lg:block">
              <LiquidButton onClick={() => navigate('/auth')} className="text-[13px] px-6 py-2.5 rounded-full font-semibold">
                Começar agora
              </LiquidButton>
            </div>
            <button className="lg:hidden text-white/60" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="lg:hidden bg-[#0B0D15]/98 border-t border-white/[0.04] px-8 py-5 space-y-1">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} className="block text-[13px] text-white/50 hover:text-white py-2.5 transition-colors" onClick={() => setMobileMenu(false)}>{l.label}</a>
            ))}
            <Link to="/auth" className="block text-center bg-white text-[#0B0D15] text-[13px] font-semibold px-5 py-2.5 rounded-full mt-4">Começar agora</Link>
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="min-h-screen relative overflow-hidden flex items-center">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={aiHeroImg}
            alt=""
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[85%] w-auto max-w-none object-cover opacity-80"
            style={{ filter: 'drop-shadow(0 0 120px rgba(123,47,242,0.2))' }}
          />
          <div className="absolute inset-0 hero-energy-overlay" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D15]/70 via-transparent to-[#0B0D15]/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D15] via-transparent to-[#0B0D15]/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D15]/50 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-[620px] pt-24">
            <div className="inline-flex items-center gap-2.5 bg-white/[0.08] border border-white/[0.08] rounded-full px-4 py-2 mb-8 animate-fade-in"
              style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
              <Sparkles className="h-3.5 w-3.5 text-[#F7941D]" />
              <span className="text-[12px] text-white/60">+2.400 empresas já automatizaram suas vendas</span>
            </div>

            <h1 className="text-[42px] sm:text-[54px] lg:text-[68px] font-extrabold leading-[1.02] tracking-[-0.04em] animate-fade-in"
              style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
              <span className="text-white">Pare de </span>
              <span className="text-white/30">perseguir</span>
              <br className="hidden sm:block" />
              <span className="text-white">leads. </span>
              <span className="landing-gradient-text">Atraia-os.</span>
            </h1>

            <p className="text-[16px] text-white/50 max-w-[460px] mt-7 leading-[1.8] animate-fade-in"
              style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
              A IA captura leads do Google Maps, Instagram e Facebook, envia mensagens no WhatsApp e agenda reuniões — <strong className="text-white/70">enquanto você dorme.</strong>
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-10 animate-fade-in" style={{ animationDelay: '0.9s', animationFillMode: 'both' }}>
              <LiquidButton onClick={() => navigate('/auth')} className="text-[14px] rounded-xl px-8 py-4">
                Testar grátis por 7 dias
                <ArrowRight className="h-4 w-4" />
              </LiquidButton>
              <a href="#produto" className="text-[14px] text-white/50 hover:text-white/80 transition-colors flex items-center gap-2 group">
                Ver como funciona
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <p className="text-[11px] text-white/25 mt-3 animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'both' }}>
              Sem cartão de crédito • Setup em 5 min • Cancele quando quiser
            </p>

            <div className="flex items-center gap-6 mt-10 animate-fade-in" style={{ animationDelay: '1.1s', animationFillMode: 'both' }}>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['#7B2FF2', '#E91E8C', '#00B4D8', '#F7941D'].map((c, i) => (
                    <div key={i} className="h-7 w-7 rounded-full border-2 border-[#0B0D15]" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-[12px] text-white/40">+2.400 ativos</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 text-[#F7941D] fill-[#F7941D]" />)}
                <span className="text-[12px] text-white/35 ml-1">4.9/5</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <div className="w-1 h-2.5 bg-white/40 rounded-full landing-scroll-dot" />
          </div>
        </div>
      </section>

      {/* ═══ URGENCY CTA BANNER ═══ */}
      <UrgencyCTABanner />

      {/* ═══ STATS BAR ═══ */}
      <section className="relative z-10 -mt-1">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-[#0B0D15]/80 border border-white/[0.08] rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <StaggerReveal key={s.label} index={i} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-white">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">{s.label}</p>
              </StaggerReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ INTEGRATIONS MARQUEE ═══ */}
      <section className="py-16 overflow-hidden">
        <p className="text-[10px] tracking-[0.2em] text-white/20 text-center mb-8 uppercase">Integra com as principais plataformas</p>
        <div className="landing-marquee">
          <div className="landing-marquee-track">
            {[...INTEGRATIONS, ...INTEGRATIONS, ...INTEGRATIONS].map((name, i) => (
              <span key={i} className="text-sm font-bold uppercase text-white/15 mx-10 whitespace-nowrap flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" />{name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF STRIP ═══ */}
      <SocialProofStrip />

      {/* ═══ TRUST BADGES ═══ */}
      <section className="py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <TrustSection />
        </div>
      </section>

      {/* ═══ BEFORE / AFTER ═══ */}
      <section className="py-28 px-6 lg:px-12 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(233,30,140,0.04) 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimSection className="text-center mb-16">
            <span className="text-xs font-semibold tracking-[0.2em] text-[#E91E8C] uppercase">Antes vs Depois</span>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mt-4">
              Você ainda prospecta <span className="text-white/30">na mão?</span>
            </h2>
            <p className="text-white/40 mt-4 max-w-lg mx-auto text-sm">
              Veja a diferença entre perder 8h/dia em tarefas repetitivas e deixar a IA trabalhar por você.
            </p>
          </AnimSection>
          <BeforeAfterSection />
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="recursos" className="py-28 px-6 lg:px-12 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(123,47,242,0.06) 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimSection className="text-center mb-16">
            <span className="text-xs font-semibold tracking-[0.2em] text-[#E91E8C] uppercase">Recursos</span>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mt-4">
              6 armas para <span className="landing-gradient-text">dominar seu mercado</span>
            </h2>
            <p className="text-white/40 mt-4 max-w-lg mx-auto text-sm">
              Da captura ao fechamento — tudo integrado numa única plataforma.
            </p>
          </AnimSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <StaggerReveal key={f.title} index={i}>
                <div className="group relative bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-7 transition-all duration-500 cursor-default overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 30% 30%, ${f.color}10 0%, transparent 60%)` }}
                  />
                  <div className="relative z-10">
                    <div
                      className="h-11 w-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}
                    >
                      <f.icon className="h-5 w-5" style={{ color: f.color }} />
                    </div>
                    <h3 className="text-[15px] font-semibold text-white mb-2">{f.title}</h3>
                    <p className="text-[13px] text-white/45 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </StaggerReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DASHBOARD MOCKUP ═══ */}
      <section id="produto" className="py-28 px-6 lg:px-12 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(123,47,242,0.08) 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimSection className="text-center mb-16">
            <span className="text-xs font-semibold tracking-[0.2em] text-[#7B2FF2] uppercase">Produto</span>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mt-4">
              Veja seu <span className="landing-gradient-text">novo cockpit de vendas</span>
            </h2>
            <p className="text-white/40 mt-4 max-w-xl mx-auto text-sm">
              CRM visual, analytics em tempo real, chat WhatsApp e 9 automações — tudo num painel que qualquer vendedor entende em 2 minutos.
            </p>
          </AnimSection>
          <DashboardMockup />
        </div>
      </section>

      {/* ═══ MOBILE + TEXT SECTION ═══ */}
      <section className="py-28 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(0,180,216,0.05) 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <AnimSection>
              <span className="text-xs font-semibold tracking-[0.2em] text-[#00B4D8] uppercase">Mobile</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mt-4 mb-6">
                Feche vendas <span className="landing-gradient-text-cyan">do celular</span>
              </h2>
              <p className="text-white/45 text-[15px] leading-[1.8] mb-8">
                Receba alertas de leads quentes, acompanhe seu funil e responda prospects — tudo na palma da mão, sem abrir o computador.
              </p>
              <ul className="space-y-4">
                {[
                  'Notificações de leads em tempo real',
                  'Respostas automáticas por IA',
                  'Dashboard responsivo',
                  'Integração PWA nativa',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[14px] text-white/60">
                    <div className="h-5 w-5 rounded-full bg-[#00B4D8]/15 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-[#00B4D8]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </AnimSection>

            {/* Phone mockup */}
            <AnimSection delay={0.2}>
              <div className="flex justify-center">
                <img
                  src={mobileImg}
                  alt="NexaProspect Mobile"
                  className="w-[320px] h-auto landing-float drop-shadow-[0_20px_60px_rgba(123,47,242,0.25)]"
                  loading="lazy"
                />
              </div>
            </AnimSection>
          </div>
        </div>
      </section>

      {/* ═══ FEATURE HIGHLIGHT STRIP ═══ */}
      <FeatureHighlightStrip />

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-28 px-6 lg:px-12 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(0,180,216,0.05) 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimSection className="text-center mb-20">
            <span className="text-xs font-semibold tracking-[0.2em] text-[#00B4D8] uppercase">Simplicidade</span>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mt-4">Do zero ao primeiro lead em <span className="landing-gradient-text-cyan">5 minutos</span></h2>
          </AnimSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {[
              { num: '01', title: 'Conecte seu WhatsApp', desc: 'Escaneie o QR Code e pronto. Em 2 minutos seu chip está ativo e protegido pelo anti-ban.', icon: Target, color: '#7B2FF2' },
              { num: '02', title: 'Escolha nicho + cidade', desc: 'Selecione o segmento e a IA captura leads qualificados automaticamente — Google Maps, Instagram, Facebook.', icon: Zap, color: '#E91E8C' },
              { num: '03', title: 'A IA faz o resto', desc: 'Prospecta, envia mensagens, qualifica e agenda reuniões. Você só aparece para fechar.', icon: BarChart3, color: '#00B4D8' },
            ].map((s, i) => (
              <StaggerReveal key={s.num} index={i} className="text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-6 mx-auto transition-transform duration-300 hover:scale-110"
                  style={{ background: `${s.color}15`, border: `1px solid ${s.color}20` }}>
                  <s.icon className="h-6 w-6" style={{ color: s.color }} />
                </div>
                <span className="block text-5xl font-black landing-gradient-text opacity-20 mb-3">{s.num}</span>
                <h3 className="text-lg font-semibold text-white mb-3">{s.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </StaggerReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMPARISON TABLE ═══ */}
      <section className="py-28 px-6 lg:px-12 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(123,47,242,0.04) 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimSection className="text-center mb-16">
            <span className="text-xs font-semibold tracking-[0.2em] text-[#7B2FF2] uppercase">Comparação</span>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mt-4">
              Outras ferramentas fazem <span className="text-white/30">parte.</span> <br />Nós fazemos <span className="landing-gradient-text">tudo.</span>
            </h2>
          </AnimSection>
          <ComparisonTable />
        </div>
      </section>

      {/* ═══ ROI CALCULATOR ═══ */}
      <section className="py-28 px-6 lg:px-12 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 60% 50%, rgba(233,30,140,0.05) 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimSection className="text-center mb-16">
            <span className="text-xs font-semibold tracking-[0.2em] text-[#E91E8C] uppercase">Simulador de receita</span>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mt-4">
              Descubra quanto dinheiro está <span className="landing-gradient-text">deixando na mesa</span>
            </h2>
            <p className="text-white/40 mt-4 max-w-lg mx-auto text-sm">
              Arraste os controles e veja em tempo real o faturamento que a automação pode gerar para o seu negócio.
            </p>
          </AnimSection>
          <ROICalculator />
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section id="cases" className="py-28 px-6 lg:px-12 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(247,148,29,0.04) 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimSection className="text-center mb-16">
            <span className="text-xs font-semibold tracking-[0.2em] text-[#F7941D] uppercase">Resultados reais</span>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mt-4">
              Não acredite em nós. <span className="text-white/30">Acredite neles.</span>
            </h2>
          </AnimSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <StaggerReveal key={t.name} index={i}>
                <div className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-7 transition-all duration-500 h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F7941D]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-1 mb-5">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-3.5 w-3.5 text-[#F7941D] fill-[#F7941D]" />)}
                  </div>
                  <p className="text-[14px] text-white/60 leading-[1.8] mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#7B2FF2] to-[#E91E8C] flex items-center justify-center text-xs font-bold text-white">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-white/35">{t.role}</p>
                    </div>
                  </div>
                </div>
              </StaggerReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="precos" className="py-28 px-6 lg:px-12 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(123,47,242,0.06) 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimSection className="text-center mb-14">
            <span className="text-xs font-semibold tracking-[0.2em] text-[#7B2FF2] uppercase">Preços</span>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mt-4">
              Invista menos que um <span className="landing-gradient-text">almoço por dia</span>
            </h2>

            <div className="flex items-center justify-center gap-3 mt-8">
              <span className={`text-sm transition-colors ${!annual ? 'text-white' : 'text-white/40'}`}>Mensal</span>
              <button
                onClick={() => setAnnual(!annual)}
                className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-[#7B2FF2]' : 'bg-white/20'}`}
              >
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${annual ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
              <span className={`text-sm transition-colors ${annual ? 'text-white' : 'text-white/40'}`}>Anual</span>
              {annual && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">-20%</span>}
            </div>
          </AnimSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((p, i) => (
              <StaggerReveal key={p.name} index={i}>
                <PremiumPricingCard plan={p} annual={annual} index={i} />
              </StaggerReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="py-28 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <AnimSection className="text-center mb-14">
            <span className="text-xs font-semibold tracking-[0.2em] text-[#00B4D8] uppercase">FAQ</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mt-4">Perguntas frequentes</h2>
          </AnimSection>
          {[
            { q: 'Preciso de conhecimento técnico?', a: 'Não. O NexaProspect foi feito para vendedores e donos de agência. Tudo funciona com poucos cliques.' },
            { q: 'Meu WhatsApp pode ser banido?', a: 'Temos sistema anti-ban nativo com warm-up progressivo, delays humanizados e rotação de chips. Risco mínimo.' },
            { q: 'Posso testar antes de assinar?', a: 'Entre em contato com nosso time comercial para conhecer as condições especiais.' },
            { q: 'Funciona para qualquer nicho?', a: 'Sim. Temos templates otimizados para +50 nichos, mas você pode personalizar para qualquer segmento.' },
            { q: 'Como funciona o Agente SDR?', a: 'A IA analisa as mensagens recebidas, identifica intenção de compra e responde automaticamente com base no contexto da conversa e no seu serviço.' },
            { q: 'Quantos leads posso capturar por dia?', a: 'Depende do plano. No Starter são 200/mês, no Pro 1.000/mês e no Enterprise é ilimitado.' },
          ].map((faq, i) => (
            <StaggerReveal key={i} index={i}>
              <FAQItem q={faq.q} a={faq.a} />
            </StaggerReveal>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-32 px-6 lg:px-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(123,47,242,0.12) 0%, transparent 50%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(233,30,140,0.08) 0%, transparent 50%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <AnimSection>
            <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
              Pronto para prospectar <br /><span className="landing-gradient-text">no piloto automático?</span>
            </h2>
            <p className="text-white/45 mt-6 text-lg">Comece a prospectar hoje mesmo. Setup em 5 minutos.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <LiquidButton onClick={() => navigate('/auth')} className="text-[14px] rounded-xl px-10 py-4">
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </LiquidButton>
              <Link to="/tutorial" className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white px-8 py-4 rounded-xl transition-all text-sm font-medium">
                Ver tutorial
              </Link>
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 bg-[#07080E]/95 py-16 px-6 lg:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src={logoImg} alt="NexaProspect" className="h-7 w-7 rounded-lg object-contain" />
              <span className="text-sm font-semibold text-white">NexaProspect</span>
            </div>
            <p className="text-xs text-white/30 leading-relaxed">Prospecção inteligente com IA para escalar suas vendas no piloto automático.</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Produto</h4>
            <ul className="space-y-2">
              {['Recursos', 'Preços', 'API', 'Integrações'].map(l => (
                <li key={l}><a href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Empresa</h4>
            <ul className="space-y-2">
              {['Blog', 'Cases', 'Contato', 'Carreiras'].map(l => (
                <li key={l}><a href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2">
              {['Termos de Uso', 'Privacidade', 'LGPD'].map(l => (
                <li key={l}><a href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-white/20">© 2025 NexaProspect — FOCUSS DEV CNPJ 65.132.412/0001-20</p>
        </div>
      </footer>
    </div>
  );
}

/* ─── FAQ Item ─── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06] group">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-6 text-left">
        <span className="text-[15px] font-medium text-white group-hover:text-white/90 transition-colors">{q}</span>
        <ChevronDown className={`h-4 w-4 text-white/30 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-500 ${open ? 'max-h-40 pb-6' : 'max-h-0'}`}>
        <p className="text-sm text-white/45 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}
