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
    if (val <= 500) return { label: 'Básica', icon: Target, color: 'text-info', bg: 'bg-info/10' };
    if (val <= 2000) return { label: 'Moderada', icon: Zap, color: 'text-warning', bg: 'bg-warning/10' };
    return { label: 'MÁXIMA', icon: Rocket, color: 'text-destructive', bg: 'bg-destructive/10' };
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
            max={5000}
            step={100}
            disabled={disabled}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>100</span>
            <span>1000</span>
            <span>2000</span>
            <span>3000</span>
            <span>5000</span>
          </div>

          <p className="text-xs text-muted-foreground">
            {value <= 500 && 'Busca rápida com resultados essenciais. Ideal para testes.'}
            {value > 500 && value <= 2000 && 'Busca abrangente cobrindo múltiplos bairros e variações.'}
            {value > 2000 && '🚀 Busca MÁXIMA! Cobre TODOS os bairros, variações e subnichos. Captura TUDO que existir.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
