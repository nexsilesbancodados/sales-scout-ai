import { useEffect, useRef } from 'react';

export function ScrollCurveLine() {
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathLengthRef = useRef(0);

  useEffect(() => {
    if (!pathRef.current) return;
    pathLengthRef.current = pathRef.current.getTotalLength();
    pathRef.current.style.strokeDasharray = `${pathLengthRef.current}`;
    pathRef.current.style.strokeDashoffset = `${pathLengthRef.current}`;
  }, []);

  useEffect(() => {
    const pathLen = pathLengthRef.current;
    if (!pathLen || !containerRef.current) return;
    const path = pathRef.current;
    const glow = glowRef.current;
    if (!path) return;

    let ticking = false;
    let lastReached = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) { ticking = false; return; }
        const rect = container.getBoundingClientRect();
        const vh = window.innerHeight;
        // Line should complete drawing by the time user scrolls ~75% through the container
        const totalTravel = rect.height * 0.75;
        const traveled = vh - rect.top;
        const pct = Math.max(0, Math.min(1, traveled / totalTravel));
        
        path.style.strokeDashoffset = `${pathLen * (1 - pct)}`;

        // Position the glow dot at the tip of the drawn line
        if (glow && pct > 0.01) {
          const point = path.getPointAtLength(pathLen * pct);
          glow.setAttribute('cx', `${point.x}`);
          glow.setAttribute('cy', `${point.y}`);
          glow.style.opacity = `${Math.min(1, pct * 3)}`;
        }
        
        const reached = pct > 0.82;
        if (reached !== lastReached) {
          lastReached = reached;
          window.dispatchEvent(new CustomEvent('line-reached-globe', { detail: { reached } }));
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The curve ends right at the globe center area
  const curvePath = `M 500 0 
     C 900 400, 900 700, 500 1266 
     C 100 1766, 100 2166, 500 2633 
     C 900 3133, 900 3500, 500 4000
     C 300 4300, 400 4500, 500 4600`;

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-0 overflow-visible">
      <svg
        viewBox="0 0 1000 4600"
        className="absolute top-0 left-0 w-full h-full"
        preserveAspectRatio="none"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="curve-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7B2FF2" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#F7941D" stopOpacity="0.7" />
            <stop offset="85%" stopColor="#7B2FF2" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7B2FF2" stopOpacity="1" />
          </linearGradient>
          <radialGradient id="tip-glow">
            <stop offset="0%" stopColor="#F7941D" stopOpacity="1" />
            <stop offset="40%" stopColor="#F7941D" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F7941D" stopOpacity="0" />
          </radialGradient>
        </defs>

        <path
          ref={pathRef}
          d={curvePath}
          fill="none"
          stroke="url(#curve-gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.15s linear' }}
        />

        {/* Glowing tip dot that follows the drawn path */}
        <circle
          ref={glowRef}
          r="12"
          fill="url(#tip-glow)"
          style={{ opacity: 0, transition: 'opacity 0.3s' }}
        />
      </svg>
    </div>
  );
}
