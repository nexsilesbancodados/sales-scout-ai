export function WaveDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full overflow-hidden leading-[0] h-[50px] -my-1 pointer-events-none ${className}`}>
      <svg
        className="absolute bottom-0 left-0 block h-full opacity-40 z-[2]"
        style={{ width: '200%', animation: 'waveShift 10s ease-in-out infinite' }}
        viewBox="0 0 1000 40"
        preserveAspectRatio="none"
      >
        <path
          d="M0,20 C150,35 350,0 500,20 C650,40 850,5 1000,20"
          fill="none"
          stroke="hsl(var(--primary) / 0.5)"
          strokeWidth="2"
        />
      </svg>
      <svg
        className="absolute bottom-0 left-0 block h-full opacity-30 z-[3]"
        style={{ width: '200%', animation: 'waveShift 12s ease-in-out infinite reverse' }}
        viewBox="0 0 1000 40"
        preserveAspectRatio="none"
      >
        <path
          d="M0,25 C200,10 300,35 500,22 C700,9 800,30 1000,18"
          fill="none"
          stroke="hsl(var(--primary) / 0.6)"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
