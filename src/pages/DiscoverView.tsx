import React from 'react';
import PlaceCard from '@/components/PlaceCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { getHoursLabel, SortOption, Place } from '@/data/mockPlaces';
import { useExplore } from '@/pages/exploreContext';
import {
  MapPin, Filter, Clock, Wifi, Volume2,
  Star, Navigation, Zap, Armchair, DollarSign,
  X, Search, LocateFixed, Loader2, Sparkles, Plus
} from 'lucide-react';

const getNoiseLabel = (noise: number) => {
  if (noise <= 1.5) return 'Very Quiet';
  if (noise <= 2.5) return 'Quiet';
  if (noise <= 3.5) return 'Moderate';
  return 'Loud';
};

const getPriceLabel = (level: number) => '$'.repeat(level);

const getDirectionsUrl = (place: Place | null) => {
  if (!place) return '#';
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.address)}`;
};

const DiscoverView = () => {
  const {
    places, filters, resetFilters, activeFilterCount, openFilters,
    sortBy, setSortBy, searchQuery, setSearchQuery,
    isDiscovering, discoverError, discoveredCount, handleDiscover, handleSearchNearby,
    startAddSpot, canAddSpot, canReview,
    selectedPlace, toggleSelect, clearSelection, expandedPlace, placeReviews, openReview,
    quietCount,
  } = useExplore();

  return (
    <div className="h-full w-full max-w-3xl mx-auto bg-card flex flex-col">

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
                    <div className="text-3xl font-bold text-accent-quiet">{quietCount}</div>
                    <div className="text-sm font-medium text-muted-foreground">Quiet Spots</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button
              variant="outline"
              onClick={openFilters}
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
            <Button
              variant="outline"
              onClick={startAddSpot}
              disabled={!canAddSpot}
              className="w-full justify-start text-base h-11 mt-2"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add a spot that's missing
            </Button>
            {discoverError && (
              <p className="text-sm text-destructive mt-2">{discoverError}</p>
            )}
            {discoveredCount > 0 && !discoverError && (
              <p className="text-sm text-muted-foreground mt-2">
                Found {discoveredCount} real places nearby ✨
              </p>
            )}
          </div>

          {/* Place List */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Search */}
            <div className="px-4 pt-3 flex-shrink-0">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by name, e.g. Tamper Room"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearchNearby(); }}
                    className="pl-10 h-11 text-base"
                  />
                </div>
                <Button
                  onClick={handleSearchNearby}
                  disabled={isDiscovering || !searchQuery.trim()}
                  className="h-11 px-4"
                  title="Search real places near you"
                >
                  {isDiscovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Typing filters this list — press Enter to search real places nearby.
              </p>
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
                        onSelect={toggleSelect}
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
                            <Button variant="ghost" size="icon" className="shrink-0" onClick={clearSelection}>
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
                                onClick={() => openReview(expandedPlace)}
                                disabled={!canReview}
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
                              onClick={() => openReview(expandedPlace)}
                              disabled={!canReview}
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
                        <Button variant="outline" onClick={resetFilters}>
                          Reset Filters
                        </Button>
                        <Button onClick={openFilters}>
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
  );
};

export default DiscoverView;
