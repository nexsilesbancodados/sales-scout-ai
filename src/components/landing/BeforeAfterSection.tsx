import { useRef, useState, useEffect } from 'react';
import { ArrowRight, Clock, TrendingDown, TrendingUp, Frown, Smile } from 'lucide-react';

export function BeforeAfterSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setInView(true);
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-6 items-center">
        {/* Before */}
        <div
          className="bg-white/[0.02] border border-red-500/10 rounded-2xl p-7 relative overflow-hidden"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateX(0)' : 'translateX(-40px)',
            transition: 'all 0.7s cubic-bezier(.16,1,.3,1)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/40 to-transparent" />
          <div className="flex items-center gap-2 mb-6">
            <Frown className="h-5 w-5 text-red-400/60" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-400/60">Antes</span>
          </div>
          <ul className="space-y-4">
            {[
              { icon: Clock, text: '8h/dia prospectando manualmente' },
              { icon: TrendingDown, text: 'Apenas 5-10 leads/dia' },
              { icon: TrendingDown, text: 'Sem follow-up organizado' },
              { icon: TrendingDown, text: 'Planilhas desatualizadas' },
              { icon: TrendingDown, text: 'Risco de ban no WhatsApp' },
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-[13px] text-white/40"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateX(0)' : 'translateX(-20px)',
                  transition: `all 0.5s ease ${0.2 + i * 0.08}s`,
                }}
              >
                <item.icon className="h-4 w-4 text-red-400/40 shrink-0" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Arrow */}
        <div
          className="hidden md:flex flex-col items-center gap-2"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'scale(1)' : 'scale(0.5)',
            transition: 'all 0.5s cubic-bezier(.16,1,.3,1) 0.3s',
          }}
        >
          <div className="h-12 w-12 rounded-full bg-[#7B2FF2]/20 border border-[#7B2FF2]/30 flex items-center justify-center landing-pulse-glow">
            <ArrowRight className="h-5 w-5 text-[#7B2FF2]" />
          </div>
        </div>

        {/* After */}
        <div
          className="bg-white/[0.02] border border-green-500/10 rounded-2xl p-7 relative overflow-hidden"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateX(0)' : 'translateX(40px)',
            transition: 'all 0.7s cubic-bezier(.16,1,.3,1) 0.15s',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500/40 to-transparent" />
          <div className="flex items-center gap-2 mb-6">
            <Smile className="h-5 w-5 text-green-400/60" />
            <span className="text-xs font-bold uppercase tracking-wider text-green-400/60">Com NexaProspect</span>
          </div>
          <ul className="space-y-4">
            {[
              { icon: TrendingUp, text: 'Prospecção 100% automática' },
              { icon: TrendingUp, text: '50-100 leads/dia no piloto automático' },
              { icon: TrendingUp, text: 'Follow-up inteligente com IA' },
              { icon: TrendingUp, text: 'CRM com pipeline visual' },
              { icon: TrendingUp, text: 'Anti-ban nativo integrado' },
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-[13px] text-white/60"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateX(0)' : 'translateX(20px)',
                  transition: `all 0.5s ease ${0.35 + i * 0.08}s`,
                }}
              >
                <item.icon className="h-4 w-4 text-green-400/60 shrink-0" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
