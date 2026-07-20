import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Place } from '@/data/mockPlaces';

interface MapProps {
  places: Place[];
  selectedPlace: string | null;
  onSelectPlace: (id: string) => void;
  userLocation?: { lat: number; lng: number } | null;
  isochrone?: unknown | null;
}

// Color each pin by place type
const typeColor = (types: string[]) => {
  if (types.includes('library')) return '#3b82f6'; // blue
  if (types.includes('restaurant')) return '#a855f7'; // purple
  return '#f97316'; // orange (cafe / default)
};

// Free OpenStreetMap raster tiles — no API key required
const OSM_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

const Map: React.FC<MapProps> = ({ places, selectedPlace, onSelectPlace, userLocation, isochrone }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<Record<string, maplibregl.Marker>>({});
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize the map once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: OSM_STYLE,
      center: [-122.158, 37.432], // Stanford / Palo Alto
      zoom: 13.5,
    });

    map.current.on('load', () => setMapLoaded(true));

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // "Find me" control — requests the user's location, drops a live dot, and centers on them
    map.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserLocation: true,
      }),
      'top-right'
    );

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Rebuild markers whenever the visible places change
  useEffect(() => {
    if (!map.current) return;

    // Remove old markers
    Object.values(markers.current).forEach(m => m.remove());
    markers.current = {};

    places.forEach(place => {
      const el = document.createElement('div');
      el.className = 'ss-marker';
      el.style.setProperty('--marker-color', typeColor(place.types));

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([place.coords.lng, place.coords.lat])
        .addTo(map.current!);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectPlace(place.id);
      });

      markers.current[place.id] = marker;
    });
  }, [places, onSelectPlace]);

  // Draw / update / remove the reachable-area polygon
  useEffect(() => {
    const m = map.current;
    if (!m || !mapLoaded) return;

    const SRC = 'isochrone-src';
    const FILL = 'isochrone-fill';
    const LINE = 'isochrone-line';

    // No data → tear down any existing layers
    if (!isochrone) {
      if (m.getLayer(FILL)) m.removeLayer(FILL);
      if (m.getLayer(LINE)) m.removeLayer(LINE);
      if (m.getSource(SRC)) m.removeSource(SRC);
      return;
    }

    const data = isochrone as GeoJSON.FeatureCollection;

    const existing = m.getSource(SRC) as maplibregl.GeoJSONSource | undefined;
    if (existing) {
      existing.setData(data); // update in place — cheaper than rebuilding
      return;
    }

    m.addSource(SRC, { type: 'geojson', data });

    m.addLayer({
      id: FILL,
      type: 'fill',
      source: SRC,
      paint: {
        'fill-color': '#f97316',
        'fill-opacity': 0.12,
      },
    });

    m.addLayer({
      id: LINE,
      type: 'line',
      source: SRC,
      paint: {
        'line-color': '#f97316',
        'line-width': 2,
        'line-dasharray': [2, 2],
      },
    });
  }, [isochrone, mapLoaded]);

  // Fly to the user's location once we have it
  useEffect(() => {
    if (userLocation && map.current) {
      map.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
        duration: 1000,
      });
    }
  }, [userLocation]);

  // Highlight + fly to the selected place
  useEffect(() => {
    Object.entries(markers.current).forEach(([id, marker]) => {
      marker.getElement().classList.toggle('ss-marker-selected', id === selectedPlace);
    });

    if (selectedPlace && map.current) {
      const place = places.find(p => p.id === selectedPlace);
      if (place) {
        map.current.flyTo({
          center: [place.coords.lng, place.coords.lat],
          zoom: 15,
          duration: 800,
        });
      }
    }
  }, [selectedPlace, places]);

  return <div ref={mapContainer} className="absolute inset-0 rounded-lg overflow-hidden" />;
};

export default Map;
