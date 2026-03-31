import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { ArrowRight, Star, Check, Menu, X, Sparkles, Quote, Search, MessageSquare, Bot, CalendarCheck, Home, CreditCard, Zap, BarChart3, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import heroVideo from '@/assets/hero-video.mp4';
import logoImg from '@/assets/logo.png';
import advantageProspecting from '@/assets/advantage-prospecting.jpg';
import advantageMessaging from '@/assets/advantage-messaging.jpg';
import advantageSdr from '@/assets/advantage-sdr.jpg';
import advantageMeetings from '@/assets/advantage-meetings.jpg';
import { CosmicBackground } from '@/components/landing/CosmicBackground';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ADVANTAGES = [
  {
    id: 1,
    icon: Search,
    title: 'Prospecção Automática',
    subtitle: 'Google Maps · Instagram · Facebook',
    image: advantageProspecting,
    detail: 'A IA varre milhares de empresas no Google Maps, Instagram e Facebook, extraindo leads qualificados com nome, telefone e e-mail — sem você mover um dedo.',
  },
  {
    id: 2,
    icon: MessageSquare,
    title: 'Envio Inteligente',
    subtitle: 'WhatsApp · Anti-Ban · Spintax',
    image: advantageMessaging,
    detail: 'Mensagens personalizadas enviadas pelo WhatsApp com sistema anti-bloqueio, variações de texto e delay humanizado. Parece manual, mas é 100% automático.',
  },
  {
    id: 3,
    icon: Bot,
    title: 'Agente SDR com IA',
    subtitle: 'Qualifica · Responde · Converte',
    image: advantageSdr,
    detail: 'Um agente de IA conversa com seus leads 24/7, qualifica pelo método BANT, contorna objeções e avança o lead no funil — tudo automaticamente.',
  },
  {
    id: 4,
    icon: CalendarCheck,
    title: 'Reuniões Agendadas',
    subtitle: 'Google Meet · Automático · CRM',
    image: advantageMeetings,
    detail: 'O sistema agenda reuniões direto no Google Meet e move o lead para a etapa certa do CRM. Você só aparece na call e fecha o negócio.',
  },
];

const NAV_LINKS = [
  { label: 'Recursos', href: '#recursos', icon: Zap },
  { label: 'Produto', href: '#produto', icon: BarChart3 },
  { label: 'Preços', href: '#precos', icon: CreditCard },
  { label: 'Cases', href: '#cases', icon: Star },
  { label: 'FAQ', href: '#faq', icon: HelpCircle },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState('');
  const [hoveredNav, setHoveredNav] = useState<number | null>(null);

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
          const sections = NAV_LINKS.map(l => l.href.replace('#', ''));
          let current = '';
          for (const id of sections) {
            const el = document.getElementById(id);
            if (el && el.getBoundingClientRect().top <= 200) {
              current = id;
            }
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

  const advantagesRef = useRef<HTMLDivElement>(null);
  const flipCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // GSAP wave parallax on scroll
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.wave-light-blue', {
        xPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
      gsap.to('.wave-white', {
        xPercent: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  // GSAP flip cards on scroll — smoother scrub + stagger
  useEffect(() => {
    if (!advantagesRef.current) return;

    const ctx = gsap.context(() => {
      // First: fade in the cards with a stagger entrance
      gsap.set(flipCardsRef.current, { opacity: 0, y: 60 });

      const enterTl = gsap.timeline({
        scrollTrigger: {
          trigger: advantagesRef.current,
          start: 'top 80%',
          end: 'top 20%',
          scrub: 1,
        },
      });

      flipCardsRef.current.forEach((card, i) => {
        if (!card) return;
        enterTl.to(card, { opacity: 1, y: 0, duration: 0.5 }, i * 0.12);
      });

      // Then: pin and flip cards sequentially
      const flipTl = gsap.timeline({
        scrollTrigger: {
          trigger: advantagesRef.current,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 1.5,
          anticipatePin: 1,
          snap: {
            snapTo: 1 / (ADVANTAGES.length),
            duration: { min: 0.2, max: 0.6 },
            ease: 'power1.inOut',
          },
        },
      });

      flipCardsRef.current.forEach((card, index) => {
        if (!card) return;
        // Add a small pause, then flip, then small pause
        flipTl
          .to(card, { rotationY: 90, ease: 'power2.in', duration: 0.5 }, index * 1)
          .to(card, { rotationY: 180, ease: 'power2.out', duration: 0.5 }, index * 1 + 0.5);
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="text-white min-h-screen overflow-x-hidden relative">
      <CosmicBackground />

      {/* ═══ NAVBAR ═══ */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#0B0D15]/95 border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl' : 'bg-transparent'}`}>
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="NexaProspect" className="h-8 w-8 rounded-lg object-contain" />
            <span className="text-[15px] font-bold tracking-[-0.02em] text-white">NexaProspect</span>
          </div>

          <div className="hidden lg:flex items-center bg-white/[0.08] border border-white/[0.08] rounded-full px-1.5 py-1">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href}
                className={`text-[13px] px-5 py-1.5 rounded-full transition-all duration-200 font-medium ${activeNav === l.href.replace('#', '') ? 'text-white bg-white/[0.1]' : 'text-white/45 hover:text-white/80 hover:bg-white/[0.06]'}`}
              >{l.label}</a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link to="/auth" className="hidden lg:block text-[13px] text-white/50 hover:text-white/80 transition-colors font-medium">Entrar</Link>
            <div className="hidden lg:block">
              <LiquidButton onClick={() => navigate('/auth')} className="text-[13px] px-6 py-2.5 rounded-full font-semibold">
                Começar grátis
              </LiquidButton>
            </div>
            <button className="lg:hidden text-white/60" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${mobileMenu ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-[#0B0D15]/98 border-t border-white/[0.04] px-8 py-5 space-y-1">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} className="block text-[13px] text-white/50 hover:text-white py-2.5 transition-colors" onClick={() => setMobileMenu(false)}>{l.label}</a>
            ))}
            <Link to="/auth" className="block text-center bg-white text-[#0B0D15] text-[13px] font-semibold px-5 py-2.5 rounded-full mt-4" onClick={() => setMobileMenu(false)}>Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="hero-section min-h-screen relative overflow-hidden flex items-center">
        <div className="absolute inset-0 pointer-events-none">
          <video
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 hero-energy-overlay" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D15]/80 via-[#0B0D15]/40 to-[#0B0D15]/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D15] via-transparent to-[#0B0D15]/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D15]/60 via-transparent to-transparent" />
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

            <div className="flex flex-wrap items-center gap-4 mt-4 animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'both' }}>
              <span className="flex items-center gap-1.5 text-[11px] text-white/30">
                <Check className="h-3 w-3 text-emerald-500/60" /> Sem cartão de crédito
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-white/30">
                <Check className="h-3 w-3 text-emerald-500/60" /> Setup em 5 min
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-white/30">
                <Check className="h-3 w-3 text-emerald-500/60" /> Cancele quando quiser
              </span>
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

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <a href="#recursos" className="block" aria-label="Rolar para baixo">
            <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
              <div className="w-1 h-2.5 bg-white/40 rounded-full landing-scroll-dot" />
            </div>
          </a>
        </div>
        {/* Wave transition */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] h-[200px] z-20">
          <svg
            className="wave-shape wave-light-blue absolute bottom-[20px] left-0 block h-[160px] opacity-50 z-[2]"
            style={{ width: '200%', animation: 'waveShift 10s ease-in-out infinite' }}
            viewBox="0 0 1000 100" preserveAspectRatio="none"
          >
            <path d="M0,1.7c10.2,3.2,35.2,10.2,76.5,10.1C117.9,11.7,156.3,1.3,204.7,0.3c48.3-1,76.2,11.5,108.2,11 c32,0.5,86.5-1.2,109-3.7c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.2,26.9,145.1,36.2c75.3,9.3,145.3,8.5,188.6,10.3 c43.4,1.8,89.4,19,147.3,18.4c58.7-0.6,85.3-7.7,103.6-11V100H0V1.7z" fill="hsl(var(--primary) / 0.4)" />
          </svg>
          <svg
            className="wave-shape wave-white absolute bottom-0 left-0 block h-[160px] z-[3]"
            style={{ width: '200%', animation: 'waveShift 10s ease-in-out infinite' }}
            viewBox="0 0 1000 100" preserveAspectRatio="none"
          >
            <path d="M0,1.7c10.2,3.2,35.2,10.2,76.5,10.1C117.9,11.7,156.3,1.3,204.7,0.3c48.3-1,76.2,11.5,108.2,11 c32,0.5,86.5-1.2,109-3.7c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.2,26.9,145.1,36.2c75.3,9.3,145.3,8.5,188.6,10.3 c43.4,1.8,89.4,19,147.3,18.4c58.7-0.6,85.3-7.7,103.6-11V100H0V1.7z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* ═══ VANTAGENS — FLIP CARDS ═══ */}
      <section
        id="recursos"
        ref={advantagesRef}
        className="relative h-screen flex flex-col items-center justify-center overflow-hidden px-4 md:px-12 bg-[#0B0D15]"
      >
        {/* Title */}
        <div className="text-center mb-12 relative z-10">
          <span className="text-[12px] uppercase tracking-[0.3em] text-[#F7941D] font-semibold">Por que NexaProspect</span>
          <h2 className="text-[36px] sm:text-[48px] font-black tracking-[-0.03em] mt-3 text-white">
            Tudo que você precisa.<br className="hidden sm:block" />
            <span className="text-white/30">Num só lugar.</span>
          </h2>
        </div>

        {/* Flip Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1600px] w-full">
          {ADVANTAGES.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="h-[480px] w-full" style={{ perspective: '2000px' }}>
                <div
                  ref={(el) => { flipCardsRef.current[index] = el; }}
                  className="relative w-full h-full cursor-pointer"
                  style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
                >
                  {/* FRONT — Image + Title */}
                  <div
                    className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                  >
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-8">
                      <div className="w-10 h-10 rounded-xl bg-[#F7941D]/20 border border-[#F7941D]/30 flex items-center justify-center mb-3">
                        <Icon className="h-5 w-5 text-[#F7941D]" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{item.title}</h3>
                      <p className="text-[13px] text-white/50 uppercase tracking-[0.15em] font-medium mt-1">{item.subtitle}</p>
                    </div>
                  </div>

                  {/* BACK — Detail text */}
                  <div
                    className="absolute inset-0 rounded-2xl overflow-hidden bg-[#0B0D15] border border-white/10 flex flex-col"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      backgroundImage: `
                        linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
                      `,
                      backgroundSize: '40px 40px',
                    }}
                  >
                    {/* Quote icon */}
                    <div className="absolute top-8 right-8 text-[#F7941D]/60">
                      <div className="flex gap-0.5">
                        <Quote size={20} fill="currentColor" strokeWidth={0} />
                        <Quote size={20} fill="currentColor" strokeWidth={0} className="-ml-1" />
                      </div>
                    </div>

                    <div className="relative h-full flex flex-col justify-between p-10 z-10">
                      <div className="mt-12">
                        <p className="text-white text-lg md:text-xl font-serif leading-relaxed italic border-l-2 border-[#F7941D] pl-6">
                          {item.detail}
                        </p>
                      </div>

                      <div className="pt-6">
                        <div className="w-12 h-1 bg-[#F7941D] mb-4" />
                        <p className="text-white font-black text-lg uppercase tracking-tighter italic">{item.title}</p>
                        <p className="text-white/30 text-xs uppercase tracking-widest mt-1 font-bold">NexaProspect</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ MARQUEE SECTION ═══ */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden bg-[#0B0D15]">
        {/* Black band (behind) */}
        <div
          className="absolute select-none whitespace-nowrap overflow-hidden flex py-2"
          style={{ width: '160%', left: '-30%', transform: 'rotate(0.8deg)', top: '50%', zIndex: 5, borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="flex w-max marquee-scroll-reverse">
            {Array.from({ length: 40 }).map((_, i) => {
              const words = ['Prospecção', 'Automação', 'WhatsApp', 'Leads', 'Conversão', 'Google Maps', 'Instagram', 'IA', 'CRM', 'Pipeline'];
              return (
                <span key={`b-${i}`} className="flex items-center text-[20px] font-light uppercase tracking-wide text-white/80 px-2">
                  {words[i % words.length]}
                  <span className="w-[5px] h-[5px] rounded-full bg-white/60 ml-2.5 inline-block" />
                </span>
              );
            })}
          </div>
        </div>

        {/* White band (front) */}
        <div
          className="absolute select-none whitespace-nowrap overflow-hidden flex py-2 bg-white shadow-[0_8px_25px_rgba(0,0,0,0.7)]"
          style={{ width: '160%', left: '-30%', transform: 'rotate(-3deg)', top: '48%', zIndex: 10 }}
        >
          <div className="flex w-max marquee-scroll">
            {Array.from({ length: 40 }).map((_, i) => {
              const words = ['NexaProspect', 'SDR Agent', 'Anti-Ban', 'Spintax', 'Follow-Up', 'Reuniões', 'BANT', 'Funil', 'Multi-Chip', 'ROI'];
              return (
                <span key={`w-${i}`} className="flex items-center text-[20px] font-light uppercase tracking-wide text-black px-2">
                  {words[i % words.length]}
                  <span className="w-[5px] h-[5px] rounded-full bg-black ml-2.5 inline-block" />
                </span>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
