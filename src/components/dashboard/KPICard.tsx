import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  iconBg: string;
  delay?: number;
}

export function KPICard({ icon, label, value, change, changeLabel, iconBg, delay = 0 }: KPICardProps) {
  const isPositive = (change || 0) >= 0;
  const formattedValue = typeof value === 'number' ? value.toLocaleString('pt-BR') : value;

  return (
    <Card
      className="group border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "p-2 rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
            iconBg
          )}>
            {icon}
          </div>
          {change !== undefined && (
            <span className={cn(
              "flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md transition-colors",
              isPositive ? "text-success bg-success/8" : "text-destructive bg-destructive/8"
            )}>
              {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold tracking-tight tabular-nums transition-colors group-hover:text-primary">{formattedValue}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        {changeLabel && (
          <p className="text-[10px] text-muted-foreground/50 mt-2 font-medium">{changeLabel}</p>
        )}
      </CardContent>
    </Card>
  );
}
