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

function useCountUp(target: number, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0);
  const ref = useRef<number>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
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

  return (
    <Card
      className="group relative overflow-hidden border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/8 hover:-translate-y-1 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Shimmer on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-primary/[0.04] to-transparent pointer-events-none" />

      <CardContent className="p-4 sm:p-5 relative">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "p-2 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md",
            iconBg
          )}>
            {icon}
          </div>
          {change !== undefined && (
            <span className={cn(
              "flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md transition-all duration-300 group-hover:scale-105",
              isPositive ? "text-success bg-success/8" : "text-destructive bg-destructive/8"
            )}>
              {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold tracking-tight tabular-nums transition-colors duration-300 group-hover:text-primary">
          {formattedValue}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        {changeLabel && (
          <p className="text-[10px] text-muted-foreground/50 mt-2 font-medium">{changeLabel}</p>
        )}
      </CardContent>
    </Card>
  );
}
