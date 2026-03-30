import { useRef, useEffect, useState, useCallback } from 'react';

/** Returns a value 0→1 as element scrolls into view */
export function useScrollProgress(offset = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const update = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const raw = 1 - (rect.top - vh * offset) / (vh * (1 - offset));
    setProgress(Math.max(0, Math.min(1, raw)));
  }, [offset]);

  useEffect(() => {
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, [update]);

  return { ref, progress };
}

/** Parallax wrapper – moves children based on scroll */
export function ParallaxSection({
  children,
  speed = 0.3,
  className = '',
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const { ref, progress } = useScrollProgress(-0.2);
  const y = (progress - 0.5) * speed * 100;

  return (
    <div ref={ref} className={className}>
      <div style={{ transform: `translateY(${y}px)`, transition: 'transform 0.1s linear' }}>
        {children}
      </div>
    </div>
  );
}

/** Counter that animates from 0 to target when in view */
export function AnimatedCounter({ target, suffix = '', prefix = '', duration = 2000 }: {
  target: number; suffix?: string; prefix?: string; duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return <span ref={ref}>{prefix}{value.toLocaleString('pt-BR')}{suffix}</span>;
}
