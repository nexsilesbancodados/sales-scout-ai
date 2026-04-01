export function WaveDivider({ flip = false, className = '' }: { flip?: boolean; className?: string }) {
  return (
    <div className={`relative w-full overflow-hidden leading-[0] h-[50px] -my-1 ${flip ? 'rotate-180' : ''} ${className}`}>
      <svg
        className="wave-shape wave-light-blue absolute bottom-[10px] left-0 block h-[80px] opacity-50 z-[2]"
        style={{ width: '200%', animation: 'waveShift 10s ease-in-out infinite' }}
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0,1.7c10.2,3.2,35.2,10.2,76.5,10.1C117.9,11.7,156.3,1.3,204.7,0.3c48.3-1,76.2,11.5,108.2,11 c32,0.5,86.5-1.2,109-3.7c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.2,26.9,145.1,36.2c75.3,9.3,145.3,8.5,188.6,10.3 c43.4,1.8,89.4,19,147.3,18.4c58.7-0.6,85.3-7.7,103.6-11V100H0V1.7z"
          fill="hsl(var(--primary) / 0.4)"
        />
      </svg>
      <svg
        className="wave-shape wave-white absolute bottom-0 left-0 block h-[80px] z-[3]"
        style={{ width: '200%', animation: 'waveShift 10s ease-in-out infinite' }}
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0,1.7c10.2,3.2,35.2,10.2,76.5,10.1C117.9,11.7,156.3,1.3,204.7,0.3c48.3-1,76.2,11.5,108.2,11 c32,0.5,86.5-1.2,109-3.7c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.2,26.9,145.1,36.2c75.3,9.3,145.3,8.5,188.6,10.3 c43.4,1.8,89.4,19,147.3,18.4c58.7-0.6,85.3-7.7,103.6-11V100H0V1.7z"
          fill="hsl(var(--background))"
        />
      </svg>
    </div>
  );
}
