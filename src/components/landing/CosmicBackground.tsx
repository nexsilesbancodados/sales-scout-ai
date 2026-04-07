export function CosmicBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Deep space base */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, #07080E 0%, #0B0D15 30%, #0A0C14 70%, #06070C 100%)',
      }} />
      
      {/* Single subtle nebula - GPU composited */}
      <div className="absolute top-[15%] left-[10%] w-[600px] h-[400px] rounded-full opacity-[0.07] will-change-transform" style={{
        background: 'radial-gradient(ellipse, rgba(123,47,242,1) 0%, transparent 70%)',
      }} />
      <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[360px] rounded-full opacity-[0.05] will-change-transform" style={{
        background: 'radial-gradient(ellipse, rgba(0,180,216,1) 0%, transparent 70%)',
      }} />

      {/* Minimal static stars */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.4) 50%, transparent 100%),
          radial-gradient(1px 1px at 40% 12%, rgba(255,255,255,0.5) 50%, transparent 100%),
          radial-gradient(1px 1px at 70% 30%, rgba(255,255,255,0.4) 50%, transparent 100%),
          radial-gradient(1.5px 1.5px at 85% 55%, rgba(255,255,255,0.45) 50%, transparent 100%),
          radial-gradient(1px 1px at 50% 90%, rgba(255,255,255,0.3) 50%, transparent 100%),
          radial-gradient(1px 1px at 30% 65%, rgba(255,255,255,0.35) 50%, transparent 100%),
          radial-gradient(1px 1px at 78% 72%, rgba(255,255,255,0.4) 50%, transparent 100%),
          radial-gradient(1px 1px at 20% 95%, rgba(255,255,255,0.3) 50%, transparent 100%)
        `,
      }} />
    </div>
  );
}
