import { supabase } from '@/lib/supabase';
import { Place } from './mockPlaces';

/** Averaged crowd ratings for one place, from the place_ratings view. */
export interface CrowdRating {
  external_id: string;
  review_count: number;
  avg_wifi: number;
  avg_outlets: number;
  avg_noise: number;
  avg_seating: number;
}

/** One person's review. */
export interface Review {
  id: string;
  author_name: string | null;
  wifi: number;
  outlets: number;
  noise: number;
  seating: number;
  comment: string | null;
  created_at: string;
}

export interface ReviewInput {
  wifi: number;
  outlets: number;
  noise: number;
  seating: number;
  comment?: string;
  authorName?: string;
}

/**
 * Stable id used to tie a review to a place across data sources.
 * Foursquare places use their own id; curated demo places get a "mock-" prefix
 * so the two id spaces can never collide.
 */
export const externalIdFor = (place: Pick<Place, 'id' | 'isDiscovered'>) =>
  place.isDiscovered ? place.id : `mock-${place.id}`;

/** Fetch averaged ratings for a batch of places, keyed by external_id. */
export const fetchRatings = async (
  externalIds: string[]
): Promise<Record<string, CrowdRating>> => {
  if (!supabase || externalIds.length === 0) return {};

  const { data, error } = await supabase
    .from('place_ratings')
    .select('external_id, review_count, avg_wifi, avg_outlets, avg_noise, avg_seating')
    .in('external_id', externalIds);

  if (error) throw error;

  const map: Record<string, CrowdRating> = {};
  for (const row of (data ?? []) as CrowdRating[]) {
    // Only count places that actually have reviews
    if (row.review_count > 0) map[row.external_id] = row;
  }
  return map;
};

/** Fetch the individual reviews for a single place, newest first. */
export const fetchReviewsForPlace = async (externalId: string): Promise<Review[]> => {
  if (!supabase) return [];

  const { data: placeRow } = await supabase
    .from('places')
    .select('id')
    .eq('external_id', externalId)
    .maybeSingle();

  if (!placeRow) return [];

  const { data, error } = await supabase
    .from('reviews')
    .select('id, author_name, wifi, outlets, noise, seating, comment, created_at')
    .eq('place_id', placeRow.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data ?? []) as Review[];
};

/**
 * Submit a review. Ensures the place exists in our DB first (upsert),
 * then inserts the review attached to it. Works for guests (user_id null).
 */
export const submitReview = async (place: Place, input: ReviewInput): Promise<void> => {
  if (!supabase) throw new Error('Reviews are unavailable right now.');

  const external_id = externalIdFor(place);

  // 1. Make sure the place has a row (idempotent thanks to the unique external_id)
  const { data: placeRow, error: placeErr } = await supabase
    .from('places')
    .upsert(
      {
        external_id,
        name: place.name,
        address: place.address || null,
        lat: place.coords?.lat ?? null,
        lng: place.coords?.lng ?? null,
        types: place.types ?? [],
      },
      { onConflict: 'external_id' }
    )
    .select('id')
    .single();

  if (placeErr) throw placeErr;

  // 2. Attach the review (user_id stays null for guests)
  const { data: userData } = await supabase.auth.getUser();

  const { error: reviewErr } = await supabase.from('reviews').insert({
    place_id: placeRow.id,
    user_id: userData?.user?.id ?? null,
    author_name: input.authorName?.trim() || null,
    wifi: input.wifi,
    outlets: input.outlets,
    noise: input.noise,
    seating: input.seating,
    comment: input.comment?.trim() || null,
  });

  if (reviewErr) throw reviewErr;
};
