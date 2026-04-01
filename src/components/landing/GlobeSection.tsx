import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';

const Globe = lazy(() => import('@/components/ui/cobe-globe').then(m => ({ default: m.Globe })));

const markers = [
  { id: "sp", location: [-23.5505, -46.6333] as [number, number], label: "São Paulo" },
  { id: "rj", location: [-22.9068, -43.1729] as [number, number], label: "Rio de Janeiro" },
  { id: "bh", location: [-19.9167, -43.9345] as [number, number], label: "Belo Horizonte" },
  { id: "bsb", location: [-15.7975, -47.8919] as [number, number], label: "Brasília" },
  { id: "nyc", location: [40.7128, -74.006] as [number, number], label: "New York" },
  { id: "london", location: [51.5074, -0.1278] as [number, number], label: "London" },
  { id: "lisbon", location: [38.7223, -9.1393] as [number, number], label: "Lisboa" },
];

const arcs = [
  { id: "sp-nyc", from: [-23.5505, -46.6333] as [number, number], to: [40.7128, -74.006] as [number, number] },
  { id: "sp-lisbon", from: [-23.5505, -46.6333] as [number, number], to: [38.7223, -9.1393] as [number, number] },
];

export function GlobeSection() {
  const [lineReached, setLineReached] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      setLineReached((e as CustomEvent).detail.reached);
    };
    window.addEventListener('line-reached-globe', handler);
    return () => window.removeEventListener('line-reached-globe', handler);
  }, []);

  // Only render globe when section is near viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#F7941D] font-semibold">Alcance Global</span>
          <h2 className="text-3xl md:text-4xl font-black tracking-[-0.03em] mt-3 text-white leading-[1.1]">
            Prospecte em todo o <span className="landing-gradient-text">Brasil e no mundo</span>
          </h2>
          <p className="text-[14px] text-white/40 mt-4 max-w-[520px] mx-auto">
            Nossa plataforma alcança leads em qualquer cidade do Brasil e nas principais capitais do mundo.
          </p>
        </motion.div>

        <div className="relative flex items-center justify-center">
          {/* Glow backdrop */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-1000"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(123,47,242,0.25) 0%, transparent 60%)',
              opacity: lineReached ? 1 : 0.3,
              transform: lineReached ? 'scale(1.2)' : 'scale(1)',
            }}
          />

          {/* Outer ring glow */}
          <div
            className="absolute w-[480px] h-[480px] rounded-full pointer-events-none transition-all duration-1000"
            style={{
              boxShadow: lineReached
                ? '0 0 80px 20px rgba(123,47,242,0.4), 0 0 160px 60px rgba(123,47,242,0.15), inset 0 0 60px 10px rgba(123,47,242,0.1)'
                : 'none',
              opacity: lineReached ? 1 : 0,
            }}
          />

          {/* Pulse ring on connection */}
          <div
            className="absolute w-[500px] h-[500px] rounded-full pointer-events-none border-2 border-primary/40"
            style={{
              opacity: lineReached ? 1 : 0,
              transform: lineReached ? 'scale(1.1)' : 'scale(0.9)',
              transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
              animation: lineReached ? 'pulse 2s ease-in-out infinite' : 'none',
            }}
          />

          <div
            className="w-full max-w-[460px] transition-all duration-700"
            style={{
              filter: lineReached
                ? 'drop-shadow(0 0 60px rgba(123,47,242,0.5)) drop-shadow(0 0 120px rgba(123,47,242,0.2))'
                : 'none',
              transform: lineReached ? 'scale(1.03)' : 'scale(1)',
            }}
          >
            {isVisible ? (
              <Suspense fallback={<div className="aspect-square" />}>
                <Globe
                  markers={markers}
                  arcs={arcs}
                  dark={1}
                  baseColor={lineReached ? [0.2, 0.15, 0.35] : [0.15, 0.12, 0.25]}
                  markerColor={[0.48, 0.18, 0.95]}
                  arcColor={[0.97, 0.58, 0.11]}
                  glowColor={lineReached ? [0.35, 0.2, 0.6] : [0.25, 0.15, 0.45]}
                  mapBrightness={lineReached ? 8 : 6}
                  speed={0.002}
                  markerSize={0.03}
                  mapSamples={10000}
                />
              </Suspense>
            ) : (
              <div className="aspect-square" />
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-8">
          {[
            { value: '5.570+', label: 'Cidades no Brasil' },
            { value: '30+', label: 'Países alcançados' },
            { value: '24/7', label: 'Prospecção ativa' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl md:text-2xl font-black landing-gradient-text">{stat.value}</div>
              <div className="text-[11px] text-white/35 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
