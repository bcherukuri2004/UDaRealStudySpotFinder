import { ReactNode } from "react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import type { ExploreContext } from "@/pages/exploreContext";
import type { Place } from "@/data/mockPlaces";

export const makePlace = (over: Partial<Place> = {}): Place => ({
  id: "p1",
  name: "Test Cafe",
  coords: { lat: 37.44, lng: -122.14 },
  rating: 4.5,
  price_level: 2,
  types: ["cafe"],
  address: "1 Main St",
  hours: { open: 0, close: 24 },
  amenities: { wifi: 4, outlets: 4, noise: 2, seating: 4 },
  badges: [],
  distance_meters: 500,
  travel_time: { walking_min: 6, driving_min: 2 },
  ...over,
});

export const makeExplore = (over: Partial<ExploreContext> = {}): ExploreContext => ({
  places: [],
  filters: {
    types: ["cafe", "library"],
    openNow: false,
    priceRange: [1, 3],
    amenityMinimums: { wifi: 3, outlets: 2.5, noise: 4, seating: 2.5 },
    withinMinutes: 20,
    transportMode: "walking",
  },
  setFilters: vi.fn(),
  resetFilters: vi.fn(),
  activeFilterCount: 0,
  openFilters: vi.fn(),
  sortBy: "top-rated",
  setSortBy: vi.fn(),
  searchQuery: "",
  setSearchQuery: vi.fn(),
  isDiscovering: false,
  discoverError: null,
  discoveredCount: 0,
  handleDiscover: vi.fn(),
  handleSearchNearby: vi.fn(),
  startAddSpot: vi.fn(),
  canAddSpot: true,
  selectedPlace: null,
  toggleSelect: vi.fn(),
  quietCount: 0,
  openCount: 0,
  userLocation: null,
  isochrone: null,
  showIsochrone: true,
  toggleIsochrone: vi.fn(),
  isPicking: false,
  pickedLocation: null,
  onPickLocation: vi.fn(),
  ...over,
});

/** Renders `view` as a child route whose parent supplies `ctx` through Outlet context. */
export const withExplore = (view: ReactNode, ctx: ExploreContext) => (
  <MemoryRouter>
    <Routes>
      <Route element={<Outlet context={ctx} />}>
        <Route path="/" element={view} />
      </Route>
    </Routes>
  </MemoryRouter>
);
