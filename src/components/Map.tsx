import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Place } from '@/data/mockPlaces';

interface MapProps {
  places: Place[];
  selectedPlace: string | null;
  onSelectPlace: (id: string) => void;
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

const Map: React.FC<MapProps> = ({ places, selectedPlace, onSelectPlace }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<Record<string, maplibregl.Marker>>({});

  // Initialize the map once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: OSM_STYLE,
      center: [-122.158, 37.432], // Stanford / Palo Alto
      zoom: 13.5,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

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
