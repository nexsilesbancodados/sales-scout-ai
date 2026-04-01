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
      className="relative overflow-hidden group hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardContent className="relative p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-105", iconBg)}>
            {icon}
          </div>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full",
              isPositive
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}>
              {isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>

        <div className="space-y-0.5">
          <p className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums">{formattedValue}</p>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
        </div>

        {changeLabel && (
          <p className="text-[10px] text-muted-foreground/50 mt-2 font-medium">{changeLabel}</p>
        )}
      </CardContent>
    </Card>
  );
}
