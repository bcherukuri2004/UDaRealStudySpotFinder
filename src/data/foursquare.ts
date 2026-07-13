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

// Fetch real work-friendly places near a given coordinate via our dev proxy
export const fetchNearbyPlaces = async (lat: number, lng: number): Promise<Place[]> => {
  const params = new URLSearchParams({
    ll: `${lat},${lng}`,
    query: 'cafe coffee library coworking',
    limit: '20',
    radius: '2000',
  });

  const res = await fetch(`/fsq/places/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Foursquare request failed: ${res.status}`);
  }

  const data = await res.json();
  return (data.results as FoursquareResult[]).map(toPlace);
};
