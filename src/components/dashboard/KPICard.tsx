import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  iconBg: string;
  delay?: number;
}

const gradientMap: Record<string, string> = {
  'bg-primary/8': 'from-blue-100/80 via-blue-50/40 to-transparent dark:from-blue-950/30 dark:via-blue-950/10 dark:to-transparent',
  'bg-info/8': 'from-amber-100/80 via-amber-50/40 to-transparent dark:from-amber-950/30 dark:via-amber-950/10 dark:to-transparent',
  'bg-success/8': 'from-emerald-100/80 via-emerald-50/40 to-transparent dark:from-emerald-950/30 dark:via-emerald-950/10 dark:to-transparent',
  'bg-warning/8': 'from-violet-100/80 via-violet-50/40 to-transparent dark:from-violet-950/30 dark:via-violet-950/10 dark:to-transparent',
};

function useCountUp(target: number, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0);
  const ref = useRef<number>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) ref.current = requestAnimationFrame(step);
      };
      ref.current = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timeout);
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [target, duration, delay]);

  return count;
}

export function KPICard({ icon, label, value, change, changeLabel, iconBg, delay = 0 }: KPICardProps) {
  const isPositive = (change || 0) >= 0;
  const isNumeric = typeof value === 'number';
  const animatedValue = useCountUp(isNumeric ? value : 0, 1200, delay + 200);
  const formattedValue = isNumeric ? animatedValue.toLocaleString('pt-BR') : value;

  const gradient = gradientMap[iconBg] || 'from-primary/10 via-primary/5 to-transparent dark:from-primary/10 dark:via-primary/5 dark:to-transparent';

  return (
    <Card
      className="group relative overflow-hidden border-border/20 hover:border-primary/20 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Colored gradient background */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-100 pointer-events-none", gradient)} />

      {/* Shimmer on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none" />

      <CardContent className="p-5 sm:p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md",
            iconBg
          )}>
            {icon}
          </div>
          {change !== undefined && (
            <span className={cn(
              "flex items-center gap-0.5 text-[11px] font-semibold px-2 py-1 rounded-lg transition-all duration-300 group-hover:scale-105",
              isPositive ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
            )}>
              {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold tracking-tight tabular-nums transition-colors duration-300 group-hover:text-primary">
          {formattedValue}
        </p>
        <p className="text-xs text-muted-foreground mt-1 font-medium">{label}</p>
        {changeLabel && (
          <p className="text-[10px] text-muted-foreground/60 mt-2 font-medium">{changeLabel}</p>
        )}
      </CardContent>
    </Card>
  );
}
