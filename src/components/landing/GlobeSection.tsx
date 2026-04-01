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
          {/* Glow */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-700"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(123,47,242,0.2) 0%, transparent 60%)',
              opacity: lineReached ? 1 : 0.4,
            }}
          />

          <div
            className="w-full max-w-[460px] transition-all duration-700"
            style={{
              filter: lineReached ? 'drop-shadow(0 0 40px rgba(123,47,242,0.3))' : 'none',
              transform: lineReached ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            {isVisible ? (
              <Suspense fallback={<div className="aspect-square" />}>
                <Globe
                  markers={markers}
                  arcs={arcs}
                  dark={1}
                  baseColor={[0.15, 0.12, 0.25]}
                  markerColor={[0.48, 0.18, 0.95]}
                  arcColor={[0.97, 0.58, 0.11]}
                  glowColor={[0.25, 0.15, 0.45]}
                  mapBrightness={6}
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
