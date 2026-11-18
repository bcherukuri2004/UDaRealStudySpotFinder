import { useOutletContext } from "react-router-dom";
import type { Place, SortOption } from "@/data/mockPlaces";

export type LatLng = { lat: number; lng: number };

export interface Filters {
  types: string[];
  openNow: boolean;
  priceRange: [number, number];
  amenityMinimums: { wifi: number; outlets: number; noise: number; seating: number };
  withinMinutes: number;
  transportMode: "walking" | "driving";
}

/** State and actions that Index owns and shares with the Discover and Map views. */
export interface ExploreContext {
  places: Place[];
  filters: Filters;
  setFilters: (f: Filters) => void;
  resetFilters: () => void;
  activeFilterCount: number;
  openFilters: () => void;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isDiscovering: boolean;
  discoverError: string | null;
  discoveredCount: number;
  handleDiscover: () => void;
  handleSearchNearby: () => void;
  startAddSpot: () => void;
  canAddSpot: boolean;
  selectedPlace: string | null;
  toggleSelect: (id: string) => void;
  quietCount: number;
  openCount: number;
  userLocation: LatLng | null;
  isochrone: unknown | null;
  showIsochrone: boolean;
  toggleIsochrone: () => void;
  isPicking: boolean;
  pickedLocation: LatLng | null;
  onPickLocation: (lat: number, lng: number) => void;
}

export const useExplore = () => useOutletContext<ExploreContext>();
