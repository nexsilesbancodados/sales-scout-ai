import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import {
  ArrowRight, Star, Target, Bot, MessageSquare, Zap, BarChart3,
  Check, ChevronDown, Menu, X, Columns3
} from 'lucide-react';
import aiHeroImg from '@/assets/ai-hero-3d.png';

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
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── 3D AI Wire-frame SVG ─── */
function AIWireframe() {
  return (
    <svg viewBox="0 0 500 600" fill="none" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 60px rgba(150,150,255,0.25))' }}>
      {/* Head outline */}
      <ellipse cx="250" cy="200" rx="120" ry="150" stroke="white" strokeWidth="0.8" opacity="0.3" />
      <ellipse cx="250" cy="200" rx="100" ry="130" stroke="white" strokeWidth="0.5" opacity="0.15" />
      <ellipse cx="250" cy="200" rx="80" ry="110" stroke="white" strokeWidth="0.4" opacity="0.1" />

      {/* Orbits */}
      <ellipse cx="250" cy="250" rx="180" ry="60" stroke="white" strokeWidth="0.6" opacity="0.12" strokeDasharray="4 6" />
      <ellipse cx="250" cy="220" rx="200" ry="80" stroke="white" strokeWidth="0.5" opacity="0.08" strokeDasharray="3 8" />

      {/* Grid lines - vertical */}
      {[180, 210, 250, 290, 320].map((x, i) => (
        <line key={`v${i}`} x1={x} y1="60" x2={x} y2="340" stroke="white" strokeWidth="0.3" opacity="0.08" />
      ))}
      {/* Grid lines - horizontal */}
      {[100, 150, 200, 250, 300].map((y, i) => (
        <line key={`h${i}`} x1="130" y1={y} x2="370" y2={y} stroke="white" strokeWidth="0.3" opacity="0.08" />
      ))}

      {/* Eyes */}
      <circle cx="210" cy="180" r="12" stroke="white" strokeWidth="0.8" opacity="0.4" />
      <circle cx="210" cy="180" r="4" fill="white" opacity="0.6" />
      <circle cx="290" cy="180" r="12" stroke="white" strokeWidth="0.8" opacity="0.4" />
      <circle cx="290" cy="180" r="4" fill="white" opacity="0.6" />

      {/* Nose line */}
      <line x1="250" y1="195" x2="250" y2="230" stroke="white" strokeWidth="0.5" opacity="0.2" />

      {/* Mouth */}
      <path d="M 220 250 Q 250 265 280 250" stroke="white" strokeWidth="0.6" opacity="0.2" fill="none" />

      {/* Neck / Body lines */}
      <line x1="220" y1="340" x2="200" y2="500" stroke="white" strokeWidth="0.6" opacity="0.15" />
      <line x1="280" y1="340" x2="300" y2="500" stroke="white" strokeWidth="0.6" opacity="0.15" />
      <line x1="250" y1="350" x2="250" y2="520" stroke="white" strokeWidth="0.4" opacity="0.1" />

      {/* Shoulder arcs */}
      <path d="M 200 400 Q 120 420 80 500" stroke="white" strokeWidth="0.5" opacity="0.1" fill="none" />
      <path d="M 300 400 Q 380 420 420 500" stroke="white" strokeWidth="0.5" opacity="0.1" fill="none" />

      {/* Neural dots */}
      {[
        [170, 120], [330, 120], [150, 250], [350, 250], [200, 320], [300, 320],
        [250, 100], [190, 170], [310, 170], [230, 280], [270, 280],
        [160, 190], [340, 190], [250, 350], [220, 380], [280, 380],
      ].map(([cx, cy], i) => (
        <circle key={`d${i}`} cx={cx} cy={cy} r="2" fill="white" opacity={0.15 + (i % 3) * 0.1}>
          <animate attributeName="opacity" values={`${0.1 + (i % 3) * 0.1};${0.4 + (i % 2) * 0.2};${0.1 + (i % 3) * 0.1}`} dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* Glow center */}
      <radialGradient id="cg" cx="50%" cy="40%">
        <stop offset="0%" stopColor="white" stopOpacity="0.08" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>
      <ellipse cx="250" cy="220" rx="160" ry="200" fill="url(#cg)" />
    </svg>
  );
}

/* ─── FEATURES DATA ─── */
const FEATURES = [
  { icon: Target, title: 'Prospecção automática', desc: 'Captura leads do Google Maps, Instagram e Facebook com 1 clique. Até 500 leads/semana no piloto automático.' },
  { icon: Bot, title: 'Agente SDR com IA', desc: 'A IA responde, qualifica e move leads no funil automaticamente. Você só fecha as vendas.' },
  { icon: MessageSquare, title: 'WhatsApp integrado', desc: 'Disparo em massa, follow-up automático e respostas por intenção. Anti-ban nativo.' },
  { icon: Columns3, title: 'CRM completo', desc: 'Pipeline visual com deal value, BANT, timeline de conversas e integração Meta Ads.' },
  { icon: Zap, title: '9 automações', desc: 'Prospecção semanal, reativação de leads frios, relatório diário. Liga/desliga com 1 clique.' },
  { icon: BarChart3, title: 'Analytics em tempo real', desc: 'Taxa de conversão por nicho, ticket médio, custo por lead e ROI das campanhas.' },
];

const TESTIMONIALS = [
  { name: 'Rafael M.', role: 'Agência de Marketing, SP', text: 'Em 2 semanas capturei 800 leads de restaurantes e fechei 12 contratos. O SDR da IA responde melhor que minha equipe.' },
  { name: 'Camila S.', role: 'Consultora de Vendas, RJ', text: 'Nunca pensei que ia prospectar no piloto automático. Meu WhatsApp fica respondendo enquanto durmo.' },
  { name: 'Lucas P.', role: 'Startup B2B, BH', text: 'O CRM integrado com Meta Ads mudou completamente minha estratégia. Sei exatamente quanto custa cada lead.' },
];

const INTEGRATIONS = ['Google Maps', 'WhatsApp', 'Meta / Facebook', 'Instagram', 'Serper', 'Hunter.io', 'Apify', 'DeepSeek'];

const NAV_LINKS = [
  { label: 'Recursos', href: '#recursos' },
  { label: 'Preços', href: '#precos' },
  { label: 'Cases', href: '#cases' },
  { label: 'API', href: '#api' },
  { label: 'Blog', href: '#blog' },
];

const PLANS = [
  {
    name: 'Starter',
    price: 97,
    annual: 78,
    features: ['1 chip WhatsApp', 'Google Maps + Web Search', '200 leads/mês', 'Follow-up automático', 'Prospecção agendada', 'Suporte por email'],
    cta: 'Começar agora',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 149,
    annual: 119,
    features: ['3 chips WhatsApp', 'Todos os extratores', '1.000 leads/mês', 'Agente SDR com IA', 'Analytics avançado', 'A/B Testing', 'Suporte prioritário'],
    cta: 'Escolher Pro',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 297,
    annual: 237,
    features: ['10 chips WhatsApp', 'Todos os recursos', 'Leads ilimitados', 'API completa', 'Múltiplos funis', 'Equipe ilimitada', 'Gerente dedicado'],
    cta: 'Falar com vendas',
    highlight: false,
  },
];

/* ═══════════════════════════════════════════════════ */
export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [annual, setAnnual] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="bg-[#0B0D15] text-white min-h-screen overflow-x-hidden">

      {/* ═══ NAVBAR ═══ */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#0B0D15]/80 backdrop-blur-2xl border-b border-white/[0.04]' : 'bg-transparent'}`}>
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-8 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-white via-white/90 to-white/70 shadow-[0_0_12px_rgba(255,255,255,0.15)]" />
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-white">NexaProspect</span>
          </div>

          {/* Center pill nav - desktop */}
          <div className="hidden lg:flex items-center bg-white/[0.04] backdrop-blur-xl border border-white/[0.07] rounded-full px-1.5 py-1">
            {NAV_LINKS.map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                className={`text-[13px] px-5 py-2 rounded-full transition-all duration-200 ${i === 0 ? 'text-white bg-white/[0.08]' : 'text-white/50 hover:text-white/80 hover:bg-white/[0.05]'}`}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link to="/auth" className="hidden lg:inline-flex bg-white text-[#0B0D15] text-[13px] font-semibold px-6 py-2.5 rounded-full hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Começar grátis
            </Link>
            <button className="lg:hidden text-white/60" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="lg:hidden bg-[#0B0D15]/95 backdrop-blur-2xl border-t border-white/[0.04] px-8 py-5 space-y-1">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} className="block text-[13px] text-white/50 hover:text-white py-2.5 transition-colors" onClick={() => setMobileMenu(false)}>
                {l.label}
              </a>
            ))}
            <Link to="/auth" className="block text-center bg-white text-[#0B0D15] text-[13px] font-semibold px-5 py-2.5 rounded-full mt-4">
              Começar grátis
            </Link>
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="min-h-screen relative overflow-hidden stars-bg">
        {/* Multi-layer glow behind the figure */}
        <div className="absolute right-[-5%] top-[-10%] w-[70%] h-[120%] pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(90,60,220,0.12) 0%, rgba(60,40,180,0.06) 30%, transparent 60%)' }} />
        <div className="absolute right-[5%] top-[15%] w-[500px] h-[500px] pointer-events-none rounded-full" style={{ background: 'radial-gradient(circle, rgba(140,90,255,0.1) 0%, transparent 65%)' }} />
        <div className="absolute left-[10%] bottom-[20%] w-[300px] h-[300px] pointer-events-none rounded-full" style={{ background: 'radial-gradient(circle, rgba(80,60,200,0.06) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] min-h-screen items-center px-8">
          {/* Left content */}
          <div className="flex flex-col justify-center pt-32 pb-16 lg:pt-0 lg:pb-0">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2.5 bg-white/[0.06] border border-white/[0.08] rounded-full px-3.5 py-1.5 mb-8 w-fit animate-fade-in"
              style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
            >
              <span className="text-[9px] font-extrabold bg-white text-[#0B0D15] rounded-full px-2 py-[3px] tracking-[0.05em] uppercase">Novo</span>
              <span className="text-[12px] text-white/50">Extrator Facebook e Meta Ads integrado</span>
            </div>

            {/* Headline */}
            <h1
              className="text-[40px] sm:text-[52px] lg:text-[64px] font-extrabold leading-[1.05] tracking-[-0.035em] animate-fade-in"
              style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
            >
              <span className="text-white">Prospecte no </span>
              <br className="hidden sm:block" />
              <span className="text-white/30">Piloto Automático</span>
              <span className="text-white"> com IA</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-[15px] text-white/40 max-w-[380px] mt-6 leading-[1.7] animate-fade-in"
              style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
            >
              Capture leads no Google Maps, Instagram e Facebook. A IA prospecta, qualifica e fecha por você — sem esforço manual.
            </p>

            {/* CTA Button */}
            <Link
              to="/auth"
              className="mt-10 bg-white/[0.07] border border-white/[0.12] text-white text-[14px] font-semibold px-8 py-4 rounded-full hover:bg-white/[0.12] transition-all duration-300 flex items-center gap-2.5 w-fit animate-fade-in group"
              style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
            >
              Começar gratuitamente
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Social proof */}
            <div className="flex items-center gap-4 mt-10 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
              <div className="flex -space-x-2.5">
                {['G', 'M', 'R', 'A', 'L'].map((initial, i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-[2.5px] border-[#0B0D15] bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {initial}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white/90">+2.400 usuários</p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />)}
                  <span className="text-[11px] text-white/35 ml-1.5">4.9/5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - 3D AI figure */}
          <div className="hidden lg:flex items-center justify-center relative animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            <div className="relative">
              <img
                src={aiHeroImg}
                alt="AI Assistant"
                width={1024}
                height={1280}
                className="w-full max-w-[560px] h-auto object-contain relative z-10"
                style={{ filter: 'drop-shadow(0 0 100px rgba(110,70,255,0.2)) drop-shadow(0 0 40px rgba(140,100,255,0.15))' }}
              />
              {/* Subtle ring behind */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-white/[0.03]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.02]" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ INTEGRATIONS MARQUEE ═══ */}
      <section className="bg-[#070712] border-y border-white/5 py-12 overflow-hidden">
        <p className="text-[10px] tracking-[0.2em] text-white/20 text-center mb-8 uppercase">Integra com as principais plataformas</p>
        <div className="landing-marquee">
          <div className="landing-marquee-track">
            {[...INTEGRATIONS, ...INTEGRATIONS].map((name, i) => (
              <span key={i} className="text-sm font-bold uppercase text-white/20 mx-8 whitespace-nowrap">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="recursos" className="bg-[#050510] py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <AnimSection>
            <span className="text-xs font-semibold tracking-[0.2em] text-purple-400 uppercase">Recursos</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mt-3 mb-12">
              Tudo que você precisa para <br /><span className="text-white/40">escalar suas vendas</span>
            </h2>
          </AnimSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <AnimSection key={f.title} delay={0.05 * i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300">
                <div className="rounded-xl bg-purple-500/10 p-3 w-fit">
                  <f.icon className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-base font-semibold text-white mt-4 mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="bg-[#070712] py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <AnimSection>
            <span className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">Como funciona</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mt-3 mb-16">Em 3 passos simples</h2>
          </AnimSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-[16.6%] right-[16.6%] border-t border-dashed border-white/10" />

            {[
              { num: '01', title: 'Escolha o nicho e cidade', desc: 'Selecione o segmento e localização. A IA mapeia os melhores prospects automaticamente.' },
              { num: '02', title: 'Ative as automações', desc: 'Ligue prospecção, follow-up e SDR com 1 clique. Tudo roda em segundo plano.' },
              { num: '03', title: 'Receba leads qualificados', desc: 'Leads chegam no CRM já pontuados. Foque apenas nos que vão fechar.' },
            ].map((s, i) => (
              <AnimSection key={s.num} delay={0.1 * i} className="relative text-center md:text-left">
                <span className="text-6xl font-black text-white/[0.06]">{s.num}</span>
                <h3 className="text-lg font-semibold text-white mt-2 mb-2">{s.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{s.desc}</p>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section id="cases" className="bg-[#050510] py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <AnimSection>
            <span className="text-xs font-semibold tracking-[0.2em] text-green-400 uppercase">Depoimentos</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mt-3 mb-12">
              Quem usa, <span className="text-white/40">recomenda</span>
            </h2>
          </AnimSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <AnimSection key={t.name} delay={0.08 * i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-white/70 leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-white/40">{t.role}</p>
                  </div>
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="precos" className="bg-[#070712] py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <AnimSection className="text-center mb-12">
            <span className="text-xs font-semibold tracking-[0.2em] text-purple-400 uppercase">Preços</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mt-3">
              Planos simples, <span className="text-white/40">resultados reais</span>
            </h2>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <span className={`text-sm ${!annual ? 'text-white' : 'text-white/40'}`}>Mensal</span>
              <button
                onClick={() => setAnnual(!annual)}
                className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-purple-500' : 'bg-white/20'}`}
              >
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${annual ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
              <span className={`text-sm ${annual ? 'text-white' : 'text-white/40'}`}>Anual</span>
              {annual && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">-20%</span>}
            </div>
          </AnimSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {PLANS.map((p, i) => (
              <AnimSection
                key={p.name}
                delay={0.08 * i}
                className={`rounded-2xl p-7 border transition-all relative ${p.highlight ? 'border-purple-500/30 bg-purple-500/[0.05]' : 'border-white/[0.06] bg-white/[0.03]'}`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold bg-purple-500 text-white px-3 py-1 rounded-full">
                    Mais popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-white">{p.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-extrabold text-white">R${annual ? p.annual : p.price}</span>
                  <span className="text-white/40 text-sm">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                      <Check className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  className={`block text-center text-sm font-semibold py-3 rounded-full transition-all ${p.highlight ? 'bg-white text-black hover:bg-white/90' : 'bg-white/10 text-white border border-white/15 hover:bg-white/15'}`}
                >
                  {p.cta}
                </Link>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="api" className="bg-[#050510] py-24 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <AnimSection className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Perguntas frequentes</h2>
          </AnimSection>
          {[
            { q: 'Preciso de conhecimento técnico?', a: 'Não. O NexaProspect foi feito para vendedores e donos de agência. Tudo funciona com poucos cliques.' },
            { q: 'Meu WhatsApp pode ser banido?', a: 'Temos sistema anti-ban nativo com warm-up progressivo, delays humanizados e rotação de chips. Risco mínimo.' },
            { q: 'Posso testar grátis?', a: 'Sim! Oferecemos 7 dias grátis em todos os planos, sem necessidade de cartão de crédito.' },
            { q: 'Funciona para qualquer nicho?', a: 'Sim. Temos templates otimizados para +50 nichos, mas você pode personalizar para qualquer segmento.' },
          ].map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="bg-[#050510] py-32 px-6 lg:px-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(100,50,255,0.12) 0%, transparent 60%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <AnimSection>
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Pronto para prospectar <br /><span className="text-white/40">no piloto automático?</span>
            </h2>
            <p className="text-white/50 mt-4 text-lg">Teste grátis por 7 dias. Sem cartão de crédito.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link to="/auth" className="bg-white text-black font-bold px-8 py-4 rounded-full hover:bg-white/90 transition-all text-sm">
                Começar agora — é grátis
              </Link>
              <Link to="/tutorial" className="border border-white/20 text-white px-8 py-4 rounded-full hover:bg-white/5 transition-all text-sm">
                Ver tutorial
              </Link>
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[#030308] py-16 px-6 lg:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-white to-white/80" />
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
    <div className="border-b border-white/[0.06]">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left">
        <span className="text-sm font-medium text-white">{q}</span>
        <ChevronDown className={`h-4 w-4 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="text-sm text-white/50 pb-5 leading-relaxed">{a}</p>}
    </div>
  );
}
