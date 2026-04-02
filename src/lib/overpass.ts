// Overpass API for querying OpenStreetMap data
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export interface OverpassElement {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export interface OverpassResult {
  name: string;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  website?: string;
  email?: string;
  openingHours?: string;
  instagram?: string;
  category: string;
}

const CATEGORY_MAP: Record<string, string> = {
  restaurantes: '["amenity"="restaurant"]',
  clinicas: '["amenity"~"clinic|doctors"]',
  saloes: '["shop"~"hairdresser|beauty"]',
  academias: '["leisure"="fitness_centre"]',
  escritorios: '["office"]',
  lojas: '["shop"]',
  farmacias: '["amenity"="pharmacy"]',
  oficinas: '["shop"="car_repair"]',
  petshops: '["shop"="pet"]',
  bares: '["amenity"~"bar|pub"]',
};

export const CATEGORIES = [
  { value: 'restaurantes', label: 'Restaurantes' },
  { value: 'clinicas', label: 'Clínicas' },
  { value: 'saloes', label: 'Salões de Beleza' },
  { value: 'academias', label: 'Academias' },
  { value: 'escritorios', label: 'Escritórios' },
  { value: 'lojas', label: 'Lojas' },
  { value: 'farmacias', label: 'Farmácias' },
  { value: 'oficinas', label: 'Oficinas Mecânicas' },
  { value: 'petshops', label: 'Pet Shops' },
  { value: 'bares', label: 'Bares' },
];

export async function searchBusinesses(
  lat: number,
  lon: number,
  category: string,
  radiusMeters = 5000
): Promise<OverpassResult[]> {
  const filter = CATEGORY_MAP[category];
  if (!filter) throw new Error(`Categoria desconhecida: ${category}`);

  const query = `
    [out:json][timeout:25];
    (
      node${filter}(around:${radiusMeters},${lat},${lon});
      way${filter}(around:${radiusMeters},${lat},${lon});
    );
    out center body;
  `;

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!res.ok) throw new Error('Erro ao buscar dados do Overpass API');
  const data = await res.json();

  return (data.elements as OverpassElement[])
    .filter(el => el.tags?.name)
    .map(el => {
      const elLat = el.lat ?? el.center?.lat ?? 0;
      const elLng = el.lon ?? el.center?.lon ?? 0;
      const tags = el.tags!;

      return {
        name: tags.name!,
        lat: elLat,
        lng: elLng,
        address: [tags['addr:street'], tags['addr:housenumber'], tags['addr:city']]
          .filter(Boolean)
          .join(', ') || undefined,
        phone: tags.phone || tags['contact:phone'] || undefined,
        website: tags.website || tags['contact:website'] || undefined,
        email: tags.email || tags['contact:email'] || undefined,
        openingHours: tags.opening_hours || undefined,
        instagram: tags.instagram || tags['contact:instagram'] || undefined,
        category,
      };
    });
}
