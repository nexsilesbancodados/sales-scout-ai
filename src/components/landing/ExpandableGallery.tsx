import { useEffect, useRef } from 'react';
import { Target, Bot, MessageSquare, BarChart3, Shield, Globe, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    title: 'Google Maps',
    desc: 'Capture leads com telefone, endereço e avaliação direto do Maps. Filtre por nicho, cidade e nota.',
    icon: Globe,
    color: '#34A853',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=720',
  },
  {
    title: 'Agente SDR',
    desc: 'IA que qualifica, responde objeções e agenda reuniões no WhatsApp — 24h por dia.',
    icon: Bot,
    color: '#7B2FF2',
    image: 'https://images.unsplash.com/photo-1677442135136-760c813028c4?auto=format&fit=crop&q=80&w=720',
  },
  {
    title: 'Anti-ban',
    desc: 'Warm-up progressivo, delays humanizados e rotação de chips. Zero banimentos.',
    icon: Shield,
    color: '#E91E8C',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=720',
  },
  {
    title: 'Envio em Massa',
    desc: 'Mensagens personalizadas com spintax para milhares de leads — controle total.',
    icon: MessageSquare,
    color: '#00B4D8',
    image: 'https://images.unsplash.com/photo-1611606063065-ee7946f0787a?auto=format&fit=crop&q=80&w=720',
  },
  {
    title: 'CRM Pipeline',
    desc: 'Pipeline visual com deal value, qualificação BANT e integração com Meta Ads.',
    icon: Target,
    color: '#F7941D',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=720',
  },
  {
    title: 'Analytics',
    desc: 'Descubra qual nicho, horário e template converte mais — otimize em tempo real.',
    icon: BarChart3,
    color: '#7B2FF2',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=720',
  },
  {
    title: 'Automações',
    desc: 'Follow-up automático, reativação, relatórios agendados. Liga/desliga com 1 clique.',
    icon: Zap,
    color: '#E91E8C',
    image: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?auto=format&fit=crop&q=80&w=720',
  },
];

export function ExpandableGallery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let ctx: ReturnType<typeof import('gsap').default.context> | null = null;

    const init = async () => {
      const gsapMod = await import('gsap');
      const stMod = await import('gsap/ScrollTrigger');
      const gsap = gsapMod.default;
      const ScrollTrigger = stMod.default;
      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      ctx = gsap.context(() => {
        const totalScroll = track.scrollWidth - window.innerWidth;

        gsap.to(track, {
          x: -totalScroll,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${totalScroll}`,
            scrub: 1.5,
            pin: true,
            anticipatePin: 1,
          },
        });

        // Fade in cards as they enter viewport
        const cards = track.querySelectorAll('.hscroll-card');
        cards.forEach((card, i) => {
          gsap.fromTo(
            card,
            { opacity: 0.3, scale: 0.92, rotateY: -8 },
            {
              opacity: 1,
              scale: 1,
              rotateY: 0,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                containerAnimation: gsap.getById?.('hscroll') || undefined,
                start: 'left 80%',
                end: 'left 40%',
                scrub: true,
                // Use the main horizontal scroll as reference
              },
              // Fallback: simple delay-based stagger
              delay: i * 0.05,
              duration: 0.6,
            }
          );
        });
      }, section);
    };

    init();
    return () => { ctx?.revert(); };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ minHeight: '100vh' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(123,47,242,0.06) 0%, transparent 50%)' }}
      />

      {/* Fixed header above pinned area */}
      <div className="relative z-20 text-center pt-28 pb-10 px-6">
        <span className="text-xs font-semibold tracking-[0.2em] text-[#7B2FF2] uppercase">
          Plataforma completa
        </span>
        <h2 className="text-3xl lg:text-5xl font-bold text-white mt-4">
          Tudo que você precisa, <span className="text-white/30">em um só lugar.</span>
        </h2>
        <p className="text-white/40 mt-4 max-w-lg mx-auto text-sm">
          Role para explorar todos os módulos da plataforma.
        </p>
      </div>

      {/* Horizontal scrolling track */}
      <div
        ref={trackRef}
        className="relative z-10 flex items-center gap-6 px-[5vw] py-12"
        style={{
          width: 'max-content',
          perspective: '1200px',
        }}
      >
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div
              key={i}
              className="hscroll-card relative flex-shrink-0 w-[340px] md:w-[400px] h-[480px] rounded-[1.5rem] border border-white/[0.08] overflow-hidden group cursor-pointer"
              style={{ background: '#0E1018', transformStyle: 'preserve-3d' }}
              onClick={() => navigate('/auth')}
            >
              {/* Image */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1018] via-[#0E1018]/70 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-end p-7">
                {/* Colored line accent */}
                <div
                  className="w-10 h-[2px] mb-5 rounded-full transition-all duration-500 group-hover:w-16"
                  style={{ background: feature.color }}
                />

                {/* Icon */}
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}30` }}
                >
                  <Icon className="h-5 w-5" style={{ color: feature.color }} />
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed mb-4">{feature.desc}</p>

                <span
                  className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1"
                  style={{ color: feature.color }}
                >
                  Explorar →
                </span>
              </div>

              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[1.5rem]"
                style={{
                  boxShadow: `inset 0 0 60px ${feature.color}08, 0 0 40px ${feature.color}06`,
                }}
              />
            </div>
          );
        })}

        {/* End spacer for smooth scroll finish */}
        <div className="flex-shrink-0 w-[10vw]" />
      </div>
    </section>
  );
}
