import { Place } from './mockPlaces';

// The raw shape Foursquare returns (only the fields we use)
interface FoursquareResult {
  fsq_place_id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number; // meters from the search point
  categories: { name: string }[];
  location: { formatted_address?: string; address?: string };
  tel?: string;
  website?: string;
}

// Map a Foursquare category name onto one of our app's place types
const mapCategory = (categories: { name: string }[]): string[] => {
  const names = categories.map(c => c.name.toLowerCase()).join(' ');
  const types: string[] = [];
  if (names.includes('librar')) types.push('library');
  if (names.includes('coworking') || names.includes('co-working')) types.push('coworking');
  if (names.includes('café') || names.includes('cafe') || names.includes('coffee')) types.push('cafe');
  if (names.includes('restaurant') || names.includes('diner') || names.includes('eatery')) types.push('restaurant');
  return types.length > 0 ? types : ['cafe'];
};

// Rough travel-time estimates from straight-line distance
const estimateTravelTime = (meters: number) => ({
  walking_min: Math.max(1, Math.round(meters / 80)),   // ~5 km/h
  driving_min: Math.max(1, Math.round(meters / 400)),  // ~24 km/h city driving
});

// Convert one Foursquare result into our Place shape.
// Real places have NO amenity/rating data yet — that comes from user reviews later.
const toPlace = (r: FoursquareResult): Place => ({
  id: r.fsq_place_id,
  name: r.name,
  coords: { lat: r.latitude, lng: r.longitude },
  rating: 0,            // unrated until reviews exist
  price_level: 0,       // unknown
  types: mapCategory(r.categories),
  address: r.location.formatted_address || r.location.address || '',
  hours: { open: 0, close: 24 }, // unknown; treated as always-open for now
  amenities: { wifi: 0, outlets: 0, noise: 0, seating: 0 }, // no data yet
  badges: [],
  distance_meters: r.distance,
  travel_time: estimateTravelTime(r.distance),
  isDiscovered: true,   // flag: came from Foursquare, not curated mock data
});

// ---------- Quota protection ----------
// Every API call costs quota, so we cache results and throttle bursts.

const CACHE_TTL_MS = 5 * 60 * 1000; // reuse results for 5 minutes
const MIN_INTERVAL_MS = 2000;       // at most one live call every 2s
const MAX_LIMIT = 50;
const MAX_RADIUS_M = 40000;         // ~25 miles — covers a ~30 min drive

const cache = new Map<string, { at: number; places: Place[] }>();
let lastCallAt = 0;

// Round coords to ~100m so tiny GPS jitter still hits the same cache entry
const cacheKey = (lat: number, lng: number) =>
  `${lat.toFixed(3)},${lng.toFixed(3)}`;

/**
 * Fetch real work-friendly places near a coordinate via our proxy.
 *
 * @param searchTerm  optional name to search for (e.g. "Tamper Room").
 *                    When omitted, we search the generic work-friendly categories.
 * @param radiusM     optional search radius in metres (clamped to MAX_RADIUS_M).
 *
 * Results are cached and calls are throttled to protect API quota.
 */
export const fetchNearbyPlaces = async (
  lat: number,
  lng: number,
  searchTerm?: string,
  radiusM: number = MAX_RADIUS_M
): Promise<Place[]> => {
  // Validate inputs before spending a request
  if (!Number.isFinite(lat) || !Number.isFinite(lng) ||
      lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error('Invalid coordinates');
  }

  const term = searchTerm?.trim() ?? '';
  const radius = Math.min(Math.max(500, Math.round(radiusM)), MAX_RADIUS_M);

  const key = `${cacheKey(lat, lng)}|${term.toLowerCase()}|${radius}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return hit.places; // served from cache — no API call, no quota used
  }

  // Throttle: refuse to hammer the API on rapid repeat calls
  const sinceLast = Date.now() - lastCallAt;
  if (sinceLast < MIN_INTERVAL_MS) {
    if (hit) return hit.places;            // stale cache beats a burst
    throw new Error('Please wait a moment before searching again.');
  }
  lastCallAt = Date.now();

  const params = new URLSearchParams({
    ll: `${lat},${lng}`,
    // A specific name search should not be narrowed by our category keywords
    query: term || 'cafe coffee library coworking',
    limit: String(MAX_LIMIT),
    radius: String(radius),
  });

  const res = await fetch(`/fsq/places/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Foursquare request failed: ${res.status}`);
  }

  const data = await res.json();
  const places = (data.results as FoursquareResult[]).map(toPlace);

  cache.set(key, { at: Date.now(), places });
  return places;
};
