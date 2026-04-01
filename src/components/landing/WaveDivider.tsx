export function WaveDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full h-8 -my-px overflow-hidden bg-transparent pointer-events-none ${className}`}>
      <svg className="absolute inset-0 w-full h-full block bg-transparent" viewBox="0 0 1000 60" preserveAspectRatio="none">
        <path d="M0,30 C150,50 350,10 500,30 C650,50 850,10 1000,30" fill="transparent" stroke="hsl(var(--primary)/.45)" strokeWidth="2" vectorEffect="non-scaling-stroke" shapeRendering="geometricPrecision" />
      </svg>
    </div>
  );
}
