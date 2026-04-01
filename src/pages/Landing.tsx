import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { ArrowRight, Star, Check, Menu, X, Sparkles, CreditCard, Zap, BarChart3, HelpCircle, ChevronDown, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import heroVideo from '@/assets/hero-video.mp4';
import logoImg from '@/assets/logo.png';
import heroPhonesImg from '@/assets/hero-phones-clean.png';
import googleMapsIcon from '@/assets/google-maps-icon.png';
import googleGIcon from '@/assets/google-g-icon.png';
import { CosmicBackground } from '@/components/landing/CosmicBackground';
import { PremiumPricingCard } from '@/components/landing/PremiumPricingCard';
import { ScrollCurveLine } from '@/components/landing/ScrollCurveLine';
import { GlobeSection } from '@/components/landing/GlobeSection';





const NAV_LINKS = [
  { label: 'Recursos', href: '#recursos', icon: Zap },
  { label: 'Produto', href: '#produto', icon: BarChart3 },
  { label: 'Preços', href: '#precos', icon: CreditCard },
  { label: 'Cases', href: '#cases', icon: Star },
  { label: 'FAQ', href: '#faq', icon: HelpCircle },
];

const PRICING_PLANS = [
  {
    name: 'Starter',
    price: 97,
    annual: 77,
    features: ['200 leads/mês', 'WhatsApp integrado', 'Templates prontos', 'Anti-ban básico', 'Suporte via chat'],
    cta: 'Começar grátis',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 197,
    annual: 149,
    features: ['1.000 leads/mês', 'Agente SDR com IA', 'CRM completo', 'Follow-up automático', 'Analytics avançado'],
    cta: 'Começar agora',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 497,
    annual: 397,
    features: ['Leads ilimitados', 'Multi-chip rotação', 'API + Webhooks', 'Gerente dedicado', 'Onboarding VIP'],
    cta: 'Falar com vendas',
    highlight: false,
  },
];

const FAQ_DATA = [
  { q: 'Preciso de cartão de crédito?', a: 'Sim, o pagamento é processado de forma segura no momento da assinatura.' },
  { q: 'Meu WhatsApp pode ser banido?', a: 'Nosso sistema anti-ban usa warm-up progressivo, delays humanizados, spintax e rotação de chips para proteger seu número.' },
  { q: 'Quanto tempo leva para configurar?', a: 'Menos de 5 minutos. Conecte o WhatsApp, escolha o nicho e a IA já começa a prospectar automaticamente.' },
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Sem multa, sem burocracia. Cancele com 1 clique no painel.' },
  { q: 'Funciona para qualquer nicho?', a: 'Sim. Temos templates otimizados para +50 nichos diferentes e a IA adapta a abordagem para cada segmento.' },
  { q: 'O agente SDR substitui minha equipe?', a: 'Ele complementa. A IA cuida da prospecção e qualificação 24/7, e sua equipe foca em fechar os deals quentes.' },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState('');
  const [hoveredNav, setHoveredNav] = useState<number | null>(null);
  const [annualPricing, setAnnualPricing] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40);
          const sections = NAV_LINKS.map(l => l.href.replace('#', ''));
          let current = '';
          for (const id of sections) {
            const el = document.getElementById(id);
            if (el && el.getBoundingClientRect().top <= 200) current = id;
          }
          setActiveNav(current);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);




  const SectionHeader = ({ tag, title, subtitle, id }: { tag: string; title: React.ReactNode; subtitle?: string; id?: string }) => (
    <div id={id} className="text-center mb-8 scroll-mt-24">
      <span className="text-[10px] uppercase tracking-[0.3em] text-[#F7941D] font-semibold">{tag}</span>
      <h2 className="text-2xl md:text-4xl font-black tracking-[-0.03em] mt-2 text-white">{title}</h2>
      {subtitle && <p className="text-white/35 text-sm mt-2 max-w-lg mx-auto">{subtitle}</p>}
    </div>
  );

  return (
    <div className="text-white min-h-screen overflow-x-hidden relative">
      <CosmicBackground />
      

      {/* ═══ FLOATING GLASS NAVBAR ═══ */}
      <nav className="fixed top-0 w-full z-50 flex justify-center pt-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.3 }}
          className="pointer-events-auto flex items-center rounded-full pr-3 pl-4 py-2.5 glass-nav-container"
        >
          <a href="#" className="flex items-center gap-2 mr-4 shrink-0">
            <img src={logoImg} alt="NexaProspect" className="h-7 w-7 rounded-lg object-contain" />
            <span className="text-[14px] font-bold tracking-[-0.02em] text-white hidden sm:block">Nexa</span>
          </a>
          <div className="hidden lg:flex items-center">
            {NAV_LINKS.map((l, idx) => {
              const Icon = l.icon;
              return (
                <a key={l.label} href={l.href} onMouseEnter={() => setHoveredNav(idx)} onMouseLeave={() => setHoveredNav(null)} className="nav-optn relative group">
                  <div className="nav-optn-inner">
                    <span className="nav-optn-icon"><Icon className="h-4 w-4 text-white" /></span>
                    <span className={`text-[13px] font-semibold tracking-wide transition-colors duration-300 ${activeNav === l.href.replace('#', '') ? 'text-white' : 'text-white/40 group-hover:text-white'}`}>{l.label}</span>
                    {hoveredNav === idx && (
                      <motion.span layoutId="navGlow" initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} className="absolute bottom-[-2px] left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-[#F7941D] to-transparent origin-center shadow-[0_0_10px_rgba(247,148,29,0.6)]" />
                    )}
                  </div>
                </a>
              );
            })}
          </div>
          <button onClick={() => navigate('/auth')} className="nav-shimmer-btn group ml-3">
            <span className="nav-shimmer-icon"><ArrowRight className="h-4 w-4 text-white nav-shimmer-arrow" /></span>
            <span className="nav-shimmer-text">Entrar</span>
          </button>
          <button className="lg:hidden text-white/60 ml-2" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">
            {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </motion.div>
        <div className={`lg:hidden pointer-events-auto fixed top-[70px] left-4 right-4 rounded-2xl overflow-hidden transition-all duration-300 ease-out glass-nav-container ${mobileMenu ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 py-4 space-y-1">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} className="flex items-center gap-3 text-[13px] text-white/50 hover:text-white py-2.5 transition-colors" onClick={() => setMobileMenu(false)}>
                <l.icon className="h-4 w-4" />{l.label}
              </a>
            ))}
            <Link to="/auth" className="block text-center bg-white text-[#0B0D15] text-[13px] font-semibold px-5 py-2.5 rounded-full mt-4" onClick={() => setMobileMenu(false)}>Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="hero-section min-h-screen relative overflow-hidden flex items-center">
        <div className="absolute inset-0 pointer-events-none">
          <video src={heroVideo} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 hero-energy-overlay" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D15]/80 via-[#0B0D15]/40 to-[#0B0D15]/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D15] via-transparent to-[#0B0D15]/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D15]/60 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-[620px] pt-24">
            <div className="inline-flex items-center gap-2.5 bg-white/[0.08] border border-white/[0.08] rounded-full px-4 py-2 mb-8 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
              <Sparkles className="h-3.5 w-3.5 text-[#F7941D]" />
              <span className="text-[12px] text-white/60">+2.400 empresas já automatizaram suas vendas</span>
            </div>
            <h1 className="text-[42px] sm:text-[54px] lg:text-[68px] font-extrabold leading-[1.02] tracking-[-0.04em] animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
              <span className="text-white">Pare de </span>
              <span className="text-white/30">perseguir</span>
              <br className="hidden sm:block" />
              <span className="text-white">leads. </span>
              <span className="landing-gradient-text">Atraia-os.</span>
            </h1>
            <p className="text-[16px] text-white/50 max-w-[460px] mt-7 leading-[1.8] animate-fade-in" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
              A IA captura leads do Google Maps, Instagram e Facebook, envia mensagens no WhatsApp e agenda reuniões — <strong className="text-white/70">enquanto você dorme.</strong>
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-10 animate-fade-in" style={{ animationDelay: '0.9s', animationFillMode: 'both' }}>
              <button onClick={() => navigate('/auth')} className="nav-shimmer-btn group !h-12 !min-w-[200px]">
                <span className="nav-shimmer-icon !w-10 !h-10"><ArrowRight className="h-4 w-4 text-white nav-shimmer-arrow" /></span>
                <span className="nav-shimmer-text !text-[14px]">Começar agora</span>
              </button>
              <a href="#produto" className="text-[14px] text-white/50 hover:text-white/80 transition-colors flex items-center gap-2 group">
                Ver como funciona <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-4 animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'both' }}>
              {['Sem cartão de crédito', 'Setup em 5 min', 'Cancele quando quiser'].map(t => (
                <span key={t} className="flex items-center gap-1.5 text-[11px] text-white/30">
                  <Check className="h-3 w-3 text-emerald-500/60" /> {t}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-6 mt-8 animate-fade-in" style={{ animationDelay: '1.1s', animationFillMode: 'both' }}>
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
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <a href="#recursos" className="block" aria-label="Rolar para baixo">
            <div className="w-5 h-8 rounded-full border-2 border-white/20 flex justify-center pt-1.5">
              <div className="w-1 h-2 bg-white/40 rounded-full landing-scroll-dot" />
            </div>
          </a>
        </div>
      </section>

      {/* ═══ SCROLL CURVE LINE ═══ */}
      <div className="relative">
        <ScrollCurveLine />

      {/* ═══ MOCKUP SHOWCASE ═══ */}
      <section id="produto" className="relative py-24 px-4 md:px-8 scroll-mt-24 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0B0D15] to-transparent pointer-events-none z-10" />

        <div className="relative z-10 max-w-[900px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#F7941D] font-semibold">Na palma da mão</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-[-0.03em] mt-3 text-white leading-[1.1]">
              Prospecte de <span className="landing-gradient-text">qualquer lugar</span>
            </h2>
            <p className="text-[14px] text-white/40 mt-4 max-w-[420px] mx-auto">
              Capture leads, envie mensagens e acompanhe resultados direto do celular.
            </p>
          </motion.div>

          {/* Floating Phone */}
          <div className="relative mt-16 flex items-center justify-center animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            {/* Glow */}
            <div className="absolute inset-0 -m-16 pointer-events-none" style={{
              background: 'radial-gradient(ellipse at center, rgba(123,47,242,0.18) 0%, rgba(123,47,242,0.04) 50%, transparent 75%)',
            }} />

            {/* Float animation wrapper */}
            <div className="animate-[floating_6s_ease-in-out_infinite]">
              <img
                src={heroPhonesImg}
                alt="NexaProspect no celular"
                className="relative z-10 w-full max-w-[620px] h-auto drop-shadow-[0_30px_60px_rgba(123,47,242,0.2)]"
                loading="lazy"
              />
            </div>

            {/* Floating Tool Icons - official brand icons, close to phones */}
            {[
              { icon: <img src={googleMapsIcon} alt="Google Maps" className="h-5 w-5 object-contain" />, label: 'Google Maps', color: '#34A853', x: 'left-[5%] md:left-[12%]', y: 'top-[18%]', float: '5s' },
              { icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>, label: 'WhatsApp', color: '#25D366', x: 'left-[2%] md:left-[10%]', y: 'bottom-[28%]', float: '6s' },
              { icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>, label: 'Facebook', color: '#1877F2', x: 'right-[5%] md:right-[12%]', y: 'top-[12%]', float: '7s' },
              { icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C16.67.014 16.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>, label: 'Instagram', color: '#E4405F', x: 'right-[2%] md:right-[10%]', y: 'bottom-[22%]', float: '5.5s' },
              { icon: <img src={googleGIcon} alt="Google" className="h-5 w-5 object-contain" />, label: 'Google', color: '#4285F4', x: 'left-[18%] md:left-[22%]', y: 'top-[2%]', float: '6.5s' },
              { icon: <Zap className="h-4 w-4" />, label: 'SDR Agent', color: '#7B2FF2', x: 'right-[15%] md:right-[18%]', y: 'bottom-[8%]', float: '7.5s' },
            ].map((item, i) => (
              <div
                key={i}
                className={`absolute ${item.x} ${item.y} z-30`}
                style={{ animation: `floating ${item.float} ease-in-out infinite`, animationDelay: `${i * 0.15}s` }}
              >
                <div
                  className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center border border-white/10"
                  style={{ background: `${item.color}12`, boxShadow: `0 0 18px ${item.color}25` }}
                  title={item.label}
                >
                  <span style={{ color: item.color }}>{item.icon}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ GLOBE - ALCANCE GLOBAL ═══ */}
      <GlobeSection />

      {/* ═══ PRICING ═══ */}
      <section id="precos" className="relative py-8 px-4 md:px-8 scroll-mt-24">
        <SectionHeader tag="Preços" title={<>Plano ideal para <span className="landing-gradient-text">cada fase.</span></>} />
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className={`text-[13px] transition-colors ${!annualPricing ? 'text-white' : 'text-white/40'}`}>Mensal</span>
          <button
            onClick={() => setAnnualPricing(!annualPricing)}
            className={`relative w-12 h-6 rounded-full transition-colors ${annualPricing ? 'bg-[#7B2FF2]' : 'bg-white/20'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${annualPricing ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-[13px] transition-colors ${annualPricing ? 'text-white' : 'text-white/40'}`}>Anual</span>
          {annualPricing && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">-20%</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1000px] mx-auto">
          {PRICING_PLANS.map((plan, i) => (
            <div key={plan.name} className="h-[480px]">
              <PremiumPricingCard plan={plan} annual={annualPricing} index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEEDBACKS - INSTAGRAM STORIES STYLE ═══ */}
      <section className="relative py-12 px-4 md:px-8">
        <SectionHeader tag="Feedbacks" title={<>O que nossos clientes <span className="landing-gradient-text">dizem.</span></>} />
        <StoriesTestimonials />
      </section>

      
      {/* ═══ FAQ ═══ */}
      <section id="faq" className="relative py-16 px-4 md:px-8 scroll-mt-24">
        <SectionHeader tag="FAQ" title={<>Perguntas <span className="text-white/20">frequentes.</span></>} />
        <div className="max-w-2xl mx-auto space-y-2">
          {FAQ_DATA.map((item, i) => (
            <div key={i} className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.02] backdrop-blur-sm">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-[13px] font-semibold text-white/80">{item.q}</span>
                <ChevronDown className={`h-4 w-4 text-white/30 transition-transform shrink-0 ml-3 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-[13px] text-white/45 leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative py-20 px-4 md:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-[-0.03em] text-white">
              Pronto para <span className="landing-gradient-text">automatizar</span> suas vendas?
            </h2>
            <p className="text-white/40 text-sm mt-4 max-w-md mx-auto">
              Junte-se a +2.400 empresas que já usam IA para prospectar, qualificar e fechar negócios no piloto automático.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <button onClick={() => navigate('/auth')} className="nav-shimmer-btn group !h-12 !min-w-[220px]">
                <span className="nav-shimmer-icon !w-10 !h-10"><ArrowRight className="h-4 w-4 text-white nav-shimmer-arrow" /></span>
                <span className="nav-shimmer-text !text-[14px]">Começar agora</span>
              </button>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              {['Sem cartão', 'Setup 5 min', 'Cancele a qualquer hora'].map(t => (
                <span key={t} className="flex items-center gap-1 text-[10px] text-white/25">
                  <Check className="h-3 w-3 text-emerald-500/50" /> {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      </div>{/* end scroll curve wrapper */}

      {/* ═══ FOOTER ═══ */}
      <footer className="relative border-t border-white/[0.05] py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="NexaProspect" className="h-6 w-6 rounded-lg object-contain" />
            <span className="text-[13px] font-bold text-white/60">NexaProspect</span>
          </div>
          <p className="text-[11px] text-white/20">© {new Date().getFullYear()} NexaProspect. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
