export function CosmicBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Deep space base */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, #07080E 0%, #0B0D15 30%, #0A0C14 70%, #06070C 100%)',
      }} />
      
      {/* Nebula orbs - pure CSS */}
      <div className="absolute top-[15%] left-[10%] w-[600px] h-[400px] rounded-full opacity-[0.07]" style={{
        background: 'radial-gradient(ellipse, rgba(123,47,242,1) 0%, transparent 70%)',
        animation: 'nebula-drift-1 25s ease-in-out infinite',
      }} />
      <div className="absolute top-[35%] right-[5%] w-[500px] h-[360px] rounded-full opacity-[0.05]" style={{
        background: 'radial-gradient(ellipse, rgba(233,30,140,1) 0%, transparent 70%)',
        animation: 'nebula-drift-2 30s ease-in-out infinite',
      }} />
      <div className="absolute bottom-[20%] left-[30%] w-[560px] h-[440px] rounded-full opacity-[0.04]" style={{
        background: 'radial-gradient(ellipse, rgba(0,180,216,1) 0%, transparent 70%)',
        animation: 'nebula-drift-1 35s ease-in-out infinite reverse',
      }} />
      <div className="absolute bottom-[5%] left-[20%] w-[400px] h-[300px] rounded-full opacity-[0.05]" style={{
        background: 'radial-gradient(ellipse, rgba(247,148,29,1) 0%, transparent 70%)',
        animation: 'nebula-drift-2 28s ease-in-out infinite',
      }} />

      {/* Static stars via CSS dots */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.4) 50%, transparent 100%),
          radial-gradient(1px 1px at 25% 45%, rgba(255,255,255,0.3) 50%, transparent 100%),
          radial-gradient(1.5px 1.5px at 40% 12%, rgba(255,255,255,0.5) 50%, transparent 100%),
          radial-gradient(1px 1px at 55% 68%, rgba(255,255,255,0.35) 50%, transparent 100%),
          radial-gradient(1px 1px at 70% 30%, rgba(255,255,255,0.4) 50%, transparent 100%),
          radial-gradient(1.5px 1.5px at 85% 55%, rgba(255,255,255,0.45) 50%, transparent 100%),
          radial-gradient(1px 1px at 15% 80%, rgba(255,255,255,0.3) 50%, transparent 100%),
          radial-gradient(1px 1px at 90% 15%, rgba(255,255,255,0.35) 50%, transparent 100%),
          radial-gradient(1px 1px at 50% 90%, rgba(255,255,255,0.3) 50%, transparent 100%),
          radial-gradient(1.5px 1.5px at 30% 35%, rgba(255,255,255,0.5) 50%, transparent 100%),
          radial-gradient(1px 1px at 65% 8%, rgba(255,255,255,0.3) 50%, transparent 100%),
          radial-gradient(1px 1px at 78% 72%, rgba(255,255,255,0.4) 50%, transparent 100%),
          radial-gradient(1px 1px at 5% 55%, rgba(255,255,255,0.35) 50%, transparent 100%),
          radial-gradient(1px 1px at 95% 40%, rgba(255,255,255,0.3) 50%, transparent 100%),
          radial-gradient(1.5px 1.5px at 45% 50%, rgba(255,255,255,0.4) 50%, transparent 100%),
          radial-gradient(1px 1px at 20% 95%, rgba(255,255,255,0.3) 50%, transparent 100%),
          radial-gradient(1px 1px at 60% 25%, rgba(255,255,255,0.35) 50%, transparent 100%),
          radial-gradient(1px 1px at 35% 75%, rgba(255,255,255,0.4) 50%, transparent 100%),
          radial-gradient(1px 1px at 82% 88%, rgba(255,255,255,0.3) 50%, transparent 100%),
          radial-gradient(1px 1px at 48% 5%, rgba(255,255,255,0.35) 50%, transparent 100%)
        `,
        animation: 'stars-twinkle 8s ease-in-out infinite alternate',
      }} />

      <style>{`
        @keyframes nebula-drift-1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(40px, 30px); }
        }
        @keyframes nebula-drift-2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-30px, 20px); }
        }
        @keyframes stars-twinkle {
          0% { opacity: 0.8; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
