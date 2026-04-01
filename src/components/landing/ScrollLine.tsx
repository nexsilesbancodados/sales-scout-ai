import { useEffect, useState } from 'react';

export function ScrollLine() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          setProgress(docHeight > 0 ? scrollTop / docHeight : 0);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed left-6 md:left-10 top-0 bottom-0 z-40 pointer-events-none flex flex-col items-center">
      {/* Track */}
      <div className="relative w-[1px] h-full bg-white/[0.06]">
        {/* Progress fill */}
        <div
          className="absolute top-0 left-0 w-full origin-top transition-transform duration-100 ease-linear"
          style={{
            height: '100%',
            transform: `scaleY(${progress})`,
            background: 'linear-gradient(to bottom, rgba(123,47,242,0.6), rgba(247,148,29,0.6))',
          }}
        />
        {/* Glowing dot at current position */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full transition-[top] duration-100 ease-linear"
          style={{
            top: `${progress * 100}%`,
            background: 'radial-gradient(circle, rgba(123,47,242,1) 0%, rgba(123,47,242,0.4) 60%, transparent 100%)',
            boxShadow: '0 0 12px rgba(123,47,242,0.6), 0 0 24px rgba(123,47,242,0.3)',
          }}
        />
        {/* Outer glow trail */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-[2px] origin-top transition-transform duration-100 ease-linear"
          style={{
            height: '100%',
            transform: `scaleY(${progress})`,
            background: 'linear-gradient(to bottom, rgba(123,47,242,0.3), rgba(247,148,29,0.2))',
            filter: 'blur(3px)',
          }}
        />
      </div>
    </div>
  );
}
