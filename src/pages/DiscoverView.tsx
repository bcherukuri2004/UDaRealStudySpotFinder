import React from 'react';
import PlaceCard from '@/components/PlaceCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SortOption } from '@/data/mockPlaces';
import { useExplore } from '@/pages/exploreContext';
import { MapPin, Filter, Search, LocateFixed, Loader2, Plus } from 'lucide-react';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'top-rated', label: 'Top rated' },
  { value: 'nearest', label: 'Nearest' },
  { value: 'quietest', label: 'Quietest' },
  { value: 'best-wifi', label: 'Best WiFi' },
];

const DiscoverView = () => {
  const {
    places, filters, resetFilters, activeFilterCount, openFilters,
    sortBy, setSortBy, searchQuery, setSearchQuery,
    isDiscovering, discoverError, discoveredCount, handleDiscover, handleSearchNearby,
    startAddSpot, canAddSpot, selectedPlace, toggleSelect, openCount,
  } = useExplore();

  const [hero, ...rest] = places;
  const listTitle =
    filters.types.includes('cafe') && filters.types.includes('library')
      ? 'All study spots'
      : filters.types.includes('cafe')
        ? 'Cafes'
        : 'Libraries';

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="mx-auto max-w-3xl px-5 pb-10 pt-6">
        <p className="font-label text-muted-foreground">
          {places.length} spots · {openCount} open now
        </p>
        <h1 className="mt-1 font-marker text-5xl leading-tight">
          Choose your space.
        </h1>

        {/* Search */}
        <div className="mt-5 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, e.g. Tamper Room"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearchNearby(); }}
              className="h-12 rounded-full bg-card pl-10 text-base"
            />
          </div>
          <Button
            onClick={handleSearchNearby}
            disabled={isDiscovering || !searchQuery.trim()}
            className="h-12 rounded-full px-5"
            title="Search real places near you"
            aria-label="Search nearby"
          >
            {isDiscovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Typing filters this list — press Enter to search real places nearby.
        </p>

        {/* Action chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={openFilters} className="h-11 rounded-full bg-card text-base">
            <Filter className="mr-2 h-5 w-5" />
            Filters &amp; Preferences
            {activeFilterCount > 0 && (
              <Badge className="ml-2 h-6 min-w-6 justify-center px-1.5">{activeFilterCount}</Badge>
            )}
          </Button>
          <Button onClick={handleDiscover} disabled={isDiscovering} className="h-11 rounded-full text-base">
            {isDiscovering ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <LocateFixed className="mr-2 h-5 w-5" />
            )}
            {isDiscovering ? 'Finding spots near you…' : 'Discover real places near me'}
          </Button>
          <Button
            variant="outline"
            onClick={startAddSpot}
            disabled={!canAddSpot}
            className="h-11 rounded-full bg-card text-base"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add a spot that's missing
          </Button>
        </div>
        {discoverError && <p className="mt-2 text-sm text-destructive">{discoverError}</p>}
        {discoveredCount > 0 && !discoverError && (
          <p className="mt-2 text-sm text-muted-foreground">
            Found {discoveredCount} real places nearby ✨
          </p>
        )}

        {/* List header + sort */}
        <div className="mt-8 flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-label text-base text-foreground">{listTitle}</h2>
          <label className="flex items-center gap-2 text-base">
            <span className="sr-only">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-11 rounded-full border border-input bg-card px-4 text-base"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Cards */}
        <div className="mt-5">
          {hero ? (
            <div className="space-y-4">
              <PlaceCard
                variant="hero"
                place={hero}
                onSelect={toggleSelect}
                transportMode={filters.transportMode}
                isSelected={selectedPlace === hero.id}
              />
              {rest.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {rest.map((place) => (
                    <PlaceCard
                      key={place.id}
                      variant="tile"
                      place={place}
                      onSelect={toggleSelect}
                      transportMode={filters.transportMode}
                      isSelected={selectedPlace === place.id}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                {searchQuery.trim() ? (
                  <Search className="h-10 w-10 text-muted-foreground" />
                ) : (
                  <MapPin className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                {searchQuery.trim() ? 'No matches found' : 'No spots match your filters'}
              </h3>
              <p className="mb-5 max-w-xs text-base text-muted-foreground">
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
                  <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
                  <Button onClick={openFilters}>Adjust Filters</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoverView;
