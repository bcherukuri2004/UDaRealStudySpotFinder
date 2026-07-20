/**
 * Real road travel times.
 *
 * Deliberately provider-agnostic: the rest of the app only calls
 * `getTravelTimes(...)`. Swapping OpenRouteService for Google/Mapbox later
 * means rewriting this one file, not touching any components.
 */

export type TravelMode = 'walking' | 'driving';

export interface Coords {
  lat: number;
  lng: number;
}

/** Minutes from the origin to each destination, in the order given. */
export interface TravelResult {
  minutes: number[];
  meters: number[];
}

// ORS profile names
const PROFILE: Record<TravelMode, string> = {
  walking: 'foot-walking',
  driving: 'driving-car',
};

// Free tier: 500 matrix requests/day. Cache hard and cap batch size.
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_DESTINATIONS = 50;

const cache = new Map<string, { at: number; result: TravelResult }>();
const isochroneCache = new Map<string, { at: number; geojson: unknown }>();

const keyFor = (origin: Coords, dests: Coords[], mode: TravelMode) =>
  `${mode}|${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}|` +
  dests.map(d => `${d.lat.toFixed(4)},${d.lng.toFixed(4)}`).join(';');

/**
 * Get real road travel times from one origin to many destinations
 * in a single request (a "matrix" query).
 *
 * Returns null if routing is unavailable — callers should fall back
 * to their existing estimates rather than break.
 */
export const getTravelTimes = async (
  origin: Coords,
  destinations: Coords[],
  mode: TravelMode
): Promise<TravelResult | null> => {
  if (destinations.length === 0) return { minutes: [], meters: [] };

  const dests = destinations.slice(0, MAX_DESTINATIONS);
  const cacheKey = keyFor(origin, dests, mode);

  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.result;

  // ORS expects [lng, lat] order — the reverse of the usual convention.
  const locations = [
    [origin.lng, origin.lat],
    ...dests.map(d => [d.lng, d.lat]),
  ];

  try {
    const res = await fetch(`/ors/v2/matrix/${PROFILE[mode]}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locations,
        sources: [0],          // index 0 is our origin
        metrics: ['duration', 'distance'],
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const durations: number[] = data?.durations?.[0] ?? [];
    const distances: number[] = data?.distances?.[0] ?? [];

    // Element 0 is origin->origin, so drop it
    const result: TravelResult = {
      minutes: durations.slice(1).map(s => (s == null ? NaN : Math.max(1, Math.round(s / 60)))),
      meters: distances.slice(1).map(m => (m == null ? NaN : Math.round(m))),
    };

    cache.set(cacheKey, { at: Date.now(), result });
    return result;
  } catch {
    return null; // network/quota failure — caller falls back to estimates
  }
};

/**
 * Get the "reachable area" polygon — everywhere you can get to within
 * `minutes` by the given mode, following real roads.
 *
 * Returns GeoJSON (a FeatureCollection with a Polygon), or null on failure
 * so the map can simply skip drawing it.
 */
export const getIsochrone = async (
  origin: Coords,
  minutes: number,
  mode: TravelMode
): Promise<unknown | null> => {
  const cacheKey = `${mode}|${minutes}|${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}`;

  const hit = isochroneCache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.geojson;

  try {
    const res = await fetch(`/ors/v2/isochrones/${PROFILE[mode]}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locations: [[origin.lng, origin.lat]], // ORS wants [lng, lat]
        range: [Math.round(minutes * 60)],     // seconds
        range_type: 'time',
      }),
    });

    if (!res.ok) return null;

    const geojson = await res.json();
    isochroneCache.set(cacheKey, { at: Date.now(), geojson });
    return geojson;
  } catch {
    return null;
  }
};
