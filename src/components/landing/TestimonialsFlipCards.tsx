import { useEffect, useRef, useState } from 'react';
import { Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Rafael M.',
    role: 'Agência de Marketing, SP',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    text: 'Em 14 dias: 800 leads capturados, 12 contratos fechados. O SDR da IA converte melhor que minha equipe de 3 pessoas.',
    metric: '+800 leads',
  },
  {
    id: 2,
    name: 'Camila S.',
    role: 'Consultora de Vendas, RJ',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    text: 'Acordo com 5 reuniões agendadas. A IA prospectou, qualificou e respondeu enquanto eu dormia. Surreal.',
    metric: '5 reuniões/dia',
  },
  {
    id: 3,
    name: 'Lucas P.',
    role: 'Startup B2B, BH',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    text: 'Reduzi meu custo por lead de R$18 para R$0,80. O CRM + Meta Ads me dá visibilidade total do funil.',
    metric: 'CPL R$0,80',
  },
  {
    id: 4,
    name: 'Marina L.',
    role: 'Agência Digital, Curitiba',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400',
    text: 'De 8 reuniões/mês para 27 no primeiro mês. O follow-up automático recupera leads que eu já tinha dado como perdidos.',
    metric: '27 reuniões/mês',
  },
];

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

export function TestimonialsFlipCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [libLoaded, setLibLoaded] = useState(false);

  // Load GSAP + ScrollTrigger
  useEffect(() => {
    if (window.gsap && window.ScrollTrigger) {
      setLibLoaded(true);
      return;
    }

    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => resolve();
        s.onerror = () => reject();
        document.head.appendChild(s);
      });

    (async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js');
        setLibLoaded(true);
      } catch {
        // silently fail – cards will just stay static
      }
    })();
  }, []);

  // Init animations
  useEffect(() => {
    if (!libLoaded || !window.gsap) return;
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=350%',
        pin: true,
        scrub: 2,
        anticipatePin: 1,
      },
    });

    cardsRef.current.forEach((card, index) => {
      if (!card) return;
      tl.to(card, { rotationY: 180, ease: 'power2.inOut', duration: 1 }, index * 0.35);
    });

    return () => { ScrollTrigger.getAll().forEach((t: any) => t.kill()); };
  }, [libLoaded]);

  return (
    <section
      ref={containerRef}
      className="relative h-screen flex items-center justify-center overflow-hidden px-4 md:px-12"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(123,47,242,0.08) 0%, transparent 60%)' }} />

      {/* Header pinned at top */}
      <div className="absolute top-8 md:top-14 left-0 right-0 text-center z-20 px-4">
        <span className="text-xs font-semibold tracking-[0.2em] text-[#F7941D] uppercase">Resultados reais</span>
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mt-3">
          Não acredite em nós. <span className="text-white/30">Acredite neles.</span>
        </h2>
        <p className="text-white/30 text-sm mt-2">Role para revelar os depoimentos ↓</p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-[1500px] w-full mt-16">
        {TESTIMONIALS.map((person, index) => (
          <div key={person.id} className="h-[420px] md:h-[480px] w-full" style={{ perspective: '2000px' }}>
            <div
              ref={(el) => { cardsRef.current[index] = el; }}
              className="relative w-full h-full cursor-pointer will-change-transform"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* FRONT — Photo */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <img src={person.image} alt={person.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D15] via-[#0B0D15]/40 to-transparent" />

                {/* Metric badge */}
                <div className="absolute top-4 right-4 bg-[#7B2FF2]/80 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-[11px] font-bold text-white tracking-wide">{person.metric}</span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white">{person.name}</h3>
                  <p className="text-[12px] text-white/50 uppercase tracking-[0.15em] font-medium mt-1">{person.role}</p>
                </div>
              </div>

              {/* BACK — Testimonial */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden border border-white/[0.08] flex flex-col"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: '#0B0D15',
                  backgroundImage: `
                    linear-gradient(to right, rgba(123,47,242,0.04) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(123,47,242,0.04) 1px, transparent 1px)
                  `,
                  backgroundSize: '36px 36px',
                }}
              >
                {/* Quote marks */}
                <div className="absolute top-6 right-6 text-[#7B2FF2]/60">
                  <div className="flex gap-0.5">
                    <Quote size={20} fill="currentColor" strokeWidth={0} />
                    <Quote size={20} fill="currentColor" strokeWidth={0} className="-ml-1" />
                  </div>
                </div>

                {/* Gradient accent top */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7B2FF2]/40 to-transparent" />

                <div className="relative h-full flex flex-col justify-between p-8 z-10">
                  <div className="mt-10">
                    <p className="text-white text-lg md:text-xl font-serif leading-relaxed italic border-l-2 border-[#E91E8C] pl-5">
                      "{person.text}"
                    </p>
                  </div>

                  <div className="pt-4">
                    <div className="w-10 h-0.5 bg-gradient-to-r from-[#7B2FF2] to-[#E91E8C] mb-4" />
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#7B2FF2] to-[#E91E8C] flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        {person.name[0]}
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm uppercase tracking-tight">{person.name}</p>
                        <p className="text-white/30 text-[11px] uppercase tracking-widest font-medium">{person.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
