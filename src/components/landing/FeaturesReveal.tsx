import { useState, useCallback } from 'react';
import { Target, Bot, MessageSquare, Columns3, Zap, BarChart3, Plus, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

import featureProspecting from '@/assets/feature-prospecting.jpg';
import featureSdr from '@/assets/feature-sdr.jpg';
import featureWhatsapp from '@/assets/feature-whatsapp.jpg';
import featureCrm from '@/assets/feature-crm.jpg';
import featureAutomations from '@/assets/feature-automations.jpg';
import featureAnalytics from '@/assets/feature-analytics.jpg';

const FEATURES_DATA = [
  {
    icon: Target,
    title: 'Prospecção automática',
    desc: 'Captura leads do Google Maps, Instagram e Facebook com 1 clique. Até 500 leads/semana no piloto automático.',
    image: featureProspecting,
  },
  {
    icon: Bot,
    title: 'Agente SDR com IA',
    desc: 'A IA responde, qualifica e move leads no funil automaticamente. Você só fecha as vendas.',
    image: featureSdr,
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp integrado',
    desc: 'Disparo em massa, follow-up automático e respostas por intenção. Anti-ban nativo.',
    image: featureWhatsapp,
  },
  {
    icon: Columns3,
    title: 'CRM completo',
    desc: 'Pipeline visual com deal value, BANT, timeline de conversas e integração Meta Ads.',
    image: featureCrm,
  },
  {
    icon: Zap,
    title: '9 automações',
    desc: 'Prospecção semanal, reativação de leads frios, relatório diário. Liga/desliga com 1 clique.',
    image: featureAutomations,
  },
  {
    icon: BarChart3,
    title: 'Analytics em tempo real',
    desc: 'Taxa de conversão por nicho, ticket médio, custo por lead e ROI das campanhas.',
    image: featureAnalytics,
  },
];

export function FeaturesReveal() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback((i: number) => {
    setOpenIndex(prev => (prev === i ? null : i));
  }, []);

  const goNext = useCallback(() => {
    setOpenIndex(prev => (prev !== null ? (prev + 1) % FEATURES_DATA.length : null));
  }, []);

  const goPrev = useCallback(() => {
    setOpenIndex(prev => (prev !== null ? (prev - 1 + FEATURES_DATA.length) % FEATURES_DATA.length : null));
  }, []);

  const exit = useCallback(() => setOpenIndex(null), []);

  // Current visible image index: if something open, show that feature's image; otherwise show first
  const visibleImageIndex = openIndex !== null ? openIndex : -1;

  return (
    <div className="relative flex flex-col md:flex-row items-stretch w-full max-w-[900px] mx-auto min-h-[400px] md:min-h-[520px] rounded-2xl overflow-hidden border border-white/[0.06] bg-black/40 backdrop-blur-sm">
      {/* Left column - details list */}
      <div className="relative z-20 flex flex-col gap-2 py-6 px-4 md:py-8 md:pl-8 md:pr-4 w-full md:w-[320px] shrink-0">
        {FEATURES_DATA.map((f, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={f.title} className="relative">
              {/* Summary button */}
              <button
                onClick={() => toggle(i)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-full text-left transition-all duration-300 w-full',
                  'bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] hover:bg-white/[0.1]',
                  isOpen && 'opacity-0 pointer-events-none'
                )}
              >
                <Plus className="h-5 w-5 text-white/60 shrink-0" />
                <span className="text-[13px] font-semibold text-white whitespace-nowrap">{f.title}</span>
              </button>

              {/* Expanded content */}
              <div
                className={cn(
                  'absolute top-0 left-0 w-[300px] rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] overflow-hidden transition-all duration-500',
                  isOpen
                    ? 'opacity-100 scale-100 z-10'
                    : 'opacity-0 scale-95 pointer-events-none z-0'
                )}
                style={{
                  maxHeight: isOpen ? '200px' : '56px',
                  transition: 'max-height 0.5s cubic-bezier(.16,1,.3,1), opacity 0.3s ease, transform 0.4s cubic-bezier(.16,1,.3,1)',
                }}
              >
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <f.icon className="h-4 w-4 text-purple-400" />
                    <span className="text-[13px] font-semibold text-white">{f.title}</span>
                  </div>
                  <p className="text-[12px] text-white/50 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right column - images */}
      <div className="relative flex-1 h-full min-h-[520px]" style={{ pointerEvents: 'none' }}>
        {/* Default image (overview) */}
        <div
          className={cn(
            'absolute inset-0 transition-all duration-500',
            openIndex === null ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
          )}
        >
          <img
            src={featureProspecting}
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: 'calc(50% + 4rem) 50%' }}
            loading="lazy"
          />
        </div>

        {/* Feature-specific images */}
        {FEATURES_DATA.map((f, i) => (
          <div
            key={i}
            className={cn(
              'absolute inset-0 transition-all duration-600',
              visibleImageIndex === i
                ? 'opacity-100 translate-x-0 scale-100'
                : 'opacity-0 translate-x-[15%] scale-90'
            )}
            style={{
              transition: 'opacity 0.4s ease, transform 0.6s cubic-bezier(.16,1,.3,1), scale 0.6s cubic-bezier(.16,1,.3,1)',
              transitionDelay: visibleImageIndex === i ? '0.15s' : '0s',
            }}
          >
            <img
              src={f.image}
              alt={f.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}

        {/* Gradient overlay for blending */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Navigation buttons - only visible when open */}
      <div
        className={cn(
          'transition-all duration-300',
          openIndex !== null ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-[150%] w-9 h-9 rounded-full bg-white/10 backdrop-blur-xl grid place-items-center hover:bg-white/20 transition-colors z-20"
        >
          <ChevronUp className="h-5 w-5 text-white" />
        </button>
        <button
          onClick={goNext}
          className="absolute left-4 top-1/2 translate-y-[50%] w-9 h-9 rounded-full bg-white/10 backdrop-blur-xl grid place-items-center hover:bg-white/20 transition-colors z-20"
        >
          <ChevronUp className="h-5 w-5 text-white rotate-180" />
        </button>
        <button
          onClick={exit}
          className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-xl grid place-items-center hover:bg-white/20 transition-colors z-20"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
}
