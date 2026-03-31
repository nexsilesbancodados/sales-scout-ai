import { useEffect, useRef } from 'react';
import { Target, Bot, MessageSquare, Columns3, Zap, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FEATURES_CARDS = [
  {
    icon: Target,
    title: 'Prospecção Automática',
    desc: 'Encontre até 500 leads/semana no Google Maps, Instagram e Facebook — sem digitar uma linha.',
    color: '#7B2FF2',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1920&auto=format&fit=crop',
    cta: 'Explorar prospecção',
  },
  {
    icon: Bot,
    title: 'Agente SDR com IA',
    desc: 'Sua IA responde em segundos, qualifica com BANT e agenda reuniões — 24h por dia, 7 dias por semana.',
    color: '#E91E8C',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1920&auto=format&fit=crop',
    cta: 'Conhecer agente IA',
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp Integrado',
    desc: 'Dispare mensagens personalizadas em massa com anti-ban, spintax e delays que imitam comportamento humano.',
    color: '#00B4D8',
    image: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?q=80&w=1920&auto=format&fit=crop',
    cta: 'Ver integração',
  },
  {
    icon: Columns3,
    title: 'CRM Completo',
    desc: 'Pipeline visual com deal value, qualificação BANT e integração direta com Meta Ads.',
    color: '#F7941D',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1920&auto=format&fit=crop',
    cta: 'Explorar CRM',
  },
  {
    icon: Zap,
    title: '9 Automações Poderosas',
    desc: 'Prospecção agendada, reativação de leads frios, relatórios automáticos. Liga e desliga com 1 clique.',
    color: '#7B2FF2',
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1920&auto=format&fit=crop',
    cta: 'Ver automações',
  },
  {
    icon: BarChart3,
    title: 'Analytics em Tempo Real',
    desc: 'Saiba exatamente qual nicho, horário e template converte mais — e otimize cada centavo investido.',
    color: '#E91E8C',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1920&auto=format&fit=crop',
    cta: 'Ver analytics',
  },
];

export function ScrollStackingCards() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let gsapInstance: typeof import('gsap').default | null = null;
    let scrollTriggerInstance: typeof import('gsap/ScrollTrigger').default | null = null;
    let ctx: ReturnType<typeof import('gsap').default.context> | null = null;

    const initGSAP = async () => {
      const gsapModule = await import('gsap');
      const scrollTriggerModule = await import('gsap/ScrollTrigger');

      gsapInstance = gsapModule.default;
      scrollTriggerInstance = scrollTriggerModule.default;
      gsapInstance.registerPlugin(scrollTriggerInstance);

      const section = sectionRef.current;
      const container = cardsRef.current;
      if (!section || !container) return;

      const cards = container.querySelectorAll<HTMLElement>('.stack-card');
      if (cards.length === 0) return;

      ctx = gsapInstance.context(() => {
        // Position all cards except first off-screen below
        gsapInstance!.set(Array.from(cards).slice(1), { yPercent: 120 });

        const tl = gsapInstance!.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${cards.length * 120}vh`,
            scrub: 2,
            pin: true,
          },
        });

        cards.forEach((card, index) => {
          if (index === 0) return;

          // New card slides up
          tl.to(card, {
            yPercent: 0,
            duration: 1,
            ease: 'power3.inOut',
          }, index);

          // Previous cards scale down and shift up
          Array.from(cards).slice(0, index).forEach((prevCard, prevIndex) => {
            const depth = index - prevIndex;
            const overlay = prevCard.querySelector('.stack-card-overlay');

            tl.to(prevCard, {
              scale: 1 - 0.05 * depth,
              y: -20 * depth,
              duration: 1,
              ease: 'power3.inOut',
            }, index);

            if (overlay) {
              tl.to(overlay, {
                opacity: 0.3 * depth,
                duration: 1,
                ease: 'power3.inOut',
              }, index);
            }
          });
        });
      }, section);
    };

    initGSAP();

    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="recursos"
      className="relative w-full"
      style={{ minHeight: '100vh' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(123,47,242,0.06) 0%, transparent 50%)',
        }}
      />

      {/* Header - positioned above the pinned area */}
      <div className="relative z-10 text-center pt-28 pb-12 px-6">
        <span className="text-xs font-semibold tracking-[0.2em] text-[#E91E8C] uppercase">
          Recursos
        </span>
        <h2 className="text-3xl lg:text-5xl font-bold text-white mt-4">
          6 armas para <span className="landing-gradient-text">dominar seu mercado</span>
        </h2>
        <p className="text-white/40 mt-4 max-w-lg mx-auto text-sm">
          Da captura ao fechamento — tudo integrado numa única plataforma.
        </p>
      </div>

      {/* Stacking cards area */}
      <div className="relative flex items-center justify-center" style={{ height: '100vh' }}>
        <div
          ref={cardsRef}
          className="relative w-[90vw] max-w-[1000px]"
          style={{
            height: '75vh',
            maxHeight: '700px',
            perspective: '1000px',
          }}
        >
          {FEATURES_CARDS.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="stack-card absolute top-0 left-0 w-full h-full rounded-[2rem] border border-white/[0.1] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]"
                style={{
                  transformOrigin: 'top center',
                  willChange: 'transform',
                  background: '#111',
                }}
              >
                {/* Background image */}
                <img
                  src={card.image}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Darkening overlay controlled by GSAP */}
                <div className="stack-card-overlay absolute inset-0 bg-black opacity-0 pointer-events-none" style={{ zIndex: 1 }} />

                {/* Content overlay */}
                <div
                  className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 pointer-events-none"
                  style={{
                    zIndex: 2,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 40%, transparent 100%)',
                  }}
                >
                  <div className="max-w-[85%] pointer-events-auto">
                    {/* Icon badge */}
                    <div
                      className="h-12 w-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-xl"
                      style={{
                        background: `${card.color}20`,
                        border: `1px solid ${card.color}40`,
                      }}
                    >
                      <Icon className="h-6 w-6" style={{ color: card.color }} />
                    </div>

                    <h3 className="text-[clamp(2rem,4vw,3.5rem)] text-white font-light leading-[1.1] tracking-[-0.01em] mb-4" style={{ textWrap: 'balance' as never }}>
                      {card.title}
                    </h3>

                    <p className="text-white/60 text-base md:text-lg max-w-md mb-6 font-light leading-relaxed">
                      {card.desc}
                    </p>

                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => navigate('/auth')}
                        className="rounded-full px-6 py-3 text-sm font-medium text-white border border-white/20 bg-white/10 backdrop-blur-xl transition-all hover:bg-white hover:text-black hover:border-white hover:-translate-y-0.5"
                      >
                        {card.cta}
                      </button>
                      <button
                        onClick={() => navigate('/auth')}
                        className="rounded-full px-6 py-3 text-sm font-medium transition-all hover:-translate-y-0.5"
                        style={{
                          background: `${card.color}30`,
                          border: `1px solid ${card.color}50`,
                          color: card.color,
                        }}
                      >
                        Começar grátis
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inner ring */}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/[0.05] rounded-[2rem] pointer-events-none" style={{ zIndex: 3 }} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
