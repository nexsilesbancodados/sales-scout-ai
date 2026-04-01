import { useEffect, useRef } from 'react';

/**
 * Wraps landing sections. Dims them until the scroll-line tip reaches their Y position.
 * Listens to the line-progress event which broadcasts tipViewportY (the tip's Y in viewport coords).
 */
export function ScrollLightUpSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const litRef = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const el = ref.current;
      if (!el) return;
      if (litRef.current) return;

      const { tipViewportY, pct } = (e as CustomEvent).detail;
      const rect = el.getBoundingClientRect();

      // When the tip's viewport Y reaches the top of this section (with a 150px lead), start lighting
      const startLight = rect.top - 150;
      const endLight = rect.top + Math.min(rect.height * 0.35, 250);

      if (tipViewportY < startLight) {
        // Not reached yet — stay dark
        if (!initializedRef.current) {
          initializedRef.current = true;
          el.style.opacity = '0.08';
          el.style.filter = 'brightness(0.2)';
        }
        return;
      }

      if (tipViewportY >= endLight || pct >= 0.99) {
        // Fully lit
        litRef.current = true;
        el.style.opacity = '1';
        el.style.filter = 'brightness(1)';
        el.style.setProperty('--glow-opacity', '0');
        return;
      }

      // Interpolate
      const range = endLight - startLight;
      const progress = (tipViewportY - startLight) / range;
      const clamped = Math.max(0, Math.min(1, progress));

      // Ease-out curve for smoother feel
      const eased = 1 - Math.pow(1 - clamped, 2.5);

      el.style.opacity = `${0.08 + 0.92 * eased}`;
      el.style.filter = `brightness(${0.2 + 0.8 * eased})`;

      // Glow sweep peaks in the middle
      const glowIntensity = clamped > 0.15 && clamped < 0.85
        ? (1 - Math.abs(clamped - 0.5) / 0.5) * 0.6
        : 0;
      el.style.setProperty('--glow-opacity', `${glowIntensity}`);
    };

    window.addEventListener('line-progress', handler);
    return () => window.removeEventListener('line-progress', handler);
  }, []);

  // Fallback: sections below the curve or fast scroll
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
          setTimeout(() => {
            if (!litRef.current) {
              litRef.current = true;
              el.style.transition = 'opacity 1s ease, filter 1s ease';
              el.style.opacity = '1';
              el.style.filter = 'brightness(1)';
              el.style.setProperty('--glow-opacity', '0');
            }
          }, 300);
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-lightup-section ${className}`}
      style={{
        opacity: 0.08,
        filter: 'brightness(0.2)',
        transition: 'opacity 0.25s ease-out, filter 0.25s ease-out',
      }}
    >
      <div className="scroll-lightup-glow" />
      {children}
    </div>
  );
}
