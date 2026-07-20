import React, { useState, useEffect } from 'react';
import Map from '@/components/Map';
import PlaceCard from '@/components/PlaceCard';
import FilterPanel from '@/components/FilterPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { getMockPlaces, isOpenNow, getHoursLabel, SortOption, Place } from '@/data/mockPlaces';
import { fetchNearbyPlaces } from '@/data/foursquare';
import ReviewForm from '@/components/ReviewForm';
import { fetchRatings, fetchReviewsForPlace, externalIdFor, CrowdRating, Review } from '@/data/reviews';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  MapPin, Filter, Coffee, BookOpen, Clock, Wifi, Volume2,
  Star, Navigation, ExternalLink, Zap, Armchair, DollarSign,
  X, Search, Moon, Sun, Utensils, LocateFixed, Loader2, Sparkles
} from 'lucide-react';

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
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('top-rated');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

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

  const handleDiscover = () => {
    if (!navigator.geolocation) {
      setDiscoverError('Location is not supported by your browser.');
      return;
    }
    setIsDiscovering(true);
    setDiscoverError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        try {
          const results = await fetchNearbyPlaces(latitude, longitude);
          setDiscoveredPlaces(results);
        } catch {
          setDiscoverError('Could not load nearby places. Try again.');
        } finally {
          setIsDiscovering(false);
        }
      },
      () => {
        setDiscoverError('Location permission denied.');
        setIsDiscovering(false);
      }
    );
  };

  // Curated (mock) places run through the full filter pipeline
  const curatedPlaces = getMockPlaces({ ...filters, sortBy });

  // Discovered (real) places have no amenity/price data, so we only apply
  // the filters that make sense for them: type + travel time.
  const travelKey = filters.transportMode === 'walking' ? 'walking_min' : 'driving_min';
  const discoveredFiltered = discoveredPlaces.filter(p =>
    p.types.some(t => filters.types.includes(t)) &&
    p.travel_time[travelKey] <= filters.withinMinutes
  );

  // Blend: curated (rated) first, then discovered (unrated)
  const combined = [...curatedPlaces, ...discoveredFiltered];
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
  const [refreshKey, setRefreshKey] = useState(0);

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
  const topStudySpots = places.filter(p =>
    p.amenities.wifi >= 4.5 && p.amenities.noise <= 2.0
  );

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

  const getNoiseLabel = (noise: number) => {
    if (noise <= 1.5) return 'Very Quiet';
    if (noise <= 2.5) return 'Quiet';
    if (noise <= 3.5) return 'Moderate';
    return 'Loud';
  };

  const getPriceLabel = (level: number) => '$'.repeat(level);

  const getDirectionsUrl = (place: typeof expandedPlace) => {
    if (!place) return '#';
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.address)}`;
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Study Spots</h1>
            </div>

            <div className="flex items-center gap-3">
              {filters.types.includes('cafe') && (
                <Badge variant="secondary" className="hidden sm:flex text-base px-4 py-2 gap-2">
                  <Coffee className="h-5 w-5" />
                  {places.filter(p => p.types.includes('cafe')).length} Cafes
                </Badge>
              )}
              {filters.types.includes('library') && (
                <Badge variant="secondary" className="hidden sm:flex text-base px-4 py-2 gap-2">
                  <BookOpen className="h-5 w-5" />
                  {places.filter(p => p.types.includes('library')).length} Libraries
                </Badge>
              )}
              {filters.types.includes('restaurant') && (
                <Badge variant="secondary" className="hidden sm:flex text-base px-4 py-2 gap-2">
                  <Utensils className="h-5 w-5" />
                  {places.filter(p => p.types.includes('restaurant')).length} Restaurants
                </Badge>
              )}
              <Badge variant="secondary" className="text-base px-4 py-2 gap-2">
                <Clock className="h-5 w-5" />
                {openPlaces.length} Open Now
              </Badge>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="h-11 w-11"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Sidebar */}
        <div className="w-[480px] border-r border-border bg-card flex flex-col">

          {/* Quick Stats */}
          <div className="p-4 border-b border-border">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Card className="bg-gradient-hero border-primary/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">{places.length}</div>
                    <div className="text-sm font-medium text-muted-foreground">Study Spots</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-surface border-border/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Volume2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-accent-quiet">{topStudySpots.length}</div>
                    <div className="text-sm font-medium text-muted-foreground">Quiet Spots</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              className="w-full justify-between text-base h-11 mb-2"
            >
              <span className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters & Preferences
              </span>
              {activeFilterCount > 0 && (
                <Badge className="ml-2 h-6 min-w-6 px-1.5 justify-center">{activeFilterCount}</Badge>
              )}
            </Button>

            <Button
              onClick={handleDiscover}
              disabled={isDiscovering}
              className="w-full justify-start text-base h-11"
            >
              {isDiscovering ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <LocateFixed className="h-5 w-5 mr-2" />
              )}
              {isDiscovering ? 'Finding spots near you…' : 'Discover real places near me'}
            </Button>
            {discoverError && (
              <p className="text-sm text-destructive mt-2">{discoverError}</p>
            )}
            {discoveredPlaces.length > 0 && !discoverError && (
              <p className="text-sm text-muted-foreground mt-2">
                Found {discoveredPlaces.length} real places nearby ✨
              </p>
            )}
          </div>

          {/* Place List */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Search */}
            <div className="px-4 pt-3 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 text-base"
                />
              </div>
            </div>

            {/* List header + sort */}
            <div className="flex items-center justify-between py-3 px-4 flex-shrink-0 border-b border-border">
              <CardTitle className="text-lg">
                {filters.types.includes('cafe') && filters.types.includes('library')
                  ? 'All Study Spots'
                  : filters.types.includes('cafe')
                    ? 'Cafes'
                    : 'Libraries'}
              </CardTitle>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-44 h-11 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-rated">⭐ Top Rated</SelectItem>
                  <SelectItem value="nearest">📍 Nearest</SelectItem>
                  <SelectItem value="quietest">🤫 Quietest</SelectItem>
                  <SelectItem value="best-wifi">📶 Best WiFi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="flex-1 px-4">
              <div className="space-y-3 py-4">
                {places.length > 0 ? (
                  places.map((place) => (
                    <div key={place.id}>
                      <PlaceCard
                        place={place}
                        onSelect={(id) => setSelectedPlace(selectedPlace === id ? null : id)}
                        transportMode={filters.transportMode}
                        isSelected={selectedPlace === place.id}
                      />

                      {/* Expanded detail panel */}
                      {selectedPlace === place.id && expandedPlace && (
                        <div className="mt-1 mb-2 rounded-xl border border-border bg-background p-5 space-y-4">
                          {/* Address + hours */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-base font-medium text-foreground">{expandedPlace.address}</p>
                              {!expandedPlace.isDiscovered && (
                                <p className="text-sm text-muted-foreground mt-0.5">{getHoursLabel(expandedPlace.hours)}</p>
                              )}
                            </div>
                            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setSelectedPlace(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {expandedPlace.isDiscovered && !(expandedPlace.reviewCount ?? 0) ? (
                            /* Discovered place — no amenity data yet */
                            <div className="rounded-lg border border-dashed border-border p-4 text-center">
                              <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
                              <p className="text-base font-medium">Not yet rated</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                No one's reviewed the WiFi, outlets, or noise here yet. Be the first to help others out!
                              </p>
                              <Button
                                variant="outline"
                                className="mt-3"
                                onClick={() => setReviewTarget(expandedPlace)}
                                disabled={!isSupabaseConfigured}
                              >
                                Be the first to review
                              </Button>
                            </div>
                          ) : (
                            <>
                          {/* All amenity scores */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                              <Wifi className="h-4 w-4 text-blue-500" />
                              <div>
                                <div className="text-xs text-muted-foreground">WiFi</div>
                                <div className="text-base font-semibold">{expandedPlace.amenities.wifi}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                              <Zap className="h-4 w-4 text-yellow-500" />
                              <div>
                                <div className="text-xs text-muted-foreground">Outlets</div>
                                <div className="text-base font-semibold">{expandedPlace.amenities.outlets}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                              <Volume2 className="h-4 w-4 text-green-500" />
                              <div>
                                <div className="text-xs text-muted-foreground">Noise</div>
                                <div className="text-base font-semibold">{getNoiseLabel(expandedPlace.amenities.noise)}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                              <Armchair className="h-4 w-4 text-purple-500" />
                              <div>
                                <div className="text-xs text-muted-foreground">Seating</div>
                                <div className="text-base font-semibold">{expandedPlace.amenities.seating}</div>
                              </div>
                            </div>
                          </div>

                          {/* Rating + price row */}
                          <div className="flex items-center gap-4 text-base">
                            <div className="flex items-center gap-1.5">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{expandedPlace.rating}</span>
                              <span className="text-muted-foreground">rating</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">{getPriceLabel(expandedPlace.price_level)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {filters.transportMode === 'walking'
                                  ? `${expandedPlace.travel_time.walking_min} min walk`
                                  : `${expandedPlace.travel_time.driving_min} min drive`}
                              </span>
                            </div>
                          </div>
                            </>
                          )}

                          {/* Community reviews */}
                          {placeReviews.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-muted-foreground">
                                {placeReviews.length} review{placeReviews.length === 1 ? '' : 's'}
                              </p>
                              {placeReviews.slice(0, 3).map(r => (
                                <div key={r.id} className="rounded-lg bg-muted/40 p-3">
                                  <p className="text-sm font-medium">
                                    {r.author_name || 'Anonymous'}
                                  </p>
                                  {r.comment && (
                                    <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-1">
                                    WiFi {r.wifi} · Outlets {r.outlets} · Noise {r.noise} · Seating {r.seating}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add a review (hidden when the empty-state button already offers it) */}
                          {!(expandedPlace.isDiscovered && !(expandedPlace.reviewCount ?? 0)) && (
                            <Button
                              variant="outline"
                              className="w-full gap-2"
                              onClick={() => setReviewTarget(expandedPlace)}
                              disabled={!isSupabaseConfigured}
                            >
                              <Sparkles className="h-4 w-4" />
                              Rate this spot
                            </Button>
                          )}

                          {/* Directions button */}
                          <a
                            href={getDirectionsUrl(expandedPlace)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full"
                          >
                            <Button className="w-full gap-2">
                              <Navigation className="h-4 w-4" />
                              Get Directions
                            </Button>
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center text-center px-6 py-16">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
                      {searchQuery.trim() ? (
                        <Search className="h-10 w-10 text-muted-foreground" />
                      ) : (
                        <MapPin className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {searchQuery.trim() ? 'No matches found' : 'No spots match your filters'}
                    </h3>
                    <p className="text-base text-muted-foreground max-w-xs mb-5">
                      {searchQuery.trim()
                        ? `We couldn't find anything for "${searchQuery}". Try a different name or address.`
                        : 'Try widening your filters — loosen the amenity minimums, expand the travel time, or add more place types.'}
                    </p>
                    {searchQuery.trim() ? (
                      <Button variant="outline" onClick={() => setSearchQuery('')}>
                        Clear Search
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
                          Reset Filters
                        </Button>
                        <Button onClick={() => setShowFilters(true)}>
                          Adjust Filters
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <Map
            places={places}
            selectedPlace={selectedPlace}
            onSelectPlace={(id) => setSelectedPlace(selectedPlace === id ? null : id)}
            userLocation={userLocation}
          />
        </div>
      </div>

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
    </div>
  );
};

export default Index;
