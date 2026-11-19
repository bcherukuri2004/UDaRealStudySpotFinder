import React from 'react';
import PlaceCard from '@/components/PlaceCard';
import { Button } from '@/components/ui/button';
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
    <div className="board h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-5 pb-12 pt-6">
        <div className="sticky-note px-5 py-4">
          <p className="font-label opacity-80">{places.length} spots · {openCount} open now</p>
          <h1 className="font-marker mt-1 text-3xl leading-tight sm:text-4xl">Where are you working today?</h1>
        </div>

        {/* Search */}
        <div className="mt-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, e.g. Tamper Room"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearchNearby(); }}
              className="h-12 rounded border-[2.5px] border-foreground bg-card pl-10 text-base shadow-soft"
            />
          </div>
          <button
            onClick={handleSearchNearby}
            disabled={isDiscovering || !searchQuery.trim()}
            className="chip chip-dark h-12 px-4"
            title="Search real places near you"
            aria-label="Search nearby"
          >
            {isDiscovering ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          </button>
        </div>
        <p className="mt-2 inline-block rounded bg-card/90 px-2 py-1 text-sm">
          Typing filters this list — press Enter to search real places nearby.
        </p>

        {/* Action chips */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={openFilters} className="chip">
            <Filter className="mr-2 h-5 w-5" />
            Filters &amp; Preferences
            {activeFilterCount > 0 && (
              <span className="sticky-badge ml-2 rounded-full">{activeFilterCount}</span>
            )}
          </button>
          <button onClick={handleDiscover} disabled={isDiscovering} className="chip chip-dark">
            {isDiscovering ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <LocateFixed className="mr-2 h-5 w-5" />
            )}
            {isDiscovering ? 'Finding spots near you…' : 'Discover real places near me'}
          </button>
          <button onClick={startAddSpot} disabled={!canAddSpot} className="chip">
            <Plus className="mr-2 h-5 w-5" />
            Add a spot that's missing
          </button>
        </div>
        {discoverError && (
          <p className="sticky-note sticky-pink mt-3 inline-block px-3 py-2 text-base">{discoverError}</p>
        )}
        {discoveredCount > 0 && !discoverError && (
          <p className="sticky-note sticky-mint mt-3 inline-block px-3 py-2 text-base">
            Found {discoveredCount} real places nearby ✨
          </p>
        )}

        {/* List header + sort */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="font-marker text-2xl text-[hsl(var(--ink))] [text-shadow:0_1px_0_rgba(255,255,255,0.5)] dark:text-white dark:[text-shadow:none]">
            {listTitle}
          </h2>
          <label className="flex items-center gap-2 text-base">
            <span className="sr-only">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="chip pr-3"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Cards */}
        <div className="mt-7">
          {hero ? (
            <div className="space-y-8">
              <PlaceCard
                variant="hero"
                tilt="left"
                place={hero}
                onSelect={toggleSelect}
                transportMode={filters.transportMode}
                isSelected={selectedPlace === hero.id}
              />
              {rest.length > 0 && (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  {rest.map((place, i) => (
                    <PlaceCard
                      key={place.id}
                      variant="tile"
                      tilt={i % 2 === 0 ? 'right' : 'left'}
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
            <div className="note note-tilt-left mx-auto flex max-w-md flex-col items-center px-6 py-12 text-center"><div className="pin" />
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
