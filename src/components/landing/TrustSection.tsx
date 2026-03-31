import { useRef, useState, useEffect, useCallback } from 'react';
import { Shield, Lock, Server, Clock, Award, Headphones } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: Shield, title: 'Anti-ban nativo', desc: 'Warm-up progressivo, delays humanizados e rotação de chips. Seu número protegido 24h.', color: '#7B2FF2', image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=720' },
  { icon: Lock, title: 'LGPD Compliance', desc: 'Dados criptografados, consentimento rastreável e exclusão sob demanda. 100% em conformidade.', color: '#00B4D8', image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=720' },
  { icon: Server, title: '99.9% Uptime', desc: 'Infraestrutura robusta na AWS com redundância e monitoramento em tempo real.', color: '#E91E8C', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=720' },
  { icon: Clock, title: 'Setup em 5 min', desc: 'Conecte o WhatsApp, escolha o nicho e a IA já começa a prospectar. Zero configuração técnica.', color: '#F7941D', image: 'https://images.unsplash.com/photo-1611606063065-ee7946f0787a?auto=format&fit=crop&q=80&w=720' },
  { icon: Award, title: 'Nota 4.9/5', desc: 'Avaliado por +2.400 usuários com nota máxima em suporte, facilidade e resultados.', color: '#7B2FF2', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=720' },
  { icon: Headphones, title: 'Suporte dedicado', desc: 'Atendimento rápido em português via WhatsApp e e-mail. Humanos de verdade, não bots.', color: '#00B4D8', image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=720' },
];

export function TrustSection() {
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

  const cols = TRUST_ITEMS.map((_, i) => (i === activeIndex ? '10fr' : '1fr')).join(' ');

  return (
    <ul
      ref={listRef}
      onClick={handleInteraction}
      onPointerMove={handleInteraction}
      onFocus={handleInteraction}
      className="relative grid gap-2 list-none p-0 m-0 mx-auto w-full"
      style={{
        gridTemplateColumns: cols,
        height: 'clamp(280px, 36dvh, 420px)',
        transition: 'grid-template-columns 0.6s cubic-bezier(0.16,1,0.3,1)',
        containerType: 'inline-size',
      }}
    >
      {TRUST_ITEMS.map((item, i) => {
        const isActive = i === activeIndex;
        const Icon = item.icon;

        return (
          <li
            key={item.title}
            className="relative overflow-hidden rounded-xl border border-white/[0.08] cursor-pointer"
            style={{ background: '#0B0D15', minWidth: 'clamp(2rem, 8cqi, 70px)' }}
          >
            <article
              className="absolute top-0 left-0 h-full flex flex-col justify-end gap-3 overflow-hidden"
              style={{
                width: `${articleWidth}px`,
                paddingInline: 'calc(clamp(2rem, 8cqi, 70px) * 0.5 - 6px)',
                paddingBottom: '1.25rem',
              }}
            >
              {/* Vertical title (collapsed state) */}
              <h3
                className="absolute whitespace-nowrap text-[13px] font-light uppercase tracking-wider"
                style={{
                  top: '1rem',
                  left: 'calc(clamp(2rem, 8cqi, 70px) * 0.5)',
                  transformOrigin: '0 50%',
                  rotate: '90deg',
                  color: item.color,
                  opacity: isActive ? 1 : 0.5,
                  transition: 'opacity 0.72s cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                {item.title}
              </h3>

              {/* Icon */}
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center z-10"
                style={{
                  background: `${item.color}15`,
                  border: `1px solid ${item.color}25`,
                  opacity: isActive ? 1 : 0.5,
                  transition: 'opacity 0.72s cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                <Icon className="h-4.5 w-4.5" style={{ color: item.color }} />
              </div>

              {/* Title (expanded) */}
              <h4
                className="text-[15px] font-bold text-white z-10"
                style={{
                  opacity: isActive ? 1 : 0,
                  transition: 'opacity 0.72s cubic-bezier(0.16,1,0.3,1)',
                  transitionDelay: isActive ? '0.15s' : '0s',
                  width: 'fit-content',
                }}
              >
                {item.title}
              </h4>

              {/* Description */}
              <p
                className="text-[12px] leading-[1.5] text-white/60 z-10"
                style={{
                  opacity: isActive ? 0.8 : 0,
                  transition: 'opacity 0.72s cubic-bezier(0.16,1,0.3,1)',
                  transitionDelay: isActive ? '0.15s' : '0s',
                  width: 'fit-content',
                  textWrap: 'balance',
                }}
              >
                {item.desc}
              </p>

              {/* Background image */}
              <img
                src={item.image}
                alt=""
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                style={{
                  mask: 'radial-gradient(100% 100% at 100% 0, #fff, #0000)',
                  WebkitMask: 'radial-gradient(100% 100% at 100% 0, #fff, #0000)',
                  filter: isActive ? 'grayscale(0) brightness(0.7)' : 'grayscale(1) brightness(1.5)',
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
  );
}
