import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useBrazilLocations } from '@/hooks/use-brazil-locations';
import { MapPin, Building2, Hash, X, Loader2, Search } from 'lucide-react';

interface LocationAutocompleteProps {
  value: string[];
  onChange: (locations: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxSelections?: number;
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Digite cidade, estado ou CEP...",
  disabled = false,
  maxSelections = 10,
}: LocationAutocompleteProps) {
  const { getSuggestions, popularCities, loading, isCep, formatCep } = useBrazilLocations();
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Search for suggestions
  const searchSuggestions = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await getSuggestions(term);
      // Filter out already selected items
      const filtered = results.filter(
        r => !value.includes(r.value)
      );
      setSuggestions(filtered);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, [getSuggestions, value]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (inputValue.trim()) {
      debounceRef.current = setTimeout(() => {
        searchSuggestions(inputValue);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, searchSuggestions]);

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
    const val = e.target.value;
    
    // Auto-format CEP
    if (isCep(val)) {
      setInputValue(formatCep(val));
    } else {
      setInputValue(val);
    }
    
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelectSuggestion = (suggestion: any) => {
    if (value.length >= maxSelections) {
      return;
    }
    
    const newValue = [...value, suggestion.value];
    onChange(newValue);
    setInputValue('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemoveLocation = (locationToRemove: string) => {
    onChange(value.filter(l => l !== locationToRemove));
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
        handleSelectSuggestion(suggestions[highlightedIndex]);
      } else if (inputValue.trim() && suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      } else if (inputValue.trim()) {
        // Allow custom input
        const newValue = [...value, inputValue.trim()];
        onChange(newValue);
        setInputValue('');
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag when backspace on empty input
      handleRemoveLocation(value[value.length - 1]);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'state':
        return <MapPin className="h-4 w-4 text-primary" />;
      case 'city':
        return <Building2 className="h-4 w-4 text-success" />;
      case 'cep':
        return <Hash className="h-4 w-4 text-warning" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const filteredPopularCities = popularCities.filter(
    city => !value.includes(city.value)
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Selected Locations Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((location) => (
            <Badge
              key={location}
              variant="secondary"
              className="gap-1 px-2 py-1 text-xs font-medium"
            >
              <MapPin className="h-3 w-3" />
              {location}
              <button
                type="button"
                onClick={() => handleRemoveLocation(location)}
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length >= maxSelections ? `Máximo de ${maxSelections} locais` : placeholder}
          disabled={disabled || value.length >= maxSelections}
          className="pl-10 h-12 bg-background border-2"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden">
          <ScrollArea className="max-h-64">
            {/* Suggestions */}
            {suggestions.length > 0 ? (
              <div className="p-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.value}`}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors",
                      highlightedIndex === index ? "bg-accent" : "hover:bg-muted"
                    )}
                  >
                    {getTypeIcon(suggestion.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{suggestion.label}</p>
                      <p className="text-xs text-muted-foreground capitalize">{suggestion.type}</p>
                    </div>
                    {suggestion.state_code && suggestion.type !== 'state' && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        {suggestion.state_code}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            ) : inputValue.trim() && !isSearching ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <p>Nenhum resultado encontrado</p>
                <p className="text-xs mt-1">Pressione Enter para usar "{inputValue}"</p>
              </div>
            ) : !inputValue.trim() && filteredPopularCities.length > 0 ? (
              <div className="p-2">
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                  Cidades populares
                </p>
                <div className="flex flex-wrap gap-1.5 p-2">
                  {filteredPopularCities.slice(0, 8).map((city) => (
                    <Button
                      key={city.value}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectSuggestion(city)}
                      className="text-xs h-7"
                    >
                      {city.label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : loading ? (
              <div className="p-4 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : null}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
