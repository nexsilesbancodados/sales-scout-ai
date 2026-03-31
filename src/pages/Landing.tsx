import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { ArrowRight, Star, Check, Menu, X, Sparkles } from 'lucide-react';
import heroVideo from '@/assets/hero-video.mp4';
import logoImg from '@/assets/logo.png';
import { LiquidButton } from '@/components/ui/liquid-button';
import { CosmicBackground } from '@/components/landing/CosmicBackground';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  { label: 'Recursos', href: '#recursos' },
  { label: 'Produto', href: '#produto' },
  { label: 'Preços', href: '#precos' },
  { label: 'Cases', href: '#cases' },
  { label: 'FAQ', href: '#faq' },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState('');

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

      {/* Section after wave */}
      <section className="min-h-[50vh] flex items-center justify-center bg-background text-foreground relative z-0">
        <div className="text-center px-4">
          {/* Placeholder for next content */}
        </div>
      </section>

    </div>
  );
}
