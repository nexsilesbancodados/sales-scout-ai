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
    if (val <= 300) return { label: 'Básica', icon: Target, color: 'text-info', bg: 'bg-info/10' };
    if (val <= 800) return { label: 'Moderada', icon: Zap, color: 'text-warning', bg: 'bg-warning/10' };
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
            min={100}
            max={2000}
            step={100}
            disabled={disabled}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>100</span>
            <span>500</span>
            <span>1000</span>
            <span>1500</span>
            <span>2000</span>
          </div>

          <p className="text-xs text-muted-foreground">
            {value <= 300 && 'Busca rápida com resultados essenciais. Ideal para testes.'}
            {value > 300 && value <= 800 && 'Busca equilibrada entre velocidade e volume. Recomendado para uso diário.'}
            {value > 800 && 'Busca intensiva com MÁXIMO volume. Cobre bairros e variações. Pode demorar mais.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
