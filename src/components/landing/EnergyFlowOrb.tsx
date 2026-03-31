import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Bot, CalendarCheck, BarChart3, Zap } from 'lucide-react';

const nodesData = [
  { 
    id: 1, 
    icon: Search, 
    label: "Prospecção",
    desc: "Google Maps, Instagram, Facebook",
    gridPos: { left: '10%', top: '25%' }, 
    orbitPos: { left: '18%', top: '55%' },
    animClass: 'animate-efo-1',
    color: '#3B82F6',
  },
  { 
    id: 2, 
    icon: MessageSquare, 
    label: "WhatsApp",
    desc: "Anti-ban, Spintax, Delay",
    gridPos: { left: '30%', top: '15%' }, 
    orbitPos: { left: '25%', top: '22%' },
    animClass: 'animate-efo-2',
    color: '#22C55E',
  },
  { 
    id: 3, 
    icon: Bot, 
    label: "SDR Agent",
    desc: "BANT, Objeções, Funil",
    gridPos: { left: '50%', top: '10%' }, 
    orbitPos: { left: '55%', top: '18%' },
    animClass: 'animate-efo-3',
    color: '#F7941D',
  },
  { 
    id: 4, 
    icon: CalendarCheck, 
    label: "Reuniões",
    desc: "Google Meet, CRM",
    gridPos: { left: '70%', top: '15%' }, 
    orbitPos: { left: '72%', top: '65%' },
    animClass: 'animate-efo-2',
    color: '#A855F7',
  },
  { 
    id: 5, 
    icon: BarChart3, 
    label: "Analytics",
    desc: "Métricas, Padrões, ROI",
    gridPos: { left: '90%', top: '25%' }, 
    orbitPos: { left: '82%', top: '35%' },
    animClass: 'animate-efo-1',
    color: '#EC4899',
  },
];

interface ConnectionPathProps {
  d: string;
  isEnergized: boolean;
  delay?: number;
  color?: string;
}

const ConnectionPath = ({ d, isEnergized, delay = 0, color = '#F7941D' }: ConnectionPathProps) => (
  <g style={{ opacity: isEnergized ? 1 : 0, transition: `opacity 0.8s ease-in-out ${isEnergized ? '0.3s' : '0s'}` }}>
    <path d={d} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" strokeLinecap="round" />
    <path
      d={d} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
      strokeDasharray="1000" strokeDashoffset={isEnergized ? "0" : "1000"}
      className="transition-all ease-in-out"
      style={{ transitionDuration: '1200ms', transitionDelay: `${delay}ms`, filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 20px ${color}80)` }}
    />
    <path
      d={d} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round"
      strokeDasharray="1000" strokeDashoffset={isEnergized ? "0" : "1000"}
      className="transition-all ease-in-out"
      style={{ transitionDuration: '1200ms', transitionDelay: `${delay}ms` }}
    />
    <circle r="4" fill="#fff" className="efo-particle" style={{ offsetPath: `path('${d}')`, animation: isEnergized ? `efoMoveParticle 2.5s linear infinite` : 'none', animationDelay: `${delay + 300}ms` }} />
    <circle r="2.5" fill={color} className="efo-particle" style={{ offsetPath: `path('${d}')`, animation: isEnergized ? `efoMoveParticle 3.5s linear infinite` : 'none', animationDelay: `${delay + 900}ms`, filter: `drop-shadow(0 0 4px ${color})` }} />
  </g>
);

interface OrbNodeProps {
  data: typeof nodesData[0];
  isEnergized: boolean;
  staggerDelay: number;
}

const OrbNode = ({ data, isEnergized, staggerDelay }: OrbNodeProps) => {
  const { icon: Icon, gridPos, orbitPos, animClass, color, label, desc } = data;
  const currentPos = isEnergized ? gridPos : orbitPos;

  return (
    <div 
      className="absolute transition-all duration-[2000ms] z-20"
      style={{ 
        left: currentPos.left, 
        top: currentPos.top, 
        transform: 'translate(-50%, -50%)',
        transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transitionDelay: isEnergized ? `${staggerDelay}ms` : '0ms',
      }}
    >
      <div className={`${!isEnergized ? animClass : ''} transition-transform duration-500`}>
        {/* Outer glow ring */}
        <div 
          className="absolute inset-[-8px] rounded-full transition-all duration-700"
          style={{
            background: isEnergized ? `radial-gradient(circle, ${color}30 0%, transparent 70%)` : 'transparent',
            filter: isEnergized ? 'blur(4px)' : 'none',
          }}
        />
        
        {/* Main orb */}
        <div 
          className={`
            relative flex items-center justify-center w-[72px] h-[72px] rounded-full 
            border-2 overflow-hidden transition-all duration-700
            ${isEnergized 
              ? 'scale-100 rotate-0'
              : 'scale-[0.85] hover:scale-90 rotate-6' 
            }
          `}
          style={{
            borderColor: isEnergized ? color : 'rgba(255,255,255,0.08)',
            background: isEnergized 
              ? `linear-gradient(135deg, ${color}15, ${color}05)` 
              : 'rgba(255,255,255,0.03)',
            boxShadow: isEnergized 
              ? `0 0 30px ${color}40, inset 0 0 20px ${color}10` 
              : '0 4px 20px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 rounded-full" />
          <Icon 
            size={26} 
            className="relative z-10 transition-all duration-500"
            style={{ 
              color: isEnergized ? color : 'rgba(255,255,255,0.15)',
              filter: isEnergized ? `drop-shadow(0 0 6px ${color})` : 'none',
            }} 
          />
        </div>
        
        {/* Label + desc */}
        <div className={`
          absolute -bottom-12 left-1/2 -translate-x-1/2 text-center
          transition-all duration-600 whitespace-nowrap
          ${isEnergized ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-6px]'}
        `}
        style={{ transitionDelay: isEnergized ? `${staggerDelay + 400}ms` : '0ms' }}
        >
          <p className="text-[12px] font-bold tracking-wide" style={{ color }}>{label}</p>
          <p className="text-[10px] text-white/30 mt-0.5">{desc}</p>
        </div>
      </div>
    </div>
  );
};

export default function EnergyFlowOrb() {
  const [isEnergized, setIsEnergized] = useState(false);
  const [pulseVisible, setPulseVisible] = useState(true);

  // Subtle pulse hint for the central orb
  useEffect(() => {
    if (isEnergized) setPulseVisible(false);
    else {
      const t = setTimeout(() => setPulseVisible(true), 1000);
      return () => clearTimeout(t);
    }
  }, [isEnergized]);

  const toggle = () => setIsEnergized(prev => !prev);
  const onEnter = () => { if (window.matchMedia('(hover: hover)').matches) setIsEnergized(true); };
  const onLeave = () => { if (window.matchMedia('(hover: hover)').matches) setIsEnergized(false); };

  // Paths from center-bottom hub to each node position (in a 600x440 viewBox)
  const paths = [
    { d: "M 300 340 C 280 260, 80 280, 60 120", delay: 400, color: nodesData[0].color },
    { d: "M 300 340 C 290 260, 200 200, 180 80", delay: 200, color: nodesData[1].color },
    { d: "M 300 340 C 300 260, 300 180, 300 60", delay: 0, color: nodesData[2].color },
    { d: "M 300 340 C 310 260, 400 200, 420 80", delay: 200, color: nodesData[3].color },
    { d: "M 300 340 C 320 260, 520 280, 540 120", delay: 400, color: nodesData[4].color },
  ];

  return (
    <div className="relative w-full min-h-[520px] flex items-center justify-center overflow-visible">
      <style>{`
        @keyframes efo-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(8px, -12px) rotate(3deg); }
          50% { transform: translate(-6px, -8px) rotate(-2deg); }
          75% { transform: translate(-4px, 6px) rotate(-1deg); }
        }
        @keyframes efo-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-10px, 6px) rotate(-4deg); }
          50% { transform: translate(6px, -5px) rotate(2deg); }
          75% { transform: translate(-3px, 8px) rotate(-3deg); }
        }
        @keyframes efo-3 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(5px, -10px); }
          66% { transform: translate(-5px, -5px); }
        }
        @keyframes efoMoveParticle {
          0% { offset-distance: 0%; opacity: 0; transform: scale(0.3); }
          15% { opacity: 1; transform: scale(1.3); }
          85% { opacity: 0.8; transform: scale(1); }
          100% { offset-distance: 100%; opacity: 0; transform: scale(0.3); }
        }
        @keyframes efoPulseRing {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
        @keyframes efoBreath {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
        .efo-particle { offset-rotate: auto; pointer-events: none; }
        .animate-efo-1 { animation: efo-1 10s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite; }
        .animate-efo-2 { animation: efo-2 12s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite reverse; }
        .animate-efo-3 { animation: efo-3 14s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite 1s; }
      `}</style>

      {/* Ambient background glow */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isEnergized ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(247,148,29,0.08) 0%, transparent 60%)' }} />

      <div className="relative w-full max-w-3xl h-[480px] flex items-center justify-center">
        
        {/* Idle text */}
        <div className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-[60%] text-center z-0 pointer-events-none
          transition-all duration-1000 ease-in-out
          ${!isEnergized ? 'opacity-100 scale-100' : 'opacity-0 scale-90 blur-md translate-y-8'}
        `}>
          <p className="text-[13px] text-white/20 font-light">Toque no orbe para ativar</p>
        </div>

        {/* Energized title */}
        <div className={`
          absolute top-0 left-1/2 -translate-x-1/2 
          w-full text-center z-30 pointer-events-none
          transition-all duration-1000 ease-out
          ${isEnergized ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}
        `}
        style={{ transitionDelay: isEnergized ? '600ms' : '0ms' }}
        >
          <h3 className="text-sm md:text-base font-semibold text-white/90 tracking-wide">
            <span className="text-[#F7941D]">5 ferramentas</span> trabalhando juntas
          </h3>
        </div>

        {/* SVG energy paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 600 440" preserveAspectRatio="xMidYMid meet">
          {paths.map((p, i) => (
            <ConnectionPath key={i} d={p.d} isEnergized={isEnergized} delay={p.delay} color={p.color} />
          ))}
        </svg>

        {/* Orb nodes */}
        {nodesData.map((node, i) => (
          <OrbNode key={node.id} data={node} isEnergized={isEnergized} staggerDelay={i * 100} />
        ))}

        {/* ── Central Hub Orb ── */}
        <div 
          className="absolute left-[50%] bottom-[8%] -translate-x-1/2 cursor-pointer z-30"
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onClick={toggle}
        >
          {/* Pulse rings when idle */}
          {pulseVisible && !isEnergized && (
            <>
              <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full border border-white/10"
                style={{ animation: 'efoPulseRing 3s ease-out infinite', transformOrigin: 'center' }} />
              <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full border border-white/5"
                style={{ animation: 'efoPulseRing 3s ease-out infinite 1.5s', transformOrigin: 'center' }} />
            </>
          )}

          {/* Energized glow */}
          <div className={`absolute inset-[-20px] rounded-full transition-all duration-700 ${isEnergized ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: 'radial-gradient(circle, rgba(247,148,29,0.3), transparent 70%)', filter: 'blur(15px)' }} />

          {/* Hub body */}
          <div className={`
            relative flex items-center justify-center w-24 h-24 
            transition-all duration-500 rounded-full border-2
            ${isEnergized 
              ? 'border-[#F7941D] scale-110' 
              : 'border-white/10 hover:border-white/25 hover:scale-105'
            }
          `}
          style={{
            background: isEnergized 
              ? 'linear-gradient(135deg, rgba(247,148,29,0.15), rgba(0,0,0,0.8))' 
              : 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(0,0,0,0.4))',
            boxShadow: isEnergized 
              ? '0 0 50px rgba(247,148,29,0.4), inset 0 0 30px rgba(247,148,29,0.1)' 
              : '0 8px 32px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(16px)',
          }}
          >
            {/* Ping ring on energize */}
            {isEnergized && (
              <div className="absolute inset-0 rounded-full border-2 border-[#F7941D] animate-ping opacity-15" style={{ animationDuration: '2s' }} />
            )}

            {/* Inner core */}
            <div className={`relative flex items-center justify-center transition-all duration-700 rounded-full
              ${isEnergized ? 'w-14 h-14' : 'w-12 h-12'}
            `}
            style={{
              background: isEnergized 
                ? 'linear-gradient(135deg, #F7941D, #E8850A)' 
                : 'rgba(255,255,255,0.06)',
              boxShadow: isEnergized ? '0 0 20px rgba(247,148,29,0.6)' : 'none',
              animation: !isEnergized ? 'efoBreath 3s ease-in-out infinite' : 'none',
            }}>
              <Zap 
                size={isEnergized ? 24 : 20} 
                className={`transition-all duration-500 ${isEnergized ? 'text-white' : 'text-white/20'}`}
                style={{ filter: isEnergized ? 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' : 'none' }}
              />
            </div>
          </div>

          {/* Hub label */}
          <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-center transition-all duration-500
            ${isEnergized ? 'opacity-100' : 'opacity-40'}
          `}>
            <p className="text-[11px] font-bold tracking-widest uppercase text-white/60 whitespace-nowrap">
              {isEnergized ? 'Ativo' : 'Ativar'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
