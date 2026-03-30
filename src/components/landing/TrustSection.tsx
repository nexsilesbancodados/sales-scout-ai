import { useRef, useState, useEffect } from 'react';
import { Shield, Lock, Server, Clock, Award, Headphones } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: Shield, title: 'Anti-ban nativo', desc: 'Warm-up progressivo e delays humanizados', color: '#7B2FF2' },
  { icon: Lock, title: 'LGPD Compliance', desc: 'Seus dados seguros e em conformidade', color: '#00B4D8' },
  { icon: Server, title: '99.9% Uptime', desc: 'Infraestrutura robusta e escalável', color: '#E91E8C' },
  { icon: Clock, title: 'Setup em 5 min', desc: 'Conecte o WhatsApp e comece agora', color: '#F7941D' },
  { icon: Award, title: 'Nota 4.9/5', desc: 'Avaliado por +2.400 usuários', color: '#7B2FF2' },
  { icon: Headphones, title: 'Suporte dedicado', desc: 'Atendimento rápido em português', color: '#00B4D8' },
];

export function TrustSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setInView(true);
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {TRUST_ITEMS.map((item, i) => (
        <div
          key={item.title}
          className="group text-center p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all duration-500 cursor-default"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.9)',
            transition: `all 0.6s cubic-bezier(.16,1,.3,1) ${i * 0.08}s`,
          }}
        >
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
            style={{ background: `${item.color}12`, border: `1px solid ${item.color}20` }}
          >
            <item.icon className="h-4.5 w-4.5" style={{ color: item.color }} />
          </div>
          <h4 className="text-[12px] font-semibold text-white mb-1">{item.title}</h4>
          <p className="text-[10px] text-white/35 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}
