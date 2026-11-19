import React from 'react';
import Map from '@/components/Map';
import { useExplore } from '@/pages/exploreContext';
import { Navigation } from 'lucide-react';

const MapView = () => {
  const {
    places, selectedPlace, toggleSelect, userLocation, isochrone, showIsochrone,
    toggleIsochrone, isPicking, pickedLocation, onPickLocation, filters,
  } = useExplore();

  return (
        <div className="h-full relative">
          <Map
            places={places}
            selectedPlace={selectedPlace}
            onSelectPlace={toggleSelect}
            userLocation={userLocation}
            isochrone={isochrone}
            pickingLocation={isPicking}
            onPickLocation={onPickLocation}
            pickedLocation={pickedLocation}
          />

          {/* Reachable-area toggle */}
          {userLocation && (
            <button
              onClick={toggleIsochrone}
              aria-pressed={showIsochrone}
              className={`chip absolute top-4 left-4 z-10 gap-2 ${showIsochrone ? 'chip-dark' : ''}`}
              title="Show the area reachable within your travel-time filter"
            >
              <Navigation className="h-4 w-4" />
              {filters.withinMinutes} min {filters.transportMode === 'walking' ? 'walk' : 'drive'} zone
            </button>
          )}
        </div>
  );
};

export default MapView;
