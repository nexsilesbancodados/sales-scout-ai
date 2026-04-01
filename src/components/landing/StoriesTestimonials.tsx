import { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import avatar1 from '@/assets/avatars/avatar-1.jpg';
import avatar2 from '@/assets/avatars/avatar-2.jpg';
import avatar3 from '@/assets/avatars/avatar-3.jpg';
import avatar4 from '@/assets/avatars/avatar-4.jpg';
import avatar5 from '@/assets/avatars/avatar-5.jpg';
import avatar6 from '@/assets/avatars/avatar-6.jpg';
import avatar7 from '@/assets/avatars/avatar-7.jpg';
import avatar8 from '@/assets/avatars/avatar-8.jpg';
import avatar9 from '@/assets/avatars/avatar-9.jpg';
import avatar10 from '@/assets/avatars/avatar-10.jpg';

const TESTIMONIALS = [
  { name: 'Rafael S.', role: 'Agência Digital', text: 'Em 2 semanas já tinha fechado 8 clientes novos. A IA faz um trabalho absurdo de personalização.', avatar: avatar1, gradient: 'from-violet-500 to-fuchsia-500' },
  { name: 'Camila R.', role: 'Consultoria RH', text: 'Antes eu prospectava manualmente por horas. Agora a plataforma faz tudo sozinha enquanto durmo.', avatar: avatar2, gradient: 'from-pink-500 to-rose-500' },
  { name: 'Lucas M.', role: 'Marketing', text: 'O anti-ban funciona de verdade. Já enviei milhares de mensagens sem problema nenhum.', avatar: avatar3, gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Juliana P.', role: 'Arquitetura', text: 'Consegui 3x mais reuniões agendadas no primeiro mês. ROI absurdo.', avatar: avatar4, gradient: 'from-emerald-500 to-teal-500' },
  { name: 'Marcos T.', role: 'Advocacia', text: 'A segmentação por nicho é muito precisa. Só chega lead qualificado.', avatar: avatar5, gradient: 'from-amber-500 to-orange-500' },
  { name: 'Fernanda L.', role: 'E-commerce', text: 'Melhor investimento que fiz pro meu negócio. Paga-se no primeiro cliente.', avatar: avatar6, gradient: 'from-red-500 to-pink-500' },
  { name: 'André C.', role: 'Contabilidade', text: 'O CRM integrado é um diferencial enorme. Tudo num lugar só.', avatar: avatar7, gradient: 'from-indigo-500 to-violet-500' },
  { name: 'Patrícia N.', role: 'Imobiliária', text: 'Fechei 12 contratos em 30 dias usando o follow-up automático. Incrível!', avatar: avatar8, gradient: 'from-sky-500 to-blue-500' },
  { name: 'Diego F.', role: 'SaaS B2B', text: 'A prospecção por Google Maps traz leads super quentes. Taxa de resposta de 35%.', avatar: avatar9, gradient: 'from-lime-500 to-green-500' },
  { name: 'Beatriz A.', role: 'Clínica Estética', text: 'Nunca imaginei automatizar prospecção assim. Simplesmente funciona.', avatar: avatar10, gradient: 'from-fuchsia-500 to-purple-500' },
];

export function StoriesTestimonials() {
  const [activeStory, setActiveStory] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (activeStory === null) return;
    setProgress(0);
    const start = Date.now();
    const duration = 5000;
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timerRef.current);
        if (activeStory < TESTIMONIALS.length - 1) {
          setActiveStory(activeStory + 1);
        } else {
          setActiveStory(null);
        }
      }
    }, 50);
    return () => clearInterval(timerRef.current);
  }, [activeStory]);

  const goNext = () => {
    if (activeStory !== null && activeStory < TESTIMONIALS.length - 1) setActiveStory(activeStory + 1);
    else setActiveStory(null);
  };

  const goPrev = () => {
    if (activeStory !== null && activeStory > 0) setActiveStory(activeStory - 1);
  };

  return (
    <>
      {/* Stories row */}
      <div ref={scrollRef} className="flex gap-4 md:gap-5 overflow-x-auto pb-4 px-2 max-w-4xl mx-auto scrollbar-hide justify-start md:justify-center">
        {TESTIMONIALS.map((t, i) => (
          <button
            key={i}
            onClick={() => setActiveStory(i)}
            className="flex flex-col items-center gap-1.5 shrink-0 group"
          >
            <div className={`w-16 h-16 md:w-[72px] md:h-[72px] rounded-full bg-gradient-to-br ${t.gradient} p-[2.5px] transition-transform group-hover:scale-110`}>
              <img src={t.avatar} alt={t.name} className="w-full h-full rounded-full object-cover" loading="lazy" />
            </div>
            <span className="text-[10px] text-white/50 max-w-[72px] truncate">{t.name}</span>
          </button>
        ))}
      </div>

      {/* Fullscreen story overlay */}
      <AnimatePresence>
        {activeStory !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) setActiveStory(null); }}
          >
            <motion.div
              key={activeStory}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-[340px] md:w-[380px] max-h-[680px] rounded-3xl overflow-hidden"
            >
              {/* Progress bars */}
              <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
                {TESTIMONIALS.map((_, i) => (
                  <div key={i} className="flex-1 h-[3px] rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all"
                      style={{
                        width: i < activeStory ? '100%' : i === activeStory ? `${progress}%` : '0%',
                        transition: i === activeStory ? 'none' : 'width 0.3s',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Story content */}
              <div className={`bg-gradient-to-br ${TESTIMONIALS[activeStory].gradient} p-[1px] rounded-3xl`}>
                <div className="bg-[#0c0c1a] rounded-3xl px-8 py-12 min-h-[500px] flex flex-col items-center justify-center text-center gap-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 absolute top-10 left-6">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${TESTIMONIALS[activeStory].gradient} p-[1.5px]`}>
                      <img src={TESTIMONIALS[activeStory].avatar} alt={TESTIMONIALS[activeStory].name} className="w-full h-full rounded-full object-cover" />
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-semibold text-white">{TESTIMONIALS[activeStory].name}</p>
                      <p className="text-[10px] text-white/50">{TESTIMONIALS[activeStory].role}</p>
                    </div>
                  </div>

                  {/* Avatar large */}
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${TESTIMONIALS[activeStory].gradient} flex items-center justify-center text-4xl shadow-2xl`}>
                    {TESTIMONIALS[activeStory].avatar}
                  </div>

                  {/* Quote */}
                  <p className="text-white/90 text-[15px] leading-relaxed font-medium max-w-[280px]">
                    "{TESTIMONIALS[activeStory].text}"
                  </p>

                  <div className="flex gap-0.5 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-sm">★</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Close */}
              <button onClick={() => setActiveStory(null)} className="absolute top-10 right-5 z-10 text-white/60 hover:text-white">
                <X className="h-5 w-5" />
              </button>

              {/* Nav areas */}
              <button onClick={goPrev} className="absolute left-0 top-20 bottom-0 w-1/3 z-10" />
              <button onClick={goNext} className="absolute right-0 top-20 bottom-0 w-1/3 z-10" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
