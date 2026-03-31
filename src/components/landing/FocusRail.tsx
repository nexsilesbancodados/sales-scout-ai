import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

interface FocusRailItem {
  id: string;
  title: string;
  meta: string;
  description: string;
  imageSrc: string;
}

const wrap = (min: number, max: number, v: number): number => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

const BASE_SPRING = { type: "spring" as const, stiffness: 260, damping: 30, mass: 1 };

const CONTENT_ANIMATION = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
};

interface FocusRailProps {
  items: FocusRailItem[];
  initialIndex?: number;
  loop?: boolean;
  autoPlay?: boolean;
  interval?: number;
}

export function FocusRail({
  items,
  initialIndex = 0,
  loop = true,
  autoPlay = true,
  interval = 6000,
}: FocusRailProps) {
  const [active, setActive] = useState(initialIndex);
  const [isHovering, setIsHovering] = useState(false);
  const lastWheelTime = useRef(0);

  const count = items.length;
  const activeIndex = wrap(0, count, active);
  const activeItem = items[activeIndex];

  const handlePrev = useCallback(() => {
    if (!loop && active === 0) return;
    setActive((p) => p - 1);
  }, [loop, active]);

  const handleNext = useCallback(() => {
    if (!loop && active === count - 1) return;
    setActive((p) => p + 1);
  }, [loop, active, count]);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime.current < 600) return;
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = isHorizontal ? e.deltaX : e.deltaY;
      if (Math.abs(delta) > 30) {
        if (delta > 0) handleNext();
        else handlePrev();
        lastWheelTime.current = now;
      }
    },
    [handleNext, handlePrev]
  );

  useEffect(() => {
    if (!autoPlay || isHovering) return;
    const timer = setInterval(() => handleNext(), interval);
    return () => clearInterval(timer);
  }, [autoPlay, isHovering, handleNext, interval]);

  const onDragEnd = (_: unknown, { offset, velocity }: { offset: { x: number }; velocity: { x: number } }) => {
    const swipePower = Math.abs(offset.x) * velocity.x;
    if (swipePower < -10000) handleNext();
    else if (swipePower > 10000) handlePrev();
  };

  const visibleIndices = [-2, -1, 0, 1, 2];

  return (
    <div
      className="relative flex w-full flex-col overflow-hidden select-none outline-none py-8"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onWheel={onWheel}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") handlePrev();
        if (e.key === "ArrowRight") handleNext();
      }}
    >
      {/* Atmospheric background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`bg-${activeItem.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <img
              src={activeItem.imageSrc}
              alt=""
              className="h-full w-full object-cover blur-[100px] scale-125"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Main Experience */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6">
        {/* 3D Rail */}
        <motion.div
          className="relative mx-auto flex h-[350px] md:h-[400px] w-full max-w-7xl items-center justify-center cursor-grab active:cursor-grabbing"
          style={{ perspective: "2000px" }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={onDragEnd}
        >
          {visibleIndices.map((offset) => {
            const absIndex = active + offset;
            const index = wrap(0, count, absIndex);
            const item = items[index];

            if (!loop && (absIndex < 0 || absIndex >= count)) return null;

            const isCenter = offset === 0;
            const dist = Math.abs(offset);

            const xOffset = offset * 420;
            const zOffset = isCenter ? 0 : -350 - dist * 100;
            const rotateY = offset * -15;
            const scale = isCenter ? 1 : 0.85;
            const opacity = isCenter ? 1 : Math.max(0, 0.9 - dist * 0.3);

            return (
              <motion.div
                key={absIndex}
                className={`absolute aspect-video w-full max-w-[450px] md:max-w-[600px] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${
                  isCenter ? "z-30" : "z-10"
                }`}
                style={{
                  transformStyle: "preserve-3d",
                  background: "rgba(14,16,24,0.9)",
                }}
                initial={false}
                animate={{ x: xOffset, z: zOffset, scale, rotateY, opacity }}
                transition={BASE_SPRING}
                onClick={() => offset !== 0 && setActive((p) => p + offset)}
              >
                <img
                  src={item.imageSrc}
                  alt={item.title}
                  className="h-full w-full object-cover pointer-events-none"
                />
                {!isCenter && (
                  <div className="absolute inset-0 bg-black/40 backdrop-grayscale-[0.5] transition-opacity" />
                )}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[2rem]" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Content Section */}
        <div className="mx-auto mt-12 flex w-full max-w-6xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col items-center md:items-start text-center md:text-left h-28">
            <AnimatePresence mode="wait">
              <motion.div key={activeItem.id} {...CONTENT_ANIMATION} className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
                  {activeItem.meta}
                </span>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                  {activeItem.title}
                </h3>
                <p className="max-w-xl text-white/40 text-sm md:text-base font-medium leading-tight">
                  {activeItem.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrev}
                className="group rounded-full bg-white/[0.06] border border-white/[0.08] p-3 text-white/60 transition-all hover:bg-white/[0.1] hover:text-white active:scale-90"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>

              <div className="flex gap-1.5">
                {items.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === activeIndex
                        ? "w-8 bg-[#7B2FF2]"
                        : "w-1.5 bg-white/15"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="group rounded-full bg-white/[0.06] border border-white/[0.08] p-3 text-white/60 transition-all hover:bg-white/[0.1] hover:text-white active:scale-90"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </div>

            <button
              onClick={() => window.location.href = '/auth'}
              className="flex items-center gap-2 text-[#7B2FF2] font-semibold text-sm hover:underline underline-offset-4 group"
            >
              Começar agora
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
