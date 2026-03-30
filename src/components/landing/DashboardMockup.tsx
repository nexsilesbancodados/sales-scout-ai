import { useState, useEffect, useRef } from 'react';
import dashboardImg from '@/assets/dashboard-mockup.jpg';

export function DashboardMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setInView(true);
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleMouse = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    setTilt({ x, y });
  };

  const handleLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      ref={containerRef}
      className="relative perspective-[1200px] mx-auto max-w-5xl"
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
    >
      {/* Glow behind */}
      <div
        className="absolute -inset-8 rounded-3xl opacity-60 blur-3xl pointer-events-none transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(123,47,242,0.2) 0%, rgba(233,30,140,0.1) 40%, transparent 70%)',
          opacity: inView ? 0.6 : 0,
        }}
      />

      <div
        className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/50 transition-all duration-700"
        style={{
          transform: inView
            ? `perspective(1200px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale(1)`
            : 'perspective(1200px) rotateY(0deg) rotateX(5deg) scale(0.9) translateY(60px)',
          opacity: inView ? 1 : 0,
          transition: 'transform 1s cubic-bezier(.16,1,.3,1), opacity 0.8s ease',
        }}
      >
        {/* Browser bar */}
        <div className="bg-[#0E1018] border-b border-white/[0.06] px-4 py-2.5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 mx-12">
            <div className="bg-white/[0.06] rounded-md px-3 py-1 text-[10px] text-white/30 text-center">
              app.nexaprospect.com/dashboard
            </div>
          </div>
        </div>

        <img
          src={dashboardImg}
          alt="NexaProspect Dashboard"
          className="w-full h-auto"
          loading="lazy"
        />

        {/* Reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Floating badge */}
      <div
        className="absolute -right-4 top-12 bg-[#0E1018]/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-4 py-3 shadow-xl transition-all duration-1000"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateX(0) scale(1)' : 'translateX(30px) scale(0.8)',
          transitionDelay: '0.5s',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[11px] text-white/70 font-medium">12 leads qualificados agora</span>
        </div>
      </div>

      {/* Floating stats */}
      <div
        className="absolute -left-6 bottom-16 bg-[#0E1018]/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-4 py-3 shadow-xl transition-all duration-1000"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateX(0) scale(1)' : 'translateX(-30px) scale(0.8)',
          transitionDelay: '0.7s',
        }}
      >
        <p className="text-[10px] text-white/40 mb-1">Conversão hoje</p>
        <p className="text-lg font-bold text-green-400">+23.5%</p>
      </div>
    </div>
  );
}
