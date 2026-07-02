import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Settings2 } from 'lucide-react';

interface MapProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  mapboxToken?: string;
}

const Map: React.FC<MapProps> = ({ onLocationSelect, mapboxToken }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-122.0312, 37.3318], // Default to Stanford area - perfect for study spots
      zoom: 14,
      pitch: 0,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Handle map clicks for location selection
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      onLocationSelect?.(lat, lng);
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, onLocationSelect]);

  const handleTokenSubmit = () => {
    if (tokenInput.trim()) {
      setIsTokenSet(true);
    }
  };

  if (!mapboxToken && !isTokenSet) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-surface border border-border rounded-lg">
        <div className="text-center p-8 max-w-md">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Setup Mapbox</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your Mapbox public token to display the interactive map. 
            Get your token at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>
          </p>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSI..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="text-sm"
            />
            <Button onClick={handleTokenSubmit} className="w-full">
              Initialize Map
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const actualToken = mapboxToken || tokenInput;

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg overflow-hidden" />
      
      {/* Search Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search for cafes, libraries, study spots..."
              className="pl-10 pr-4 bg-card/95 backdrop-blur border-border shadow-medium"
            />
          </div>
          <Button variant="outline" size="icon" className="bg-card/95 backdrop-blur border-border shadow-medium">
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Map;