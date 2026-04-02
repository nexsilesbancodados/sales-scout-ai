// Nominatim geocoding API - free, 1req/sec rate limit
const BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'NexaProspect/1.0';

export interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: Record<string, string>;
}

let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 1100) {
    await new Promise(r => setTimeout(r, 1100 - elapsed));
  }
  lastRequestTime = Date.now();
  return fetch(url, { headers: { 'User-Agent': USER_AGENT } });
}

export async function geocodeLocation(query: string): Promise<NominatimResult | null> {
  const url = `${BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=1`;
  const res = await rateLimitedFetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data[0] || null;
}

export async function reverseGeocode(lat: number, lon: number): Promise<NominatimResult | null> {
  const url = `${BASE_URL}/reverse?format=json&lat=${lat}&lon=${lon}`;
  const res = await rateLimitedFetch(url);
  if (!res.ok) return null;
  return res.json();
}
