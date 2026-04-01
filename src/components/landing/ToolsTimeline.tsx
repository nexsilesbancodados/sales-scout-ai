import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MapPin, Instagram, Users, Bot, BarChart3 } from 'lucide-react';

import timelineMaps from '@/assets/timeline-maps.jpg';
import timelineSocial from '@/assets/timeline-social.jpg';
import timelineWhatsapp from '@/assets/timeline-whatsapp.jpg';
import timelineSdr from '@/assets/timeline-sdr.jpg';
import timelineAnalytics from '@/assets/timeline-analytics.jpg';

const ToolImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-black/30 backdrop-blur-sm border border-white/5', className)}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 animate-pulse">
          <div className="h-6 w-6 rounded-full border-2 border-white/10 border-t-white/30 animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={cn(
          'h-full w-full object-cover transition-all duration-700',
          loaded ? 'opacity-100' : 'opacity-0',
          'hover:scale-[1.02] transition-transform duration-500'
        )}
      />
    </div>
  );
};

const TOOLS_DATA = [
  {
    title: 'Maps',
    icon: MapPin,
    heading: 'Prospecção no Google Maps',
    description: 'A IA varre milhares de empresas no Google Maps por nicho e localização, extraindo nome, telefone, e-mail, avaliações e endereço — tudo em segundos.',
    images: [timelineMaps],
  },
  {
    title: 'Social',
    icon: Instagram,
    heading: 'Instagram & Facebook Extractor',
    description: 'Extraia seguidores, perfis comerciais e dados de contato diretamente do Instagram e Facebook.',
    images: [timelineSocial],
  },
  {
    title: 'Grupos',
    icon: Users,
    heading: 'Importação de Grupos WhatsApp',
    description: 'Importe todos os contatos de qualquer grupo do WhatsApp com um clique.',
    images: [timelineWhatsapp],
  },
  {
    title: 'SDR',
    icon: Bot,
    heading: 'Agente SDR Autônomo',
    description: 'Um agente de IA que conversa 24/7, qualifica leads pelo método BANT e agenda reuniões.',
    images: [timelineSdr],
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    heading: 'Métricas & Inteligência',
    description: 'Dashboard completo com taxas de resposta, conversão por nicho e predição de fechamento.',
    images: [timelineAnalytics],
  },
];

// Card positions along the curve (percentage of total height)
const CARD_POSITIONS = [0.08, 0.27, 0.46, 0.65, 0.84];

export default function ToolsTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const drawLineRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const dotInnerRef = useRef<SVGCircleElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [cardVisible, setCardVisible] = useState<boolean[]>(new Array(TOOLS_DATA.length).fill(false));

  // SVG viewBox dimensions
  const VB_W = 1000;
  const VB_H = 3200;

  // S-curve path
  const curvePath = `M 500 0
    C 850 300, 900 550, 500 800
    C 100 1050, 100 1300, 500 1600
    C 900 1900, 850 2150, 500 2400
    C 150 2650, 100 2900, 500 3200`;

  useEffect(() => {
    if (drawLineRef.current) {
      const len = drawLineRef.current.getTotalLength();
      setPathLength(len);
      drawLineRef.current.style.strokeDasharray = `${len}`;
      drawLineRef.current.style.strokeDashoffset = `${len}`;
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || !drawLineRef.current || !pathLength) return;

    const rect = containerRef.current.getBoundingClientRect();
    const wh = window.innerHeight;

    // Progress: 0 when container top hits bottom of viewport, 1 when container bottom hits top
    const totalScroll = rect.height + wh;
    const scrolled = wh - rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / totalScroll));

    // Draw line
    const drawLength = pathLength * progress;
    drawLineRef.current.style.strokeDashoffset = `${pathLength - drawLength}`;

    // Move dot
    if (drawLength > 0 && drawLineRef.current) {
      const point = drawLineRef.current.getPointAtLength(drawLength);
      dotRef.current?.setAttribute('cx', String(point.x));
      dotRef.current?.setAttribute('cy', String(point.y));
      dotInnerRef.current?.setAttribute('cx', String(point.x));
      dotInnerRef.current?.setAttribute('cy', String(point.y));
    }

    // Card visibility
    setCardVisible(prev => {
      const next = [...prev];
      CARD_POSITIONS.forEach((pos, i) => {
        if (progress >= pos - 0.05) next[i] = true;
      });
      return next;
    });
  }, [pathLength]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div className="w-full" id="produto">
      {/* Header */}
      <div className="max-w-5xl mx-auto pt-10 pb-4 px-4 md:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#F7941D] font-semibold">Ferramentas</span>
          <h2 className="text-2xl md:text-4xl mt-1 text-white max-w-3xl font-extrabold tracking-[-0.04em]">
            Seu arsenal<br />
            <span className="text-white/20">de prospecção.</span>
          </h2>
        </motion.div>
      </div>

      {/* Curved timeline container */}
      <div ref={containerRef} className="relative max-w-5xl mx-auto" style={{ height: '2200px' }}>
        {/* SVG curve */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="curve-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F7941D" />
              <stop offset="50%" stopColor="#7B2FF2" />
              <stop offset="100%" stopColor="#F7941D" />
            </linearGradient>
            <filter id="glow-filter">
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track (background) */}
          <path
            d={curvePath}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Active drawn line */}
          <path
            ref={drawLineRef}
            d={curvePath}
            fill="none"
            stroke="url(#curve-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#glow-filter)"
            className="transition-[stroke-dashoffset] duration-75 ease-linear"
          />

          {/* Glowing dot */}
          <circle
            ref={dotRef}
            cx="500"
            cy="0"
            r="16"
            fill="white"
            opacity="0.3"
            filter="url(#glow-filter)"
          />
          <circle
            ref={dotInnerRef}
            cx="500"
            cy="0"
            r="6"
            fill="#F7941D"
          />
        </svg>

        {/* Content cards positioned along the curve */}
        {TOOLS_DATA.map((item, index) => {
          const Icon = item.icon;
          const isLeft = index % 2 === 0;
          const topPct = CARD_POSITIONS[index] * 100;

          return (
            <div
              key={index}
              className={cn(
                'absolute z-10 w-[85%] md:w-[42%] transition-all duration-1000',
                isLeft ? 'left-[5%] md:left-[3%]' : 'right-[5%] md:right-[3%]',
                cardVisible[index]
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              )}
              style={{ top: `${topPct}%` }}
            >
              <div className="group bg-white/[0.03] backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] shadow-[0_8px_30px_rgb(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-500">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F7941D]/20 to-[#7B2FF2]/20 border border-[#F7941D]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="h-4 w-4 text-[#F7941D]" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-[#F7941D]/60 font-bold">{item.title}</span>
                    <h4 className="text-white text-sm font-bold tracking-tight leading-tight">{item.heading}</h4>
                  </div>
                </div>
                <ToolImage
                  src={item.images[0]}
                  alt={item.heading}
                  className="h-28 md:h-[160px] w-full mb-3"
                />
                <p className="text-white/40 text-xs leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
