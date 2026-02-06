import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Zap, Rocket } from 'lucide-react';

interface LeadQuantitySliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function LeadQuantitySlider({ value, onChange, disabled }: LeadQuantitySliderProps) {
  const getIntensityLevel = (val: number) => {
    if (val <= 200) return { label: 'Básica', icon: Target, color: 'text-info', bg: 'bg-info/10' };
    if (val <= 500) return { label: 'Moderada', icon: Zap, color: 'text-warning', bg: 'bg-warning/10' };
    return { label: 'Intensiva', icon: Rocket, color: 'text-destructive', bg: 'bg-destructive/10' };
  };

  const intensity = getIntensityLevel(value);
  const IntensityIcon = intensity.icon;

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Quantidade de Leads</Label>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`${intensity.bg} ${intensity.color} border-0`}>
                <IntensityIcon className="h-3 w-3 mr-1" />
                {intensity.label}
              </Badge>
              <span className="text-2xl font-bold tabular-nums">{value}</span>
            </div>
          </div>
          
          <Slider
            value={[value]}
            onValueChange={([val]) => onChange(val)}
            min={50}
            max={1000}
            step={50}
            disabled={disabled}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>50</span>
            <span>300</span>
            <span>500</span>
            <span>750</span>
            <span>1000</span>
          </div>

          <p className="text-xs text-muted-foreground">
            {value <= 200 && 'Busca rápida com resultados essenciais. Ideal para testes.'}
            {value > 200 && value <= 500 && 'Busca equilibrada entre velocidade e volume. Recomendado para uso diário.'}
            {value > 500 && 'Busca intensiva com máximo volume. Pode demorar mais.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
