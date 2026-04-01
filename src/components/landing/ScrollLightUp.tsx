import { useEffect, useRef } from 'react';

/**
 * Wraps landing sections. Dims them until the scroll-line tip reaches their Y position.
 * Uses the tip's actual page-Y coordinate for precise synchronization.
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

  useEffect(() => {
    const handler = (e: Event) => {
      const el = ref.current;
      if (!el || litRef.current) return;

      const { tipViewportY } = (e as CustomEvent).detail as { tipViewportY: number };
      const rect = el.getBoundingClientRect();

      // Section top relative to viewport
      const sectionTop = rect.top;
      // The line "touches" the section when the tip Y reaches the section's top
      // Full light when tip is 30% into the section
      const enterY = sectionTop;
      const fullY = sectionTop + rect.height * 0.3;

      if (tipViewportY < enterY - 100) {
        // Line hasn't reached this section yet
        el.style.opacity = '0.1';
        el.style.filter = 'brightness(0.25)';
        el.style.setProperty('--glow-opacity', '0');
        return;
      }

      if (tipViewportY >= fullY) {
        // Line has passed through — fully lit
        litRef.current = true;
        el.style.opacity = '1';
        el.style.filter = 'brightness(1)';
        el.style.setProperty('--glow-opacity', '0');
        return;
      }

      // Line is passing through this section — interpolate
      const range = fullY - (enterY - 100);
      const progress = Math.min(1, Math.max(0, (tipViewportY - (enterY - 100)) / range));
      
      el.style.opacity = `${0.1 + 0.9 * progress}`;
      el.style.filter = `brightness(${0.25 + 0.75 * progress})`;

      // Glow sweep peaks at 50% progress
      const glowIntensity = progress > 0.2 && progress < 0.9
        ? (1 - Math.abs(progress - 0.5) / 0.5) * 0.5
        : 0;
      el.style.setProperty('--glow-opacity', `${glowIntensity}`);
    };

    window.addEventListener('line-progress', handler);
    return () => window.removeEventListener('line-progress', handler);
  }, []);

  // Fallback for sections below the curve or fast scroll
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
          setTimeout(() => {
            if (!litRef.current) {
              litRef.current = true;
              el.style.transition = 'opacity 0.8s ease, filter 0.8s ease';
              el.style.opacity = '1';
              el.style.filter = 'brightness(1)';
              el.style.setProperty('--glow-opacity', '0');
            }
          }, 400);
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-lightup-section ${className}`}
      style={{ opacity: 0.1, filter: 'brightness(0.25)', transition: 'opacity 0.3s ease, filter 0.3s ease' }}
    >
      <div className="scroll-lightup-glow" />
      {children}
    </div>
  );
}
