import React, { useState } from 'react';
import Map from '@/components/Map';
import PlaceCard from '@/components/PlaceCard';
import FilterPanel from '@/components/FilterPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMockPlaces, SortOption } from '@/data/mockPlaces';
import {
  MapPin, Filter, Coffee, BookOpen, Clock, Wifi, Volume2,
  Star, Navigation, ExternalLink, Zap, Armchair, DollarSign,
  X
} from 'lucide-react';

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('top-rated');

  const [filters, setFilters] = useState({
    types: ['cafe', 'library'],
    openNow: false,
    priceRange: [1, 4] as [number, number],
    amenityMinimums: {
      wifi: 3.0,
      outlets: 2.5,
      noise: 4.0,
      seating: 2.5,
    },
    withinMinutes: 20,
    transportMode: 'walking' as 'walking' | 'driving'
  });

  const places = getMockPlaces({ ...filters, sortBy });
  const openPlaces = places.filter(p => p.open_now);
  const topStudySpots = places.filter(p =>
    p.amenities.wifi >= 4.5 && p.amenities.noise <= 2.0
  );

  const expandedPlace = selectedPlace ? places.find(p => p.id === selectedPlace) : null;

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
              <Badge variant="secondary" className="hidden sm:flex text-base px-4 py-2 gap-2">
                <Coffee className="h-5 w-5" />
                {places.filter(p => p.types.includes('cafe')).length} Cafes
              </Badge>
              <Badge variant="secondary" className="hidden sm:flex text-base px-4 py-2 gap-2">
                <BookOpen className="h-5 w-5" />
                {places.filter(p => p.types.includes('library')).length} Libraries
              </Badge>
              <Badge variant="secondary" className="text-base px-4 py-2 gap-2">
                <Clock className="h-5 w-5" />
                {openPlaces.length} Open Now
              </Badge>
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
              className="w-full justify-start text-base h-11"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters & Preferences
            </Button>
          </div>

          {/* Place List */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
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
                <SelectTrigger className="w-36 h-9 text-sm">
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
                        variant="compact"
                        onSelect={(id) => setSelectedPlace(selectedPlace === id ? null : id)}
                        transportMode={filters.transportMode}
                        isSelected={selectedPlace === place.id}
                      />

                      {/* Expanded detail panel */}
                      {selectedPlace === place.id && expandedPlace && (
                        <div className="mt-1 mb-2 rounded-xl border border-border bg-background p-5 space-y-4">
                          {/* Address */}
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-base font-medium text-foreground">{expandedPlace.address}</p>
                            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setSelectedPlace(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

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
                  <div className="text-center py-8">
                    <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-base text-muted-foreground">No places match your filters</p>
                    <Button variant="ghost" size="sm" onClick={() => setShowFilters(true)} className="mt-2">
                      Adjust Filters
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1">
          <Map onLocationSelect={(lat, lng) => setSelectedLocation({ lat, lng })} mapboxToken={mapboxToken} />
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
};

export default Index;
