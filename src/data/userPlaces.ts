import { supabase } from '@/lib/supabase';
import { Place } from './mockPlaces';

/**
 * Community-submitted spots — places that exist in the real world but
 * aren't in Foursquare's database (campus lounges, new cafés, hidden
 * library floors, etc.).
 *
 * They live in the same `places` table as everything else; the
 * "user-" prefix on external_id is what marks them as community-added.
 */

export interface NewSpotInput {
  name: string;
  address: string;
  types: string[];
  lat: number;
  lng: number;
}

interface PlaceRow {
  external_id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  types: string[] | null;
}

/** Turn a database row into the Place shape the app renders. */
const rowToPlace = (row: PlaceRow): Place => ({
  id: row.external_id,
  name: row.name,
  coords: { lat: row.lat ?? 0, lng: row.lng ?? 0 },
  rating: 0,
  price_level: 0,
  types: row.types ?? ['cafe'],
  address: row.address ?? '',
  hours: { open: 0, close: 24 }, // unknown
  amenities: { wifi: 0, outlets: 0, noise: 0, seating: 0 },
  badges: [],
  distance_meters: 0,
  travel_time: { walking_min: 0, driving_min: 0 },
  isDiscovered: true,  // no amenity data yet -> shows "Not yet rated"
  isUserAdded: true,
});

/** Load every community-submitted spot. */
export const fetchUserPlaces = async (): Promise<Place[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('places')
    .select('external_id, name, address, lat, lng, types')
    .like('external_id', 'user-%');

  if (error) return [];
  return ((data ?? []) as PlaceRow[]).map(rowToPlace);
};

/** Submit a brand-new spot. Returns the created Place. */
export const addUserPlace = async (input: NewSpotInput): Promise<Place> => {
  if (!supabase) throw new Error('Adding spots is unavailable right now.');

  const name = input.name.trim();
  if (!name) throw new Error('Please enter a name.');
  if (!Number.isFinite(input.lat) || !Number.isFinite(input.lng)) {
    throw new Error('Please choose a location on the map.');
  }

  // crypto.randomUUID gives a collision-free id without a server round-trip
  const external_id = `user-${crypto.randomUUID()}`;

  const { data, error } = await supabase
    .from('places')
    .insert({
      external_id,
      name,
      address: input.address.trim() || null,
      lat: input.lat,
      lng: input.lng,
      types: input.types.length ? input.types : ['cafe'],
    })
    .select('external_id, name, address, lat, lng, types')
    .single();

  if (error) throw new Error(error.message);
  return rowToPlace(data as PlaceRow);
};
