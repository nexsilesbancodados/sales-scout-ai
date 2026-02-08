import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Building2, X, Search, Sparkles } from 'lucide-react';

interface NicheAutocompleteProps {
  value: string[];
  onChange: (niches: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxSelections?: number;
}

// Lista completa de nichos populares no Brasil
const ALL_NICHES = [
  // Alimentação
  'Restaurantes', 'Pizzarias', 'Hamburguerias', 'Lanchonetes', 'Cafeterias',
  'Padarias', 'Confeitarias', 'Bares', 'Churrascarias', 'Sushi',
  'Food Trucks', 'Açaí', 'Sorveterias', 'Pastelarias', 'Tapiocarias',
  
  // Beleza e Estética
  'Salões de Beleza', 'Barbearias', 'Clínicas de Estética', 'Spas',
  'Manicures', 'Design de Sobrancelhas', 'Micropigmentação', 'Depilação',
  'Bronzeamento', 'Extensão de Cílios',
  
  // Saúde
  'Clínicas Médicas', 'Clínicas Odontológicas', 'Psicólogos', 'Fisioterapeutas',
  'Nutricionistas', 'Dermatologistas', 'Oftalmologistas', 'Veterinárias',
  'Laboratórios', 'Farmácias', 'Clínicas de Pilates',
  
  // Fitness
  'Academias', 'Personal Trainers', 'CrossFit', 'Yoga', 'Pilates',
  'Artes Marciais', 'Natação', 'Estúdios de Dança',
  
  // Serviços
  'Escritórios de Advocacia', 'Contabilidades', 'Imobiliárias', 'Seguradoras',
  'Consórcios', 'Despachantes', 'Cartórios', 'Gráficas',
  
  // Automotivo
  'Oficinas Mecânicas', 'Lava-Rápidos', 'Borracharias', 'Auto Elétricas',
  'Concessionárias', 'Locadoras de Veículos', 'Autopeças',
  
  // Pets
  'Pet Shops', 'Banho e Tosa', 'Clínicas Veterinárias', 'Hotel para Pets',
  'Adestramento', 'Dog Walker',
  
  // Casa e Construção
  'Arquitetos', 'Construtoras', 'Marcenarias', 'Vidraçarias',
  'Eletricistas', 'Encanadores', 'Pintores', 'Jardinagem',
  'Móveis Planejados', 'Decoração',
  
  // Educação
  'Escolas', 'Cursos de Idiomas', 'Cursos Profissionalizantes', 'Faculdades',
  'Aulas Particulares', 'Reforço Escolar', 'Autoescolas',
  
  // Varejo
  'Lojas de Roupas', 'Calçados', 'Óticas', 'Joalherias',
  'Floriculturas', 'Papelarias', 'Livrarias', 'Sex Shops',
  'Lojas de Cosméticos', 'Perfumarias',
  
  // Tecnologia
  'Assistência Técnica', 'Lojas de Informática', 'Lojas de Celulares',
  'Agências de Marketing Digital', 'Desenvolvimento de Software',
  
  // Eventos e Entretenimento
  'Fotógrafos', 'Filmagem', 'DJs', 'Buffets', 'Espaços para Eventos',
  'Decoração de Festas', 'Casas de Shows', 'Cinemas',
  
  // Outros
  'Hotéis', 'Pousadas', 'Lavanderias', 'Chaveiros',
  'Estúdios de Tatuagem', 'Gráficas Rápidas', 'Coworkings',
];

export function NicheAutocomplete({
  value,
  onChange,
  placeholder = "Digite ou selecione um nicho...",
  disabled = false,
  maxSelections = 10,
}: NicheAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (!inputValue.trim()) {
      setSuggestions([]);
      return;
    }

    const lowerInput = inputValue.toLowerCase();
    const filtered = ALL_NICHES.filter(
      niche => 
        niche.toLowerCase().includes(lowerInput) &&
        !value.includes(niche)
    ).slice(0, 10);

    setSuggestions(filtered);
  }, [inputValue, value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelectNiche = (niche: string) => {
    if (value.length >= maxSelections) {
      return;
    }
    
    const newValue = [...value, niche];
    onChange(newValue);
    setInputValue('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemoveNiche = (nicheToRemove: string) => {
    onChange(value.filter(n => n !== nicheToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        handleSelectNiche(suggestions[highlightedIndex]);
      } else if (inputValue.trim() && suggestions.length > 0) {
        handleSelectNiche(suggestions[0]);
      } else if (inputValue.trim()) {
        // Allow custom input
        handleSelectNiche(inputValue.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      handleRemoveNiche(value[value.length - 1]);
    }
  };

  // Popular niches for quick selection (filtered by what's not selected)
  const popularNiches = [
    'Restaurantes', 'Salões de Beleza', 'Academias', 'Clínicas Médicas',
    'Clínicas Odontológicas', 'Pet Shops', 'Oficinas Mecânicas', 'Imobiliárias',
  ].filter(n => !value.includes(n));

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Selected Niches Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((niche) => (
            <Badge
              key={niche}
              variant="secondary"
              className="gap-1 px-2 py-1 text-xs font-medium"
            >
              <Building2 className="h-3 w-3" />
              {niche}
              <button
                type="button"
                onClick={() => handleRemoveNiche(niche)}
                className="ml-1 hover:text-destructive transition-colors"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="relative">
        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length >= maxSelections ? `Máximo de ${maxSelections} nichos` : placeholder}
          disabled={disabled || value.length >= maxSelections}
          className="pl-10 h-12 bg-background border-2"
        />
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden">
          <ScrollArea className="max-h-64">
            {/* Suggestions */}
            {suggestions.length > 0 ? (
              <div className="p-1">
                {suggestions.map((niche, index) => (
                  <button
                    key={niche}
                    type="button"
                    onClick={() => handleSelectNiche(niche)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors",
                      highlightedIndex === index ? "bg-accent" : "hover:bg-muted"
                    )}
                  >
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{niche}</span>
                  </button>
                ))}
              </div>
            ) : inputValue.trim() ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <p>Pressione Enter para usar "{inputValue}"</p>
              </div>
            ) : popularNiches.length > 0 ? (
              <div className="p-2">
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Nichos populares
                </p>
                <div className="flex flex-wrap gap-1.5 p-2">
                  {popularNiches.map((niche) => (
                    <Button
                      key={niche}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectNiche(niche)}
                      className="text-xs h-7"
                    >
                      {niche}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
