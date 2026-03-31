import { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, motion, useSpring } from 'framer-motion';
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
    <div className={cn('relative overflow-hidden rounded-2xl bg-[#0B0D15] border border-white/5', className)}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0B0D15] animate-pulse">
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
    description: 'Extraia seguidores, perfis comerciais e dados de contato diretamente do Instagram e Facebook. Transforme redes sociais em fonte de leads qualificados.',
    images: [timelineSocial],
  },
  {
    title: 'Grupos',
    icon: Users,
    heading: 'Importação de Grupos WhatsApp',
    description: 'Importe todos os contatos de qualquer grupo do WhatsApp com um clique. Organize, filtre e comece a prospectar imediatamente.',
    images: [timelineWhatsapp],
  },
  {
    title: 'SDR',
    icon: Bot,
    heading: 'Agente SDR Autônomo',
    description: 'Um agente de IA que conversa 24/7, qualifica leads pelo método BANT, contorna objeções e agenda reuniões — enquanto você dorme.',
    images: [timelineSdr],
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    heading: 'Métricas & Inteligência',
    description: 'Dashboard completo com taxas de resposta, conversão por nicho, melhores horários de contato e predição de fechamento baseada em IA.',
    images: [timelineAnalytics],
  },
];

export default function ToolsTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const ro = new ResizeObserver(() => {
        if (ref.current) setHeight(ref.current.getBoundingClientRect().height);
      });
      ro.observe(ref.current);
      return () => ro.disconnect();
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 10%', 'end 95%'],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 70, damping: 30, restDelta: 0.001 });
  const heightTransform = useTransform(smoothProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(smoothProgress, [0, 0.1], [0, 1]);

  return (
    <div className="w-full bg-[#0B0D15] pb-20" ref={containerRef}>
      {/* Header */}
      <div className="max-w-7xl mx-auto pt-24 pb-16 px-4 md:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-[12px] uppercase tracking-[0.3em] text-[#F7941D] font-semibold">Ferramentas</span>
          <h2 className="text-4xl md:text-7xl mt-3 text-white max-w-4xl font-extrabold tracking-[-0.04em]">
            Seu arsenal<br />
            <span className="text-white/20">de prospecção.</span>
          </h2>
          <p className="text-white/30 text-base md:text-lg max-w-xl mt-6 leading-relaxed font-light">
            Cada ferramenta foi projetada para eliminar trabalho manual e multiplicar seus resultados.
          </p>
        </motion.div>
      </div>

      {/* Timeline */}
      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {TOOLS_DATA.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex justify-start pt-16 md:pt-40 md:gap-10">
              {/* Sticky left label */}
              <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
                <div className="h-12 absolute left-2.5 md:left-2.5 w-12 rounded-full bg-[#0B0D15] border border-white/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-[#F7941D]" />
                </div>
                <h3 className="hidden md:block text-3xl md:pl-24 md:text-6xl font-extrabold text-white/[0.06] uppercase tracking-widest">
                  {item.title}
                </h3>
              </div>

              {/* Content */}
              <div className="relative pl-24 pr-4 md:pl-4 w-full">
                <h3 className="md:hidden block text-3xl mb-6 text-left font-extrabold text-white/10 uppercase">
                  {item.title}
                </h3>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-white text-xl md:text-2xl font-bold tracking-tight">{item.heading}</h4>
                    <p className="text-white/40 text-sm md:text-base font-light leading-relaxed max-w-xl">
                      {item.description}
                    </p>
                  </div>
                  <ToolImage
                    src={item.images[0]}
                    alt={item.heading}
                    className="h-56 md:h-[400px] w-full"
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Progress line track */}
        <div
          style={{ height: height + 'px' }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-white/[0.03]"
        >
          <motion.div
            style={{ height: heightTransform, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 w-[2px] rounded-full overflow-hidden"
            // Use inline style for gradient since it uses brand color
            // bg-gradient-to-b from-[#F7941D] via-[#F7941D] to-white/20
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#F7941D] via-[#F7941D] to-white/20" />
            {/* Wave effect */}
            <motion.div
              className="absolute inset-x-0 w-full"
              initial={{ y: '-100%' }}
              animate={{ y: '200%' }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, rgba(247,148,29,0.8) 50%, transparent 100%)',
                height: '400px',
                filter: 'blur(6px)',
                maskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
