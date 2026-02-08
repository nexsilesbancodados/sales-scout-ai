import { useEffect, useState } from 'react';
import { Rocket } from 'lucide-react';

interface RocketTransitionProps {
  isActive: boolean;
  onComplete: () => void;
}

export function RocketTransition({ isActive, onComplete }: RocketTransitionProps) {
  const [phase, setPhase] = useState<'idle' | 'launch' | 'flying' | 'arriving' | 'complete'>('idle');

  useEffect(() => {
    if (isActive && phase === 'idle') {
      // Start launch sequence
      setPhase('launch');
      
      // Rocket starts flying after shake
      setTimeout(() => setPhase('flying'), 600);
      
      // Page transition
      setTimeout(() => setPhase('arriving'), 1400);
      
      // Complete transition
      setTimeout(() => {
        setPhase('complete');
        onComplete();
      }, 2200);
    }
  }, [isActive, phase, onComplete]);

  if (!isActive && phase === 'idle') return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Rocket */}
      <div
        className={`
          absolute z-[102] transition-all duration-700 ease-in-out
          ${phase === 'idle' ? 'opacity-0' : 'opacity-100'}
          ${phase === 'launch' ? 'bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 animate-[shake_0.5s_ease-in-out]' : ''}
          ${phase === 'flying' ? 'bottom-full left-1/2 -translate-x-1/2 -translate-y-20' : ''}
          ${phase === 'arriving' || phase === 'complete' ? 'bottom-full left-1/2 -translate-x-1/2 -translate-y-40 opacity-0' : ''}
        `}
        style={{
          transitionDuration: phase === 'flying' ? '800ms' : '500ms',
        }}
      >
        {/* Rocket body */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-b from-primary to-primary/80 rounded-full flex items-center justify-center shadow-2xl shadow-primary/50">
            <Rocket className="w-10 h-10 text-primary-foreground rotate-[-45deg]" />
          </div>
          
          {/* Flame trail */}
          {(phase === 'launch' || phase === 'flying') && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-6 h-12 bg-gradient-to-b from-orange-500 via-yellow-400 to-transparent rounded-full animate-pulse" />
              <div className="w-4 h-8 bg-gradient-to-b from-yellow-400 to-transparent rounded-full -mt-4 animate-pulse" />
              
              {/* Smoke particles */}
              <div className="absolute top-8 flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-white/40 rounded-full animate-ping"
                    style={{
                      animationDelay: `${i * 100}ms`,
                      animationDuration: '1s',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Login page being carried away */}
      <div
        className={`
          absolute inset-0 z-[101] transition-transform duration-700 ease-in-out
          ${phase === 'flying' || phase === 'arriving' || phase === 'complete' ? '-translate-y-full' : 'translate-y-0'}
        `}
        style={{
          transitionDuration: phase === 'flying' ? '800ms' : '500ms',
        }}
      >
        {/* This creates the illusion of the page being carried */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/20" />
      </div>

      {/* Stars flying by during transition */}
      {(phase === 'flying' || phase === 'arriving') && (
        <div className="absolute inset-0 z-[100]">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-8 bg-gradient-to-b from-white to-transparent rounded-full animate-[flyingStar_0.5s_linear_infinite]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 500}ms`,
                opacity: Math.random() * 0.7 + 0.3,
              }}
            />
          ))}
        </div>
      )}

      {/* Overlay that fades in */}
      <div
        className={`
          absolute inset-0 z-[99] bg-background transition-opacity duration-500
          ${phase === 'arriving' || phase === 'complete' ? 'opacity-100' : 'opacity-0'}
        `}
      />

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(-50%, 50%) rotate(0deg); }
          10% { transform: translate(-52%, 48%) rotate(-2deg); }
          20% { transform: translate(-48%, 52%) rotate(2deg); }
          30% { transform: translate(-52%, 50%) rotate(-1deg); }
          40% { transform: translate(-48%, 48%) rotate(1deg); }
          50% { transform: translate(-50%, 52%) rotate(0deg); }
          60% { transform: translate(-52%, 50%) rotate(-2deg); }
          70% { transform: translate(-48%, 48%) rotate(2deg); }
          80% { transform: translate(-50%, 52%) rotate(-1deg); }
          90% { transform: translate(-52%, 50%) rotate(1deg); }
        }
        
        @keyframes flyingStar {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
}
