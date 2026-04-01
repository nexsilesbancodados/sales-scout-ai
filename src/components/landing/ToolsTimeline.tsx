import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MapPin, Instagram, Users, Bot, BarChart3, ArrowUpRight } from 'lucide-react';

import timelineMaps from '@/assets/timeline-maps.jpg';
import timelineSocial from '@/assets/timeline-social.jpg';
import timelineWhatsapp from '@/assets/timeline-whatsapp.jpg';
import timelineSdr from '@/assets/timeline-sdr.jpg';
import timelineAnalytics from '@/assets/timeline-analytics.jpg';

/* ── Tool data ─────────────────────────────────────────────── */
const TOOLS = [
  {
    tag: 'Maps',
    icon: MapPin,
    heading: 'Prospecção no Google Maps',
    description: 'A IA varre milhares de empresas por nicho e localização, extraindo nome, telefone, e-mail e avaliações em segundos.',
    image: timelineMaps,
    span: 'col-span-1 md:col-span-2 md:row-span-2', // large
  },
  {
    tag: 'Social',
    icon: Instagram,
    heading: 'Instagram & Facebook',
    description: 'Extraia seguidores e perfis comerciais com dados de contato.',
    image: timelineSocial,
    span: 'col-span-1 md:col-span-1 md:row-span-1', // small
  },
  {
    tag: 'Grupos',
    icon: Users,
    heading: 'Grupos WhatsApp',
    description: 'Importe contatos de qualquer grupo com um clique.',
    image: timelineWhatsapp,
    span: 'col-span-1 md:col-span-1 md:row-span-1', // small
  },
  {
    tag: 'SDR',
    icon: Bot,
    heading: 'Agente SDR Autônomo',
    description: 'IA que conversa 24/7, qualifica pelo BANT e agenda reuniões automaticamente.',
    image: timelineSdr,
    span: 'col-span-1 md:col-span-1 md:row-span-2', // tall
  },
  {
    tag: 'Analytics',
    icon: BarChart3,
    heading: 'Métricas & Inteligência',
    description: 'Dashboard com taxas de resposta, conversão por nicho e predição de fechamento.',
    image: timelineAnalytics,
    span: 'col-span-1 md:col-span-2 md:row-span-1', // wide
  },
];

/* ── Animated card ─────────────────────────────────────────── */
function BentoCard({
  tool,
  index,
}: {
  tool: (typeof TOOLS)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const Icon = tool.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/[0.06]',
        'bg-white/[0.02] backdrop-blur-xl',
        'hover:border-white/[0.14] transition-all duration-500',
        'flex flex-col',
        tool.span
      )}
    >
      {/* Image */}
      <div className="relative flex-1 min-h-[140px] md:min-h-[180px] overflow-hidden">
        <img
          src={tool.image}
          alt={tool.heading}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Gradient overlay bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Tag pill top-left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
          <Icon className="h-3 w-3 text-[#F7941D]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/80">
            {tool.tag}
          </span>
        </div>

        {/* Arrow top-right */}
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowUpRight className="h-3.5 w-3.5 text-white/60" />
        </div>
      </div>

      {/* Text content */}
      <div className="p-4 md:p-5">
        <h4 className="text-white text-sm md:text-base font-bold tracking-tight leading-tight mb-1.5">
          {tool.heading}
        </h4>
        <p className="text-white/35 text-xs md:text-[13px] leading-relaxed">
          {tool.description}
        </p>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-br from-[#F7941D]/[0.04] via-transparent to-[#7B2FF2]/[0.04]" />
    </motion.div>
  );
}

/* ── Main component ────────────────────────────────────────── */
export default function ToolsTimeline() {
  return (
    <div className="w-full" id="produto">
      {/* Section header */}
      <div className="max-w-6xl mx-auto pt-10 pb-6 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#F7941D] font-semibold">
            Ferramentas
          </span>
          <h2 className="text-2xl md:text-4xl mt-1 text-white max-w-3xl font-extrabold tracking-[-0.04em]">
            Seu arsenal<br />
            <span className="text-white/20">de prospecção.</span>
          </h2>
        </motion.div>
      </div>

      {/* Bento grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[minmax(220px,auto)] gap-3 md:gap-4">
          {TOOLS.map((tool, i) => (
            <BentoCard key={tool.tag} tool={tool} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
