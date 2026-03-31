import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingPlan {
  name: string;
  price: number;
  annual: number;
  features: string[];
  cta: string;
  highlight: boolean;
}

interface PremiumPricingCardProps {
  plan: PricingPlan;
  annual: boolean;
  index: number;
}

export function PremiumPricingCard({ plan, annual, index }: PremiumPricingCardProps) {
  const navigate = useNavigate();

  const schemes = [
    { accent: 'purple', glow1: 'hsla(270, 80%, 50%, 1)', glow2: 'hsla(260, 90%, 75%, 1)', glow3: 'hsla(280, 70%, 60%, 1)', check: 'bg-purple-400', label: 'text-purple-400/80', border: '#7B2FF2' },
    { accent: 'cyan', glow1: 'hsla(190, 100%, 40%, 1)', glow2: 'hsla(200, 100%, 85%, 1)', glow3: 'hsla(185, 100%, 55%, 1)', check: 'bg-cyan-300', label: 'text-cyan-400/80', border: '#00B4D8' },
    { accent: 'amber', glow1: 'hsla(35, 90%, 50%, 1)', glow2: 'hsla(40, 100%, 80%, 1)', glow3: 'hsla(30, 90%, 55%, 1)', check: 'bg-amber-400', label: 'text-amber-400/80', border: '#F7941D' },
  ];
  const s = schemes[index] || schemes[0];

  const cardBg = `radial-gradient(at 88% 40%, hsla(210, 30%, 8%, 1) 0px, transparent 85%), radial-gradient(at 49% 30%, hsla(210, 30%, 8%, 1) 0px, transparent 85%), radial-gradient(at 14% 26%, hsla(210, 30%, 8%, 1) 0px, transparent 85%), radial-gradient(at 0% 64%, ${s.glow1} 0px, transparent 85%), radial-gradient(at 41% 94%, ${s.glow2} 0px, transparent 85%), radial-gradient(at 100% 99%, ${s.glow3} 0px, transparent 85%)`;

  const backBenefits = [
    index === 0
      ? ['Comece sem compromisso', '200 leads/mês inclusos', 'Suporte via WhatsApp', 'Cancele quando quiser', '7 dias grátis']
      : index === 1
      ? ['ROI médio de 23x', '1.000 leads/mês inclusos', 'Agente SDR com IA incluso', 'Suporte prioritário', 'Setup assistido grátis']
      : ['Leads ilimitados', 'Multi-chip com rotação', 'Gerente de conta dedicado', 'API completa + Webhooks', 'Onboarding personalizado'],
  ][0];

  return (
    <div
      className="group relative"
      style={{ perspective: '1200px', height: '100%' }}
    >
      {/* Popular badge - stays on top */}
      {plan.highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 py-1 rounded-full z-20 shadow-lg shadow-cyan-500/25">
          Mais popular
        </span>
      )}

      <div
        className="relative w-full h-full transition-transform duration-700 ease-out"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* ═══ FRONT ═══ */}
        <div
          className="premium-price-card relative rounded-2xl p-6 h-full"
          style={{
            backgroundColor: 'hsla(210, 30%, 8%, 1)',
            backgroundImage: cardBg,
            boxShadow: plan.highlight
              ? `0px -16px 24px 0px rgba(180, 230, 255, 0.15) inset`
              : `0px -10px 20px 0px rgba(150, 150, 200, 0.08) inset`,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Animated border */}
          <div className="premium-border-container">
            <div
              className="premium-rotating-border"
              style={{
                backgroundImage: plan.highlight
                  ? `linear-gradient(0deg, hsla(190, 100%, 90%, 0) 0%, hsl(190, 100%, 70%) 40%, hsl(200, 100%, 80%) 60%, hsla(210, 40%, 30%, 0) 100%)`
                  : `linear-gradient(0deg, hsla(260, 80%, 90%, 0) 0%, hsl(260, 60%, 60%) 40%, hsl(270, 70%, 70%) 60%, hsla(260, 40%, 30%, 0) 100%)`,
              }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className={cn(
              'h-10 w-10 rounded-xl border flex items-center justify-center',
              plan.highlight
                ? 'border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20'
                : 'border-purple-400/20 bg-gradient-to-br from-purple-500/20 to-indigo-500/20'
            )}>
              <span className="text-lg">
                {index === 0 ? '🚀' : index === 1 ? '⚡' : '👑'}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-white">{plan.name}</h3>
              <p className={cn('text-[10px] uppercase tracking-wider font-bold', s.label)}>
                {index === 0 ? 'Para começar' : index === 1 ? 'Alta Performance' : 'Sem limites'}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-medium text-blue-200/60 mr-1">R$</span>
              <span className="text-4xl font-bold tracking-tight text-white">{annual ? plan.annual : plan.price}</span>
              <span className="text-sm text-blue-200/60 ml-1">/mês</span>
            </div>
            {annual && (
              <p className="text-xs text-green-400/70 mt-1">Economia de R${(plan.price - plan.annual) * 12}/ano</p>
            )}
          </div>

          {/* Features */}
          <ul className="space-y-3 text-sm text-blue-50/90 mb-8">
            {plan.features.map(f => (
              <li key={f} className="flex items-start gap-3">
                <div className={cn('w-4 h-4 rounded-full flex items-center justify-center mt-0.5 shrink-0', s.check)}>
                  <Check className="h-2.5 w-2.5 text-[#050a10]" strokeWidth={4} />
                </div>
                {f}
              </li>
            ))}
          </ul>

          {/* Aura Button */}
          <button
            onClick={() => navigate('/auth')}
            className="aura-btn group/btn isolate inline-flex items-center w-full h-[54px] cursor-pointer overflow-hidden rounded-[18px] relative"
            style={{
              backgroundColor: plan.highlight ? '#A9DDF7' : 'hsl(260, 60%, 75%)',
              clipPath: 'inset(0 round 18px)',
            }}
          >
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-60">
              <div className="aura-shimmer-container">
                <div className="aura-shimmer-gradient" />
              </div>
            </div>
            <div className="aura-shimmer-onda" />
            <div
              className="absolute inset-[1.5px] rounded-[16px]"
              style={{
                background: plan.highlight
                  ? 'linear-gradient(to bottom, #BEE9FF, #A9DDF7, #9CD4F0)'
                  : 'linear-gradient(to bottom, hsl(260,70%,82%), hsl(260,60%,75%), hsl(260,55%,70%))',
                zIndex: 1,
              }}
            />
            <div className="aura-bottom-glow" />
            <div className="aura-fundo-white" />
            <div className="aura-wrapper-icones" style={{
              background: plan.highlight
                ? 'linear-gradient(135deg, #1e40af, #1e3a8a)'
                : 'linear-gradient(135deg, hsl(260,60%,40%), hsl(260,50%,30%))',
            }}>
              <div className="w-1.5 h-1.5 bg-white rounded-full group-hover/btn:hidden" />
              <ChevronRight className="hidden group-hover/btn:block w-4 h-4 text-white" strokeWidth={3} />
            </div>
            <div className="relative z-10 w-full h-full flex items-center justify-center px-6">
              <span className="aura-texto-principal whitespace-nowrap tracking-wide">{plan.cta}</span>
              <span className="aura-texto-hover whitespace-nowrap">Vamos começar?</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
