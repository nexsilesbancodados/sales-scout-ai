import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  icon?: LucideIcon;
  className?: string;
  // Legacy props support
  label?: string;
  iconBg?: string;
  changeLabel?: string;
  delay?: number;
}

export function KPICard({ title, label, value, change, icon: Icon, className, iconBg, changeLabel, delay }: KPICardProps) {
  const isPositive = (change ?? 0) >= 0;
  const displayTitle = title || label || '';

  return (
    <div className={cn(
      "rounded-xl border border-white/[0.06] bg-card p-5 flex flex-col gap-3 hover:border-white/10 transition-colors",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
          <span className="text-xs text-muted-foreground font-medium">{displayTitle}</span>
        </div>
        <button className="opacity-40 hover:opacity-70 transition-opacity">
          <span className="text-muted-foreground">···</span>
        </button>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
            isPositive
              ? "bg-success/15 text-success"
              : "bg-destructive/15 text-destructive"
          )}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? "+" : ""}{change}%
          </div>
        )}
      </div>
      {changeLabel && (
        <p className="text-[11px] text-muted-foreground/60">{changeLabel}</p>
      )}
    </div>
  );
}
