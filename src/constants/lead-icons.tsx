import { Flame, ThermometerSun, Snowflake } from 'lucide-react';
import { LeadStage, LeadTemperature } from '@/types/database';

// Centralized temperature icons - use across all components
export const temperatureIcons: Record<LeadTemperature, React.ReactNode> = {
  'quente': <Flame className="h-4 w-4 text-temp-hot" />,
  'morno': <ThermometerSun className="h-4 w-4 text-temp-warm" />,
  'frio': <Snowflake className="h-4 w-4 text-temp-cold" />,
};

export const temperatureIconsSmall: Record<LeadTemperature, React.ReactNode> = {
  'quente': <Flame className="h-3 w-3 text-temp-hot" />,
  'morno': <ThermometerSun className="h-3 w-3 text-temp-warm" />,
  'frio': <Snowflake className="h-3 w-3 text-temp-cold" />,
};

// Stage colors for badges and borders
export const stageColors: Record<LeadStage, string> = {
  'Contato': 'bg-stage-contact',
  'Qualificado': 'bg-stage-qualified',
  'Proposta': 'bg-stage-proposal',
  'Negociação': 'bg-stage-negotiation',
  'Ganho': 'bg-stage-won',
  'Perdido': 'bg-stage-lost',
};

export const stageBorderColors: Record<LeadStage, string> = {
  'Contato': 'border-t-stage-contact',
  'Qualificado': 'border-t-stage-qualified',
  'Proposta': 'border-t-stage-proposal',
  'Negociação': 'border-t-stage-negotiation',
  'Ganho': 'border-t-stage-won',
  'Perdido': 'border-t-stage-lost',
};

// Temperature labels in Portuguese
export const temperatureLabels: Record<LeadTemperature, string> = {
  'quente': 'Quente',
  'morno': 'Morno',
  'frio': 'Frio',
};

// Stage labels (already in Portuguese)
export const stageLabels: Record<LeadStage, string> = {
  'Contato': 'Contato',
  'Qualificado': 'Qualificado',
  'Proposta': 'Proposta',
  'Negociação': 'Negociação',
  'Ganho': 'Ganho',
  'Perdido': 'Perdido',
};

// All stages for selects/filters
export const allStages: LeadStage[] = ['Contato', 'Qualificado', 'Proposta', 'Negociação', 'Ganho', 'Perdido'];

// All temperatures for selects/filters
export const allTemperatures: LeadTemperature[] = ['quente', 'morno', 'frio'];
