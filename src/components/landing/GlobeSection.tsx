import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe } from '@/components/ui/cobe-globe';

const markers = [
  { id: "sp", location: [-23.5505, -46.6333] as [number, number], label: "São Paulo" },
  { id: "rj", location: [-22.9068, -43.1729] as [number, number], label: "Rio de Janeiro" },
  { id: "bh", location: [-19.9167, -43.9345] as [number, number], label: "Belo Horizonte" },
  { id: "ctb", location: [-25.4284, -49.2733] as [number, number], label: "Curitiba" },
  { id: "bsb", location: [-15.7975, -47.8919] as [number, number], label: "Brasília" },
  { id: "ssa", location: [-12.9714, -38.5124] as [number, number], label: "Salvador" },
  { id: "rec", location: [-8.0476, -34.877] as [number, number], label: "Recife" },
  { id: "nyc", location: [40.7128, -74.006] as [number, number], label: "New York" },
  { id: "london", location: [51.5074, -0.1278] as [number, number], label: "London" },
  { id: "dubai", location: [25.2048, 55.2708] as [number, number], label: "Dubai" },
  { id: "tokyo", location: [35.6762, 139.6503] as [number, number], label: "Tokyo" },
  { id: "lisbon", location: [38.7223, -9.1393] as [number, number], label: "Lisboa" },
];

const arcs = [
  { id: "sp-nyc", from: [-23.5505, -46.6333] as [number, number], to: [40.7128, -74.006] as [number, number] },
  { id: "sp-lisbon", from: [-23.5505, -46.6333] as [number, number], to: [38.7223, -9.1393] as [number, number] },
  { id: "sp-dubai", from: [-23.5505, -46.6333] as [number, number], to: [25.2048, 55.2708] as [number, number] },
];

export function GlobeSection() {
  const [lineReached, setLineReached] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setLineReached(detail.reached);
    };
    window.addEventListener('line-reached-globe', handler);
    return () => window.removeEventListener('line-reached-globe', handler);
  }, []);

  return (
    <section className="relative py-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#F7941D] font-semibold">Alcance Global</span>
          <h2 className="text-3xl md:text-4xl font-black tracking-[-0.03em] mt-3 text-white leading-[1.1]">
            Prospecte em todo o <span className="landing-gradient-text">Brasil e no mundo</span>
          </h2>
          <p className="text-[14px] text-white/40 mt-4 max-w-[520px] mx-auto">
            Nossa plataforma alcança leads em qualquer cidade do Brasil e nas principais capitais do mundo. Sem limites geográficos para o seu crescimento.
          </p>
        </motion.div>

        <div className="relative flex items-center justify-center">
          {/* Glow that intensifies when line reaches */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-1000"
            style={{
              background: lineReached
                ? 'radial-gradient(ellipse at center, rgba(123,47,242,0.35) 0%, rgba(123,47,242,0.1) 40%, transparent 70%)'
                : 'radial-gradient(ellipse at center, rgba(123,47,242,0.08) 0%, transparent 60%)',
            }}
          />

          {/* Pulsing ring when connected */}
          {lineReached && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-[520px] h-[520px] rounded-full border border-[#7B2FF2]/30"
                style={{
                  animation: 'globe-pulse-ring 2.5s ease-out infinite',
                }}
              />
            </div>
          )}

          <div
            className="w-full max-w-[500px] transition-all duration-1000"
            style={{
              filter: lineReached ? 'drop-shadow(0 0 60px rgba(123,47,242,0.4)) drop-shadow(0 0 120px rgba(123,47,242,0.15))' : 'none',
              transform: lineReached ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <Globe
              markers={markers}
              arcs={arcs}
              dark={1}
              baseColor={lineReached ? [0.2, 0.15, 0.35] : [0.15, 0.12, 0.25]}
              markerColor={lineReached ? [0.55, 0.22, 1] : [0.48, 0.18, 0.95]}
              arcColor={[0.97, 0.58, 0.11]}
              glowColor={lineReached ? [0.35, 0.2, 0.6] : [0.25, 0.15, 0.45]}
              mapBrightness={lineReached ? 8 : 6}
              speed={lineReached ? 0.003 : 0.002}
              markerSize={0.03}
            />
          </div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-8"
        >
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
        </motion.div>
      </div>

      <style>{`
        @keyframes globe-pulse-ring {
          0% { transform: scale(0.85); opacity: 0.6; }
          70% { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(1.15); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
