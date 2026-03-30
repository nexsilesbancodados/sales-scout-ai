import { useRef, useState, useEffect } from 'react';
import { Check, X, Zap } from 'lucide-react';

const ROWS = [
  { feature: 'Prospecção automática', us: true, them: false },
  { feature: 'Agente SDR com IA', us: true, them: false },
  { feature: 'WhatsApp integrado', us: true, them: false },
  { feature: 'CRM com pipeline', us: true, them: true },
  { feature: 'Anti-ban nativo', us: true, them: false },
  { feature: 'Follow-up automático', us: true, them: false },
  { feature: 'Analytics por nicho', us: true, them: false },
  { feature: 'Extrator de redes sociais', us: true, them: false },
  { feature: 'A/B Testing de mensagens', us: true, them: false },
  { feature: 'Preço acessível', us: true, them: false },
];

export function ComparisonTable() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setInView(true);
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="max-w-3xl mx-auto">
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden backdrop-blur-sm">
        {/* Header */}
        <div className="grid grid-cols-3 bg-white/[0.03] border-b border-white/[0.06]">
          <div className="p-5">
            <span className="text-[13px] text-white/40 font-medium">Funcionalidade</span>
          </div>
          <div className="p-5 text-center border-x border-white/[0.06] bg-[#7B2FF2]/[0.06]">
            <div className="flex items-center justify-center gap-2">
              <Zap className="h-4 w-4 text-[#7B2FF2]" />
              <span className="text-[13px] text-white font-semibold">NexaProspect</span>
            </div>
          </div>
          <div className="p-5 text-center">
            <span className="text-[13px] text-white/40 font-medium">Outros CRMs</span>
          </div>
        </div>

        {/* Rows */}
        {ROWS.map((row, i) => (
          <div
            key={row.feature}
            className="grid grid-cols-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateX(0)' : 'translateX(-20px)',
              transition: `all 0.5s cubic-bezier(.16,1,.3,1) ${i * 0.06}s`,
            }}
          >
            <div className="p-4 text-[13px] text-white/60">{row.feature}</div>
            <div className="p-4 flex justify-center border-x border-white/[0.04] bg-[#7B2FF2]/[0.03]">
              {row.us ? (
                <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-400" />
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full bg-red-500/20 flex items-center justify-center">
                  <X className="h-3 w-3 text-red-400" />
                </div>
              )}
            </div>
            <div className="p-4 flex justify-center">
              {row.them ? (
                <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-400" />
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full bg-red-500/20 flex items-center justify-center">
                  <X className="h-3 w-3 text-red-400" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
