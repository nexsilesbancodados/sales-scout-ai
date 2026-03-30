import { useEffect, useRef } from 'react';

export function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = 0, h = 0;

    // Stars
    const STAR_COUNT = 280;
    const stars: { x: number; y: number; r: number; brightness: number; speed: number; phase: number }[] = [];

    // Nebula orbs
    const orbs: { x: number; y: number; rx: number; ry: number; color: string; phase: number; speed: number }[] = [];

    function resize() {
      w = canvas!.width = window.innerWidth;
      h = canvas!.height = window.innerHeight;
    }

    function init() {
      resize();
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.5 + 0.3,
          brightness: Math.random(),
          speed: Math.random() * 0.5 + 0.1,
          phase: Math.random() * Math.PI * 2,
        });
      }
      orbs.length = 0;
      const orbData = [
        { xp: 0.15, yp: 0.25, rx: 300, ry: 200, color: '123,47,242', speed: 0.0003 },
        { xp: 0.8, yp: 0.4, rx: 250, ry: 180, color: '233,30,140', speed: 0.0004 },
        { xp: 0.5, yp: 0.7, rx: 280, ry: 220, color: '0,180,216', speed: 0.00025 },
        { xp: 0.3, yp: 0.85, rx: 200, ry: 150, color: '247,148,29', speed: 0.00035 },
        { xp: 0.7, yp: 0.15, rx: 220, ry: 160, color: '123,47,242', speed: 0.0005 },
      ];
      for (const o of orbData) {
        orbs.push({
          x: o.xp * w, y: o.yp * h,
          rx: o.rx, ry: o.ry,
          color: o.color, phase: Math.random() * Math.PI * 2, speed: o.speed,
        });
      }
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, w, h);

      // Deep space gradient base
      const bg = ctx!.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#07080E');
      bg.addColorStop(0.3, '#0B0D15');
      bg.addColorStop(0.7, '#0A0C14');
      bg.addColorStop(1, '#06070C');
      ctx!.fillStyle = bg;
      ctx!.fillRect(0, 0, w, h);

      // Nebula orbs (soft radial gradients that drift)
      for (const orb of orbs) {
        const ox = orb.x + Math.sin(time * orb.speed + orb.phase) * 40;
        const oy = orb.y + Math.cos(time * orb.speed * 0.7 + orb.phase) * 30;
        const grad = ctx!.createRadialGradient(ox, oy, 0, ox, oy, orb.rx);
        grad.addColorStop(0, `rgba(${orb.color}, 0.08)`);
        grad.addColorStop(0.4, `rgba(${orb.color}, 0.03)`);
        grad.addColorStop(1, 'transparent');
        ctx!.fillStyle = grad;
        ctx!.fillRect(ox - orb.rx, oy - orb.ry, orb.rx * 2, orb.ry * 2);
      }

      // Grid lines (very subtle)
      ctx!.strokeStyle = 'rgba(255,255,255,0.012)';
      ctx!.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < w; x += gridSize) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, h);
        ctx!.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
        ctx!.stroke();
      }

      // Stars with twinkling
      for (const star of stars) {
        const twinkle = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(time * star.speed * 0.003 + star.phase));
        const alpha = star.brightness * twinkle;
        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
        ctx!.fill();

        // Glow for brighter stars
        if (star.r > 1) {
          ctx!.beginPath();
          ctx!.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(200, 210, 255, ${alpha * 0.08})`;
          ctx!.fill();
        }
      }

      // Shooting star (occasional)
      const shootPhase = (time * 0.0001) % 8;
      if (shootPhase < 0.15) {
        const p = shootPhase / 0.15;
        const sx = w * 0.2 + p * w * 0.5;
        const sy = h * 0.1 + p * h * 0.25;
        const grad2 = ctx!.createLinearGradient(sx, sy, sx - 60, sy - 20);
        grad2.addColorStop(0, `rgba(255,255,255,${0.8 * (1 - p)})`);
        grad2.addColorStop(1, 'transparent');
        ctx!.strokeStyle = grad2;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.moveTo(sx, sy);
        ctx!.lineTo(sx - 60, sy - 20);
        ctx!.stroke();
      }

      animId = requestAnimationFrame(draw);
    }

    init();
    animId = requestAnimationFrame(draw);

    window.addEventListener('resize', init);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
