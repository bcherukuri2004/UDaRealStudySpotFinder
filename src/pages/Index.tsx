import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import FilterPanel from '@/components/FilterPanel';
import SpotDetail from '@/components/SpotDetail';
import { getMockPlaces, isOpenNow, SortOption, Place } from '@/data/mockPlaces';
import { fetchNearbyPlaces } from '@/data/foursquare';
import ReviewForm from '@/components/ReviewForm';
import { fetchRatings, fetchReviewsForPlace, externalIdFor, CrowdRating, Review } from '@/data/reviews';
import { getTravelTimes, getIsochrone } from '@/data/routing';
import AddSpotForm from '@/components/AddSpotForm';
import { fetchUserPlaces } from '@/data/userPlaces';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useDarkMode } from '@/hooks/useDarkMode';
import type { ExploreContext } from '@/pages/exploreContext';

const DEFAULT_FILTERS = {
  types: ['cafe', 'library'],
  openNow: false,
  priceRange: [1, 3] as [number, number],
  amenityMinimums: {
    wifi: 3.0,
    outlets: 2.5,
    noise: 4.0,
    seating: 2.5,
  },
  withinMinutes: 20,
  transportMode: 'walking' as 'walking' | 'driving'
};

const Index = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('top-rated');
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showFilters) setShowFilters(false);
        else if (selectedPlace) setSelectedPlace(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showFilters, selectedPlace]);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [discoveredPlaces, setDiscoveredPlaces] = useState<Place[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [isochrone, setIsochrone] = useState<unknown | null>(null);
  const [showIsochrone, setShowIsochrone] = useState(true);

  // Bumped whenever data changes (new review, new spot) to trigger refetches
  const [refreshKey, setRefreshKey] = useState(0);

  // ---- Community-added spots ----
  const [userPlaces, setUserPlaces] = useState<Place[]>([]);
  const [showAddSpot, setShowAddSpot] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Load community spots on mount, and again after one is added
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchUserPlaces().then(setUserPlaces).catch(() => {});
  }, [refreshKey]);

  // How far the travel-time filter reaches, in metres.
  // Keeps the fetch radius consistent with what the filter will allow through.
  const metersPerMinute = filters.transportMode === 'walking' ? 80 : 600;
  const filterRadiusM = filters.withinMinutes * metersPerMinute;

  /** Get the user's coordinates, reusing them if we already have them. */
  const getCoords = (): Promise<{ lat: number; lng: number }> =>
    new Promise((resolve, reject) => {
      if (userLocation) return resolve(userLocation);
      if (!navigator.geolocation) return reject(new Error('Location is not supported by your browser.'));
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(coords);
          resolve(coords);
        },
        () => reject(new Error('Location permission denied.'))
      );
    });

  /**
   * Replace straight-line estimates with real road times for the active
   * transport mode. Falls back to the estimates if routing is unavailable.
   * Only the current mode is fetched, to conserve the daily routing quota.
   */
  const enrichWithRealTimes = async (
    origin: { lat: number; lng: number },
    list: Place[]
  ): Promise<Place[]> => {
    const routed = await getTravelTimes(
      origin,
      list.map(p => p.coords),
      filters.transportMode
    );
    if (!routed) return list;

    return list.map((p, i) => {
      const mins = routed.minutes[i];
      const meters = routed.meters[i];
      if (!Number.isFinite(mins)) return p;
      return {
        ...p,
        distance_meters: Number.isFinite(meters) ? meters : p.distance_meters,
        travel_time: {
          ...p.travel_time,
          [filters.transportMode === 'walking' ? 'walking_min' : 'driving_min']: mins,
        },
        hasRealTravelTime: true,
      };
    });
  };

  /** Browse work-friendly spots around the user. */
  const handleDiscover = async () => {
    setIsDiscovering(true);
    setDiscoverError(null);
    try {
      const { lat, lng } = await getCoords();
      const found = await fetchNearbyPlaces(lat, lng, undefined, filterRadiusM);
      setDiscoveredPlaces(await enrichWithRealTimes({ lat, lng }, found));
    } catch (e) {
      setDiscoverError(e instanceof Error ? e.message : 'Could not load nearby places.');
    } finally {
      setIsDiscovering(false);
    }
  };

  /** Search Foursquare by name (e.g. "Tamper Room") across a wide radius. */
  const handleSearchNearby = async () => {
    const term = searchQuery.trim();
    if (!term) return;
    setIsDiscovering(true);
    setDiscoverError(null);
    try {
      const { lat, lng } = await getCoords();
      const results = await enrichWithRealTimes(
        { lat, lng },
        await fetchNearbyPlaces(lat, lng, term)
      );
      setDiscoveredPlaces(results);
      if (results.length === 0) {
        setDiscoverError(`No places found matching "${term}" nearby.`);
      }
    } catch (e) {
      setDiscoverError(e instanceof Error ? e.message : 'Search failed.');
    } finally {
      setIsDiscovering(false);
    }
  };

  // Redraw the reachable-area polygon whenever location or travel settings change
  useEffect(() => {
    if (!userLocation || !showIsochrone) {
      setIsochrone(null);
      return;
    }
    let cancelled = false;
    getIsochrone(userLocation, filters.withinMinutes, filters.transportMode)
      .then(geo => { if (!cancelled) setIsochrone(geo); })
      .catch(() => { if (!cancelled) setIsochrone(null); });
    return () => { cancelled = true; };
  }, [userLocation, filters.withinMinutes, filters.transportMode, showIsochrone]);

  // Curated (mock) places run through the full filter pipeline
  const curatedPlaces = getMockPlaces({ ...filters, sortBy });

  // Discovered (real) places have no amenity/price data, so we only apply
  // the filters that make sense for them: type + travel time.
  // When the user is searching by name, skip BOTH — if you explicitly asked for
  // "Tamper Room", you want to see it even if it's a long drive or an odd category.
  const travelKey = filters.transportMode === 'walking' ? 'walking_min' : 'driving_min';
  const isSearching = searchQuery.trim().length > 0;
  const discoveredFiltered = isSearching
    ? discoveredPlaces
    : discoveredPlaces.filter(p =>
        p.types.some(t => filters.types.includes(t)) &&
        p.travel_time[travelKey] <= filters.withinMinutes
      );

  // Community spots: filtered only by type (no amenity/price data to filter on)
  const userFiltered = isSearching
    ? userPlaces
    : userPlaces.filter(p => p.types.some(t => filters.types.includes(t)));

  // Blend: curated (rated) → community-added → discovered
  const combined = [...curatedPlaces, ...userFiltered, ...discoveredFiltered];
  const rawPlaces = searchQuery.trim()
    ? combined.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : combined;
  // ---- Crowd reviews ----
  const [crowdRatings, setCrowdRatings] = useState<Record<string, CrowdRating>>({});
  const [reviewTarget, setReviewTarget] = useState<Place | null>(null);
  const [placeReviews, setPlaceReviews] = useState<Review[]>([]);

  // Overlay real crowd ratings on top of whatever data a place shipped with.
  // Human reviews always win over demo/placeholder numbers.
  const places = rawPlaces.map(p => {
    const cr = crowdRatings[externalIdFor(p)];
    if (!cr) return p;
    return {
      ...p,
      amenities: {
        wifi: cr.avg_wifi,
        outlets: cr.avg_outlets,
        noise: cr.avg_noise,
        seating: cr.avg_seating,
      },
      reviewCount: cr.review_count,
    };
  });

  // Fetch ratings for whatever places are currently visible
  const visibleIds = rawPlaces.map(externalIdFor).join(',');
  useEffect(() => {
    if (!isSupabaseConfigured || !visibleIds) return;
    fetchRatings(visibleIds.split(','))
      .then(setCrowdRatings)
      .catch(() => {/* reviews are non-critical; fail quietly */});
  }, [visibleIds, refreshKey]);

  // Load individual reviews for whichever place is expanded
  useEffect(() => {
    if (!isSupabaseConfigured || !selectedPlace) {
      setPlaceReviews([]);
      return;
    }
    const target = places.find(p => p.id === selectedPlace);
    if (!target) return;
    fetchReviewsForPlace(externalIdFor(target))
      .then(setPlaceReviews)
      .catch(() => setPlaceReviews([]));
  }, [selectedPlace, refreshKey]);

  const openPlaces = places.filter(p => isOpenNow(p.hours));

  const expandedPlace = selectedPlace ? places.find(p => p.id === selectedPlace) : null;

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.types.length !== DEFAULT_FILTERS.types.length ||
        !filters.types.every(t => DEFAULT_FILTERS.types.includes(t))) count++;
    if (filters.openNow !== DEFAULT_FILTERS.openNow) count++;
    if (filters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] ||
        filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1]) count++;
    if (filters.withinMinutes !== DEFAULT_FILTERS.withinMinutes) count++;
    if (filters.transportMode !== DEFAULT_FILTERS.transportMode) count++;
    if (filters.amenityMinimums.wifi !== DEFAULT_FILTERS.amenityMinimums.wifi) count++;
    if (filters.amenityMinimums.outlets !== DEFAULT_FILTERS.amenityMinimums.outlets) count++;
    if (filters.amenityMinimums.noise !== DEFAULT_FILTERS.amenityMinimums.noise) count++;
    if (filters.amenityMinimums.seating !== DEFAULT_FILTERS.amenityMinimums.seating) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // If a filter change removes the selected spot, close its detail instead of leaving a stale id.
  const placeIdsKey = places.map(p => p.id).join('|');
  useEffect(() => {
    if (selectedPlace && !places.some(p => p.id === selectedPlace)) setSelectedPlace(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlace, placeIdsKey]);

  const toggleSelect = (id: string) => setSelectedPlace(prev => (prev === id ? null : id));

  const explore: ExploreContext = {
    places,
    filters,
    setFilters,
    resetFilters: () => setFilters(DEFAULT_FILTERS),
    activeFilterCount,
    openFilters: () => setShowFilters(true),
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    isDiscovering,
    discoverError,
    discoveredCount: discoveredPlaces.length,
    handleDiscover,
    handleSearchNearby,
    // Picking happens on the map, so take the user there first.
    startAddSpot: () => { navigate('/map'); setShowAddSpot(true); setIsPicking(true); },
    canAddSpot: isSupabaseConfigured,
    selectedPlace,
    toggleSelect,
    openCount: openPlaces.length,
    userLocation,
    isochrone,
    showIsochrone,
    toggleIsochrone: () => setShowIsochrone(v => !v),
    isPicking,
    pickedLocation,
    onPickLocation: (lat, lng) => { setPickedLocation({ lat, lng }); setIsPicking(false); },
  };

  return (
    <div className="h-full">
      <Outlet context={explore} />

      {/* Spot detail (shared by Discover and Map) */}
      <SpotDetail
        place={expandedPlace ?? null}
        reviews={placeReviews}
        transportMode={filters.transportMode}
        canReview={isSupabaseConfigured}
        onClose={() => setSelectedPlace(null)}
        onRate={setReviewTarget}
      />

      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {/* Review form */}
      <ReviewForm
        place={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onSubmitted={() => setRefreshKey(k => k + 1)}
      />

      {/* Add a community spot */}
      <AddSpotForm
        open={showAddSpot}
        onClose={() => { setShowAddSpot(false); setIsPicking(false); setPickedLocation(null); }}
        onAdded={() => setRefreshKey(k => k + 1)}
        picked={pickedLocation}
        onStartPicking={() => setIsPicking(true)}
        isPicking={isPicking}
        userLocation={userLocation}
        onUseMyLocation={() => { if (userLocation) { setPickedLocation(userLocation); setIsPicking(false); } }}
      />
    </div>
  );
};

export default Index;
