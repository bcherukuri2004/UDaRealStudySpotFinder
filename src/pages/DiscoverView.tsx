import React from 'react';
import PlaceCard from '@/components/PlaceCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SortOption } from '@/data/mockPlaces';
import { useExplore } from '@/pages/exploreContext';
import {
  MapPin, Filter, Volume2, Search, LocateFixed, Loader2, Plus
} from 'lucide-react';

const DiscoverView = () => {
  const {
    places, filters, resetFilters, activeFilterCount, openFilters,
    sortBy, setSortBy, searchQuery, setSearchQuery,
    isDiscovering, discoverError, discoveredCount, handleDiscover, handleSearchNearby,
    startAddSpot, canAddSpot,
    selectedPlace, toggleSelect,
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
