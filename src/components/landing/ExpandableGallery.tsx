import { useRef, useState, useEffect, useCallback } from 'react';
import { Target, Bot, MessageSquare, BarChart3, Shield, Globe, Zap } from 'lucide-react';

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
    desc: 'IA que qualifica, responde objeções e agenda reuniões no WhatsApp — 24h por dia, em português natural.',
    icon: Bot,
    color: '#7B2FF2',
    image: 'https://images.unsplash.com/photo-1677442135136-760c813028c4?auto=format&fit=crop&q=80&w=720',
  },
  {
    title: 'Anti-ban',
    desc: 'Warm-up progressivo, delays humanizados e rotação de chips. Zero banimentos em mais de 4 meses.',
    icon: Shield,
    color: '#E91E8C',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=720',
  },
  {
    title: 'Envio em Massa',
    desc: 'Dispare mensagens personalizadas com spintax para milhares de leads — com controle total de velocidade.',
    icon: MessageSquare,
    color: '#00B4D8',
    image: 'https://images.unsplash.com/photo-1611606063065-ee7946f0787a?auto=format&fit=crop&q=80&w=720',
  },
  {
    title: 'CRM Pipeline',
    desc: 'Pipeline visual com deal value, qualificação BANT e integração direta com Meta Ads.',
    icon: Target,
    color: '#F7941D',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=720',
  },
  {
    title: 'Analytics',
    desc: 'Saiba qual nicho, horário e template converte mais — e otimize cada centavo investido em tempo real.',
    icon: BarChart3,
    color: '#7B2FF2',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=720',
  },
  {
    title: 'Automações',
    desc: 'Follow-up automático, reativação de leads frios, relatórios agendados. Liga e desliga com 1 clique.',
    icon: Zap,
    color: '#E91E8C',
    image: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?auto=format&fit=crop&q=80&w=720',
  },
];

export function ExpandableGallery() {
  const listRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [articleWidth, setArticleWidth] = useState(0);

  const resync = useCallback(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('li');
    let maxW = 0;
    items.forEach((item) => { maxW = Math.max(maxW, item.offsetWidth); });
    setArticleWidth(maxW);
  }, []);

  useEffect(() => {
    resync();
    window.addEventListener('resize', resync);
    const t = setTimeout(resync, 150);
    return () => { window.removeEventListener('resize', resync); clearTimeout(t); };
  }, [resync]);

  const handleInteraction = useCallback((e: React.MouseEvent | React.FocusEvent) => {
    const li = (e.target as HTMLElement).closest('li');
    if (!li || !listRef.current) return;
    const items = Array.from(listRef.current.querySelectorAll('li'));
    const idx = items.indexOf(li);
    if (idx !== -1) setActiveIndex(idx);
  }, []);

  const cols = FEATURES.map((_, i) => (i === activeIndex ? '10fr' : '1fr')).join(' ');

  return (
    <section className="py-28 px-6 lg:px-12 relative">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(123,47,242,0.06) 0%, transparent 50%)' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-[0.2em] text-[#7B2FF2] uppercase">Plataforma completa</span>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mt-4">
            Tudo que você precisa, <span className="text-white/30">em um só lugar.</span>
          </h2>
        </div>

        {/* Gallery */}
        <ul
          ref={listRef}
          onClick={handleInteraction}
          onPointerMove={handleInteraction}
          onFocus={handleInteraction}
          className="relative grid gap-2 list-none p-0 m-0 mx-auto w-full max-w-[920px]"
          style={{
            gridTemplateColumns: cols,
            height: 'clamp(320px, 42dvh, 480px)',
            transition: 'grid-template-columns 0.6s cubic-bezier(0.16,1,0.3,1)',
            containerType: 'inline-size',
            ['--article-width' as string]: `${articleWidth}`,
          }}
        >
          {FEATURES.map((feature, i) => {
            const isActive = i === activeIndex;
            const Icon = feature.icon;

            return (
              <li
                key={feature.title}
                data-active={isActive}
                className="relative overflow-hidden rounded-xl border border-white/[0.08] cursor-pointer"
                style={{
                  background: '#0B0D15',
                  minWidth: 'clamp(2rem, 8cqi, 80px)',
                }}
              >
                <article
                  className="absolute top-0 left-0 h-full flex flex-col justify-end gap-3 overflow-hidden"
                  style={{
                    width: `${articleWidth}px`,
                    paddingInline: 'calc(clamp(2rem, 8cqi, 80px) * 0.5 - 9px)',
                    paddingBottom: '1rem',
                    fontFamily: 'inherit',
                  }}
                >
                  {/* Vertical title (collapsed) */}
                  <h3
                    className="absolute whitespace-nowrap text-sm font-light uppercase tracking-wider"
                    style={{
                      top: '1rem',
                      left: 'calc(clamp(2rem, 8cqi, 80px) * 0.5)',
                      transformOrigin: '0 50%',
                      rotate: '90deg',
                      color: feature.color,
                      opacity: isActive ? 1 : 0.5,
                      transition: 'opacity 0.72s cubic-bezier(0.16,1,0.3,1)',
                    }}
                  >
                    {feature.title}
                  </h3>

                  {/* Icon */}
                  <Icon
                    className="w-[18px] h-[18px]"
                    style={{
                      color: feature.color,
                      opacity: isActive ? 1 : 0.5,
                      transition: 'opacity 0.72s cubic-bezier(0.16,1,0.3,1)',
                    }}
                  />

                  {/* Description */}
                  <p
                    className="text-[13px] leading-[1.35] text-white/70"
                    style={{
                      textWrap: 'balance',
                      opacity: isActive ? 0.8 : 0,
                      transition: `opacity 0.72s cubic-bezier(0.16,1,0.3,1)`,
                      transitionDelay: isActive ? '0.15s' : '0s',
                      width: 'fit-content',
                    }}
                  >
                    {feature.desc}
                  </p>

                  {/* CTA */}
                  <span
                    className="text-[13px] font-medium"
                    style={{
                      color: feature.color,
                      opacity: isActive ? 1 : 0,
                      transition: 'opacity 0.72s cubic-bezier(0.16,1,0.3,1)',
                      transitionDelay: isActive ? '0.15s' : '0s',
                      width: 'fit-content',
                    }}
                  >
                    Saiba mais →
                  </span>

                  {/* Background image */}
                  <img
                    src={feature.image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{
                      mask: 'radial-gradient(100% 100% at 100% 0, #fff, #0000)',
                      WebkitMask: 'radial-gradient(100% 100% at 100% 0, #fff, #0000)',
                      filter: isActive ? 'grayscale(0) brightness(1)' : 'grayscale(1) brightness(1.5)',
                      scale: isActive ? '1' : '1.1',
                      transition: 'filter 0.72s cubic-bezier(0.16,1,0.3,1), scale 0.72s cubic-bezier(0.16,1,0.3,1)',
                      transitionDelay: isActive ? '0.15s' : '0s',
                    }}
                  />
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
