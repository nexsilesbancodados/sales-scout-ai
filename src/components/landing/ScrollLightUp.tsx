import { useEffect, useRef } from 'react';

/**
 * Wraps landing sections and dims them until the scroll-line reaches them.
 * Each section "lights up" with a glow sweep as the line passes through.
 */
export function ScrollLightUpSection({
  children,
  threshold = 0,
  className = '',
}: {
  children: React.ReactNode;
  /** 0-1 — the line progress at which this section should be fully lit */
  threshold: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const { pct } = (e as CustomEvent).detail;
      const el = ref.current;
      if (!el) return;

      // Section lights up from threshold-0.12 to threshold
      const fadeStart = Math.max(0, threshold - 0.12);
      const localPct = Math.min(1, Math.max(0, (pct - fadeStart) / (threshold - fadeStart)));

      el.style.opacity = `${0.15 + 0.85 * localPct}`;
      el.style.filter = `brightness(${0.3 + 0.7 * localPct})`;

      // Glow sweep when almost reached
      if (localPct > 0.3 && localPct < 1) {
        el.style.setProperty('--glow-opacity', `${(1 - Math.abs(localPct - 0.65) / 0.35) * 0.4}`);
      } else {
        el.style.setProperty('--glow-opacity', '0');
      }
    };

    window.addEventListener('line-progress', handler);
    return () => window.removeEventListener('line-progress', handler);
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`scroll-lightup-section ${className}`}
      style={{ opacity: 0.15, filter: 'brightness(0.3)', transition: 'opacity 0.4s ease, filter 0.4s ease' }}
    >
      {/* Sweep glow overlay */}
      <div className="scroll-lightup-glow" />
      {children}
    </div>
  );
}
