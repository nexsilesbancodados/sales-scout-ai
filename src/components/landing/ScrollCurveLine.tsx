import { useEffect, useRef, useState } from 'react';

export function ScrollCurveLine() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [drawOffset, setDrawOffset] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!pathRef.current) return;
    const len = pathRef.current.getTotalLength();
    setPathLength(len);
    setDrawOffset(len);
  }, []);

  useEffect(() => {
    if (!pathLength || !containerRef.current) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const container = containerRef.current;
          if (!container) return;
          const rect = container.getBoundingClientRect();
          const vh = window.innerHeight;
          const totalTravel = rect.height + vh;
          const traveled = vh - rect.top;
          const pct = Math.max(0, Math.min(1, traveled / totalTravel));
          setDrawOffset(pathLength * (1 - pct));
          setProgress(pct);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathLength]);

  // Line reaches globe at ~92% progress
  const globeReached = progress > 0.88;

  const curvePath = `M 500 0 
     C 900 400, 900 700, 500 1266 
     C 100 1766, 100 2166, 500 2633 
     C 900 3133, 900 3500, 500 4000
     C 300 4300, 400 4500, 500 4600`;

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-0 overflow-visible">
      <svg
        ref={svgRef}
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
          <filter id="curve-glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="endpoint-glow">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="endpoint-radial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7B2FF2" stopOpacity="1" />
            <stop offset="40%" stopColor="#7B2FF2" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7B2FF2" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Active drawn line */}
        <path
          ref={pathRef}
          d={curvePath}
          fill="none"
          stroke="url(#curve-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#curve-glow)"
          style={{
            strokeDasharray: pathLength || 1,
            strokeDashoffset: drawOffset,
            transition: 'stroke-dashoffset 0.12s ease-out',
          }}
        />

        {/* Glowing endpoint at globe */}
        <circle
          cx="500"
          cy="4600"
          r={globeReached ? 40 : 0}
          fill="url(#endpoint-radial)"
          filter="url(#endpoint-glow)"
          style={{
            transition: 'r 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease',
            opacity: globeReached ? 1 : 0,
          }}
        />
        {/* Inner bright dot */}
        <circle
          cx="500"
          cy="4600"
          r={globeReached ? 8 : 0}
          fill="#7B2FF2"
          style={{
            transition: 'r 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
            opacity: globeReached ? 1 : 0,
          }}
        />
      </svg>

      {/* Dispatch custom event for globe to listen to */}
      <GlobeConnectionNotifier reached={globeReached} />
    </div>
  );
}

function GlobeConnectionNotifier({ reached }: { reached: boolean }) {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('line-reached-globe', { detail: { reached } }));
  }, [reached]);
  return null;
}
