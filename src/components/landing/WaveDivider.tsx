export function WaveDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full h-px -my-px overflow-visible pointer-events-none ${className}`}>
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="absolute inset-x-[10%] top-1/2 -translate-y-1/2 h-[1px] blur-[1px] bg-gradient-to-r from-transparent via-[hsl(var(--primary)/.3)] to-transparent" />
      <div className="absolute inset-x-[20%] top-1/2 -translate-y-1/2 h-4 blur-xl bg-gradient-to-r from-transparent via-[hsl(var(--primary)/.12)] to-transparent" />
    </div>
  );
}
