import { Zap, Rocket, Shield, TrendingUp, Clock, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ── Marquee Banner ── */
export function MarqueeBanner({ items, color = '#7B2FF2', bgFrom = 'rgba(123,47,242,0.15)', bgTo = 'rgba(233,30,140,0.15)' }: {
  items: { icon: React.ElementType; text: string }[];
  color?: string;
  bgFrom?: string;
  bgTo?: string;
}) {
  const doubled = [...items, ...items, ...items];
  return (
    <div
      className="relative overflow-hidden py-3.5 border-y border-white/[0.06]"
      style={{ background: `linear-gradient(90deg, ${bgFrom}, ${bgTo}, ${bgFrom})` }}
    >
      <div className="flex animate-[marquee-banner_25s_linear_infinite] whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-2 mx-8 text-[13px] font-semibold uppercase tracking-wider shrink-0" style={{ color }}>
            <item.icon className="h-4 w-4" />
            {item.text}
            <span className="text-white/15 ml-4">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Urgency CTA Banner ── */
export function UrgencyCTABanner() {
  const navigate = useNavigate();
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#7B2FF2] via-[#E91E8C] to-[#7B2FF2] animate-[gradient-shift_4s_ease_infinite]" style={{ backgroundSize: '200% 100%' }} />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMCBMNjAgNjAgTTYwIDAgTDAgNjAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-40" />
      <div className="relative z-10 py-4 px-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <span className="text-[13px] sm:text-sm font-bold text-white tracking-wide">
            🔥 OFERTA POR TEMPO LIMITADO — 30% OFF no primeiro mês
          </span>
        </div>
        <button
          onClick={() => navigate('/auth')}
          className="flex items-center gap-2 bg-white text-[#7B2FF2] text-[12px] sm:text-[13px] font-bold px-5 py-2 rounded-full hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          Garantir desconto
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── Social Proof Strip ── */
export function SocialProofStrip() {
  const proofs = [
    { icon: Users, text: '+2.400 empresas ativas', color: '#7B2FF2' },
    { icon: TrendingUp, text: '850K leads gerados', color: '#E91E8C' },
    { icon: Shield, text: '99.9% uptime garantido', color: '#00B4D8' },
    { icon: Clock, text: 'Setup em 5 minutos', color: '#F7941D' },
  ];

  return (
    <div className="bg-white/[0.02] border-y border-white/[0.06] py-5">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {proofs.map((p, i) => (
          <div key={i} className="flex items-center justify-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: `${p.color}15` }}>
              <p.icon className="h-4 w-4" style={{ color: p.color }} />
            </div>
            <span className="text-[12px] sm:text-[13px] font-semibold text-white/60 group-hover:text-white/80 transition-colors">{p.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Feature Highlight Strip ── */
export function FeatureHighlightStrip() {
  return (
    <MarqueeBanner
      items={[
        { icon: Zap, text: 'Prospecção automática' },
        { icon: Rocket, text: 'Agente SDR com IA' },
        { icon: Shield, text: 'Anti-ban nativo' },
        { icon: TrendingUp, text: 'Analytics em tempo real' },
        { icon: Users, text: 'CRM integrado' },
        { icon: Clock, text: 'Follow-up automático' },
      ]}
      color="#E91E8C"
      bgFrom="rgba(233,30,140,0.08)"
      bgTo="rgba(123,47,242,0.08)"
    />
  );
}
