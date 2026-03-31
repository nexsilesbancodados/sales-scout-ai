import React, { useState } from 'react';
import { Search, MessageSquare, Bot, CalendarCheck, BarChart3 } from 'lucide-react';

const nodesData = [
  { 
    id: 1, 
    icon: Search, 
    label: "Prospecção",
    gridPos: { left: '12.5%', top: '35%' }, 
    orbitPos: { left: '25%', top: '65%' },
    animClass: 'animate-float-orb-1',
    delay: 800 
  },
  { 
    id: 2, 
    icon: MessageSquare, 
    label: "WhatsApp",
    gridPos: { left: '31.25%', top: '30%' }, 
    orbitPos: { left: '28%', top: '20%' },
    animClass: 'animate-float-orb-2',
    delay: 600 
  },
  { 
    id: 3, 
    icon: Bot, 
    label: "SDR Agent",
    gridPos: { left: '50%', top: '20%' }, 
    orbitPos: { left: '60%', top: '15%' },
    animClass: 'animate-float-orb-3',
    delay: 400 
  },
  { 
    id: 4, 
    icon: CalendarCheck, 
    label: "Reuniões",
    gridPos: { left: '68.75%', top: '30%' }, 
    orbitPos: { left: '55%', top: '75%' },
    animClass: 'animate-float-orb-2',
    delay: 600 
  },
  { 
    id: 5, 
    icon: BarChart3, 
    label: "Analytics",
    gridPos: { left: '87.5%', top: '35%' }, 
    orbitPos: { left: '80%', top: '60%' },
    animClass: 'animate-float-orb-1',
    delay: 800 
  },
];

interface ConnectionPathProps {
  d: string;
  isEnergized: boolean;
  delay?: number;
}

const ConnectionPath = ({ d, isEnergized, delay = 0 }: ConnectionPathProps) => {
  return (
    <g style={{ opacity: isEnergized ? 1 : 0, transition: `opacity 1s ease-in-out ${isEnergized ? '0.5s' : '0s'}` }}>
      <path d={d} fill="none" stroke="rgba(15, 23, 42, 0.4)" strokeWidth="10" strokeLinecap="round" style={{ filter: 'blur(2px)' }} />
      <path
        d={d} fill="none" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset={isEnergized ? "0" : "1000"}
        className="transition-all ease-in-out"
        style={{ transitionDuration: '1500ms', transitionDelay: `${delay}ms`, filter: 'drop-shadow(0 0 6px hsl(var(--primary))) drop-shadow(0 0 15px hsl(var(--primary) / 0.5))' }}
      />
      <path
        d={d} fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset={isEnergized ? "0" : "1000"}
        className="transition-all ease-in-out"
        style={{ transitionDuration: '1500ms', transitionDelay: `${delay}ms`, transform: 'translateY(-1px)' }}
      />
      <circle r="3" fill="#fff" className="particle-energy" style={{ offsetPath: `path('${d}')`, animation: isEnergized ? `moveParticleEnergy 2s linear infinite` : 'none', animationDelay: `${delay + 200}ms` }} />
      <circle r="2" fill="hsl(var(--primary) / 0.6)" className="particle-energy" style={{ offsetPath: `path('${d}')`, animation: isEnergized ? `moveParticleEnergy 3s linear infinite` : 'none', animationDelay: `${delay + 800}ms` }} />
    </g>
  );
};

interface OrbNodeProps {
  data: typeof nodesData[0];
  isEnergized: boolean;
}

const OrbNode = ({ data, isEnergized }: OrbNodeProps) => {
  const { icon: Icon, gridPos, orbitPos, animClass } = data;
  const currentPos = isEnergized ? gridPos : orbitPos;

  return (
    <div 
      className="absolute transition-all duration-[3000ms] z-20"
      style={{ 
        left: currentPos.left, 
        top: currentPos.top, 
        transform: 'translate(-50%, -50%)',
        transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
    >
      <div className={`${!isEnergized ? animClass : ''} transition-transform duration-500`}>
        <div 
          className={`
            relative flex items-center justify-center w-16 h-16 rounded-full 
            border backdrop-blur-md overflow-hidden transition-all duration-700
            ${isEnergized 
              ? 'bg-[#0B0D15]/80 border-[#F7941D] scale-100 rotate-0'
              : 'bg-white/5 border-white/10 shadow-lg scale-90 hover:scale-95 hover:bg-white/10 rotate-12' 
            }
          `}
          style={{
            boxShadow: isEnergized ? '0 0 40px rgba(247,148,29,0.6)' : undefined
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/40 rounded-full" />
          <div className={`absolute inset-0 bg-[#F7941D]/20 blur-xl transition-opacity duration-500 ${isEnergized ? 'opacity-100' : 'opacity-0'}`} />
          <Icon size={24} className={`relative z-10 transition-all duration-500 ${isEnergized ? 'text-[#F7941D]' : 'text-white/30'}`} style={{ filter: isEnergized ? 'drop-shadow(0 0 5px rgba(247,148,29,0.8))' : undefined }} />
        </div>
        
        <div className={`
            absolute -bottom-8 left-1/2 -translate-x-1/2 
            text-[#F7941D] text-[10px] font-bold tracking-widest uppercase 
            px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/5
            transition-all duration-500 shadow-lg whitespace-nowrap
            ${isEnergized ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
          `}>
          {data.label}
        </div>
      </div>
    </div>
  );
};

export default function EnergyFlowOrb() {
  const [isEnergized, setIsEnergized] = useState(false);

  const handleMouseEnter = () => {
    if (window.matchMedia('(hover: hover)').matches) setIsEnergized(true);
  };

  const handleMouseLeave = () => {
    if (window.matchMedia('(hover: hover)').matches) setIsEnergized(false);
  };

  const handleClick = () => {
    setIsEnergized(!isEnergized);
  };

  const pathCenter = "M 200 280 C 200 210, 200 170, 200 100";
  const pathMidLeft = "M 200 280 C 200 225, 125 225, 125 140";
  const pathMidRight = "M 200 280 C 200 225, 275 225, 275 140";
  const pathFarLeft = "M 200 280 C 200 235, 50 245, 50 155";
  const pathFarRight = "M 200 280 C 200 235, 350 245, 350 155";

  return (
    <div className="relative w-full h-full min-h-[380px] flex items-center justify-center overflow-visible">
      <style>{`
        @keyframes float-orb-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(10px, -15px) rotate(5deg); }
          50% { transform: translate(-5px, -10px) rotate(-3deg); }
          75% { transform: translate(-8px, 5px) rotate(-2deg); }
        }
        @keyframes float-orb-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-12px, 8px) rotate(-5deg); }
          50% { transform: translate(8px, -6px) rotate(3deg); }
          75% { transform: translate(-5px, 10px) rotate(-4deg); }
        }
        @keyframes moveParticleEnergy {
          0% { offset-distance: 0%; opacity: 0; transform: scale(0.5); }
          20% { opacity: 1; transform: scale(1.2); }
          80% { opacity: 1; transform: scale(1); }
          100% { offset-distance: 100%; opacity: 0; transform: scale(0.5); }
        }
        .particle-energy { offset-rotate: auto; pointer-events: none; }
        .animate-float-orb-1 { animation: float-orb-1 12s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite; }
        .animate-float-orb-2 { animation: float-orb-2 14s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite reverse; }
        .animate-float-orb-3 { animation: float-orb-1 16s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite 2s; }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0B0D15]/50 via-transparent to-transparent" />

      <div className="relative w-full max-w-lg h-[380px] flex items-center justify-center">
        
        {/* Idle text */}
        <div 
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
            w-[80%] text-center z-0 pointer-events-none
            transition-all duration-1000 ease-in-out
            ${!isEnergized ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-md translate-y-10'}
          `}
        >
          <h3 className="text-sm md:text-base font-light text-white/30 leading-relaxed">
            Ferramentas em <span className="text-white/60 font-medium border-b border-white/20">standby</span>
          </h3>
        </div>

        {/* Energized text */}
        <div 
          className={`
            absolute top-[5%] left-1/2 -translate-x-1/2 
            w-full text-center z-30 pointer-events-none
            transition-all duration-1000 ease-out delay-500
            ${isEnergized ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}
          `}
        >
          <h3 className="text-xs md:text-sm font-medium text-white/80 tracking-wide" style={{ filter: 'drop-shadow(0 0 15px rgba(247,148,29,0.5))' }}>
            <span className="text-[#F7941D] font-bold">Todas conectadas</span> e trabalhando
          </h3>
        </div>

        {/* SVG paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 400 380" style={{ filter: 'blur(0.5px) contrast(1.2)' }}>
          <ConnectionPath d={pathFarLeft} isEnergized={isEnergized} delay={400} />
          <ConnectionPath d={pathMidLeft} isEnergized={isEnergized} delay={200} />
          <ConnectionPath d={pathCenter} isEnergized={isEnergized} delay={0} />
          <ConnectionPath d={pathMidRight} isEnergized={isEnergized} delay={200} />
          <ConnectionPath d={pathFarRight} isEnergized={isEnergized} delay={400} />
        </svg>

        {/* Orb nodes */}
        {nodesData.map((node) => (
          <OrbNode key={node.id} data={node} isEnergized={isEnergized} />
        ))}

        {/* Central trigger orb */}
        <div 
          className="absolute left-[50%] bottom-[5%] -translate-x-1/2 cursor-pointer group z-30"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <div className={`absolute inset-0 rounded-full transition-all duration-700 ${isEnergized ? 'bg-[#F7941D]/20 blur-2xl scale-150' : 'bg-transparent scale-100'}`} />

          <div className={`
            relative flex items-center justify-center w-20 h-20 
            transition-all duration-500 transform rounded-full border
            ${isEnergized 
              ? 'bg-black border-[#F7941D]/60 scale-110' 
              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30 hover:scale-105 backdrop-blur-md'
            }
          `}
          style={{
            boxShadow: isEnergized ? '0 0 60px rgba(247,148,29,0.5)' : undefined
          }}
          >
            {isEnergized && <div className="absolute inset-0 rounded-full border border-[#F7941D] animate-ping opacity-20" style={{animationDuration: '1.5s'}} />}
            
            <div className={`w-10 h-10 rounded-full transition-all duration-500 ${isEnergized ? 'bg-[#F7941D]' : 'bg-white/10 animate-pulse'}`} />
          </div>
        </div>

      </div>
    </div>
  );
}
