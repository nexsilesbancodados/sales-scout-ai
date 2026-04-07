import { cn } from '@/lib/utils';

const periods = [
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
];

interface PeriodFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="flex items-center gap-0.5 bg-muted/40 rounded-xl p-1 border border-border/20">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          className={cn(
            "relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300",
            value === period.value
              ? "bg-background text-foreground shadow-sm shadow-black/5"
              : "text-muted-foreground/60 hover:text-foreground hover:bg-background/50"
          )}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
