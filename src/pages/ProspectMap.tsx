import { useState, useCallback, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { Search, MapPin, Phone, Globe, Mail, Save, Loader2, X, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { geocodeLocation, reverseGeocode } from '@/lib/nominatim';
import { searchBusinesses, CATEGORIES, type OverpassResult } from '@/lib/overpass';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function FlyToLocation({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 1.5 });
  }, [lat, lng, zoom, map]);
  return null;
}

function ReverseGeocodeClick({ onResult }: { onResult: (lat: number, lng: number, address: string) => void }) {
  const debounceRef = useRef<NodeJS.Timeout>();
  useMapEvents({
    click(e) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const result = await reverseGeocode(e.latlng.lat, e.latlng.lng);
        if (result) {
          onResult(e.latlng.lat, e.latlng.lng, result.display_name);
        }
      }, 1500);
    },
  });
  return null;
}

export default function ProspectMapPage() {
  const { user } = useAuth();
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('restaurantes');
  const [results, setResults] = useState<OverpassResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number; zoom: number }>({ lat: -15.78, lng: -47.93, zoom: 4 });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [clickPopup, setClickPopup] = useState<{ lat: number; lng: number; address: string } | null>(null);

  const handleSearch = useCallback(async () => {
    if (!location.trim()) {
      toast.error('Digite uma localização');
      return;
    }
    setLoading(true);
    setResults([]);
    setSavedIds(new Set());
    try {
      const geo = await geocodeLocation(location);
      if (!geo) {
        toast.error('Localização não encontrada');
        return;
      }
      const lat = parseFloat(geo.lat);
      const lng = parseFloat(geo.lon);
      setMapCenter({ lat, lng, zoom: 14 });

      const businesses = await searchBusinesses(lat, lng, category);
      setResults(businesses);
      if (businesses.length === 0) {
        toast.info('Nenhum resultado encontrado nesta área');
      } else {
        toast.success(`${businesses.length} resultados encontrados`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro na busca');
    } finally {
      setLoading(false);
    }
  }, [location, category]);

  const handleSaveLead = useCallback(async (result: OverpassResult, index: number) => {
    if (!user) return;
    setSavingIds(prev => new Set(prev).add(index));
    try {
      const { error } = await supabase.from('leads').insert({
        user_id: user.id,
        business_name: result.name,
        phone: result.phone || 'Não informado',
        address: result.address || undefined,
        website: result.website || undefined,
        email: result.email || undefined,
        niche: CATEGORIES.find(c => c.value === result.category)?.label || result.category,
        source: 'osm_map',
        lat: result.lat,
        lng: result.lng,
        stage: 'Contato',
      } as any);

      if (error) throw error;
      setSavedIds(prev => new Set(prev).add(index));
      toast.success(`${result.name} salvo como lead!`);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar lead');
    } finally {
      setSavingIds(prev => {
        const n = new Set(prev);
        n.delete(index);
        return n;
      });
    }
  }, [user]);

  const handleReverseGeocode = useCallback((lat: number, lng: number, address: string) => {
    setClickPopup({ lat, lng, address });
  }, []);

  const handleSearchHere = useCallback(async () => {
    if (!clickPopup) return;
    setLoading(true);
    setResults([]);
    setSavedIds(new Set());
    try {
      const businesses = await searchBusinesses(clickPopup.lat, clickPopup.lng, category);
      setResults(businesses);
      setClickPopup(null);
      if (businesses.length === 0) {
        toast.info('Nenhum resultado encontrado');
      } else {
        toast.success(`${businesses.length} resultados encontrados`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro na busca');
    } finally {
      setLoading(false);
    }
  }, [clickPopup, category]);

  return (
    <DashboardLayout title="Mapa de Prospecção" description="Encontre empresas no mapa usando OpenStreetMap">
      <div className="flex flex-col h-[calc(100vh-8rem)] gap-4 animate-fade-in">
        {/* Search bar */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Digite a cidade ou bairro..."
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="h-10"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-[200px] h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} disabled={loading} className="h-10 gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Map + Sidebar */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Sidebar results */}
          <AnimatePresence>
            {sidebarOpen && results.length > 0 && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 340, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden lg:block overflow-hidden"
              >
                <Card className="h-full border-border/50 bg-card/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between p-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">{results.length} resultados</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSidebarOpen(false)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  <ScrollArea className="h-[calc(100%-3rem)]">
                    <div className="p-2 space-y-2">
                      {results.map((r, i) => (
                        <Card key={i} className="border-border/30 hover:border-primary/30 transition-colors">
                          <CardContent className="p-3 space-y-2">
                            <p className="text-sm font-semibold truncate">{r.name}</p>
                            {r.address && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{r.address}</span>
                              </p>
                            )}
                            {r.phone && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3 shrink-0" />
                                {r.phone}
                              </p>
                            )}
                            <div className="flex gap-1.5">
                              <Badge variant="secondary" className="text-[10px]">
                                {CATEGORIES.find(c => c.value === r.category)?.label}
                              </Badge>
                              {r.website && <Badge variant="outline" className="text-[10px]"><Globe className="h-2.5 w-2.5 mr-0.5" />Site</Badge>}
                            </div>
                            <Button
                              size="sm"
                              variant={savedIds.has(i) ? 'secondary' : 'default'}
                              className="w-full h-7 text-xs gap-1"
                              disabled={savingIds.has(i) || savedIds.has(i)}
                              onClick={() => handleSaveLead(r, i)}
                            >
                              {savingIds.has(i) ? <Loader2 className="h-3 w-3 animate-spin" /> :
                               savedIds.has(i) ? '✓ Salvo' : <><Save className="h-3 w-3" />Salvar Lead</>}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sidebar toggle if closed */}
          {!sidebarOpen && results.length > 0 && (
            <Button
              variant="outline"
              size="icon"
              className="hidden lg:flex h-10 w-10 self-start shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {/* Map */}
          <Card className="flex-1 overflow-hidden border-border/50 min-h-[400px]">
            <div className="h-full w-full relative" style={{ minHeight: '400px' }}>
              {loading && (
                <div className="absolute inset-0 z-[1000] bg-background/50 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Buscando empresas...</p>
                  </div>
                </div>
              )}
              <MapContainer
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={mapCenter.zoom}
                className="h-full w-full z-0"
                style={{ background: 'hsl(var(--background))' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FlyToLocation lat={mapCenter.lat} lng={mapCenter.lng} zoom={mapCenter.zoom} />
                <ReverseGeocodeClick onResult={handleReverseGeocode} />

                <MarkerClusterGroup chunkedLoading>
                  {results.map((r, i) => (
                    <Marker key={i} position={[r.lat, r.lng]}>
                      <Popup maxWidth={280}>
                        <div className="space-y-2 min-w-[200px]">
                          <p className="font-bold text-sm">{r.name}</p>
                          {r.address && <p className="text-xs flex items-center gap-1"><MapPin className="h-3 w-3" />{r.address}</p>}
                          {r.phone && <p className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" />{r.phone}</p>}
                          {r.website && <p className="text-xs flex items-center gap-1"><Globe className="h-3 w-3" /><a href={r.website} target="_blank" rel="noopener noreferrer" className="text-primary underline truncate">{r.website}</a></p>}
                          {r.email && <p className="text-xs flex items-center gap-1"><Mail className="h-3 w-3" />{r.email}</p>}
                          {r.openingHours && <p className="text-xs flex items-center gap-1"><Clock className="h-3 w-3" />{r.openingHours}</p>}
                          <button
                            onClick={() => handleSaveLead(r, i)}
                            disabled={savingIds.has(i) || savedIds.has(i)}
                            className="w-full mt-1 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                          >
                            {savingIds.has(i) ? 'Salvando...' : savedIds.has(i) ? '✓ Salvo' : '💾 Salvar como Lead'}
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>

                {clickPopup && (
                  <Popup position={[clickPopup.lat, clickPopup.lng]} eventHandlers={{ remove: () => setClickPopup(null) }}>
                    <div className="space-y-2 min-w-[200px]">
                      <p className="text-xs text-muted-foreground">{clickPopup.address}</p>
                      <button
                        onClick={handleSearchHere}
                        className="w-full px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        🔍 Buscar empresas aqui
                      </button>
                    </div>
                  </Popup>
                )}
              </MapContainer>
            </div>
          </Card>
        </div>

        {/* Mobile results */}
        {results.length > 0 && (
          <div className="lg:hidden">
            <ScrollArea className="h-48">
              <div className="flex gap-2 p-1">
                {results.map((r, i) => (
                  <Card key={i} className="min-w-[220px] border-border/30">
                    <CardContent className="p-3 space-y-1.5">
                      <p className="text-xs font-semibold truncate">{r.name}</p>
                      {r.phone && <p className="text-[10px] text-muted-foreground">{r.phone}</p>}
                      <Button
                        size="sm"
                        variant={savedIds.has(i) ? 'secondary' : 'default'}
                        className="w-full h-6 text-[10px]"
                        disabled={savingIds.has(i) || savedIds.has(i)}
                        onClick={() => handleSaveLead(r, i)}
                      >
                        {savedIds.has(i) ? '✓' : 'Salvar'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
