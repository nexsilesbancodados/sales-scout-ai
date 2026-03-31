import { Zap, Rocket, Shield, TrendingUp, Clock, Users, ArrowRight, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ── Integration items ── */
const INTEGRATIONS = [
  { name: 'META / FACEBOOK', color: '#1877F2' },
  { name: 'INSTAGRAM', color: '#E4405F' },
  { name: 'GOOGLE MAPS', color: '#34A853' },
  { name: 'SERPER', color: '#00B4D8' },
  { name: 'HUNTER.IO', color: '#FF6B35' },
  { name: 'APIFY', color: '#00D1A9' },
  { name: 'EVOLUTION API', color: '#25D366' },
  { name: 'DEEPSEEK AI', color: '#7B2FF2' },
];

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
            🔥 ÚLTIMAS VAGAS — 30% OFF para quem começar hoje
          </span>
        </div>
        <button
          onClick={() => navigate('/auth')}
          className="flex items-center gap-2 bg-white text-[#7B2FF2] text-[12px] sm:text-[13px] font-bold px-5 py-2 rounded-full hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          Garantir minha vaga
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

/* ── Feature Highlight Strip (Integrations Marquee) ── */
export function FeatureHighlightStrip() {
  const tripled = [...INTEGRATIONS, ...INTEGRATIONS, ...INTEGRATIONS];

  return (
    <div className="relative overflow-hidden py-0 border-y border-white/[0.04]">
      {/* Gradient background */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(90deg, rgba(11,13,21,1) 0%, rgba(20,15,35,0.95) 50%, rgba(11,13,21,1) 100%)'
      }} />

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 z-10" style={{ background: 'linear-gradient(90deg, rgba(11,13,21,1), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-32 z-10" style={{ background: 'linear-gradient(270deg, rgba(11,13,21,1), transparent)' }} />

      {/* Subtle top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(123,47,242,0.3), rgba(233,30,140,0.3), transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,180,216,0.2), rgba(123,47,242,0.2), transparent)' }} />

      <div className="relative flex animate-[marquee-banner_35s_linear_infinite] whitespace-nowrap py-4">
        {tripled.map((item, i) => (
          <div key={i} className="flex items-center gap-3 mx-10 shrink-0 group cursor-default">
            {/* Icon with glow */}
            <div className="relative">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center border transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `${item.color}10`,
                  borderColor: `${item.color}25`,
                  boxShadow: `0 0 12px ${item.color}15`,
                }}
              >
                <Globe className="h-3.5 w-3.5 transition-colors" style={{ color: `${item.color}CC` }} />
              </div>
            </div>

            {/* Name */}
            <span
              className="text-[13px] font-bold tracking-[0.15em] uppercase transition-colors duration-300"
              style={{ color: `${item.color}90` }}
            >
              {item.name}
            </span>

            {/* Separator dot */}
            <span className="ml-6 text-white/[0.08] text-lg">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
