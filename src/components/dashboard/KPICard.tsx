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

  return (
    <Card
      className="relative overflow-hidden card-hover animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-2.5 rounded-xl", iconBg)}>
            {icon}
          </div>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full",
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
        <p className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-[13px] text-muted-foreground mt-1">{label}</p>
        {changeLabel && (
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">{changeLabel}</p>
        )}
      </CardContent>
    </Card>
  );
}
