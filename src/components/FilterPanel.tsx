import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Wifi, 
  Zap, 
  Volume2, 
  Armchair, 
  Clock,
  DollarSign,
  Coffee,
  BookOpen,
  Utensils,
  X,
  Car,
  User
} from 'lucide-react';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    types: string[];
    openNow: boolean;
    priceRange: [number, number];
    amenityMinimums: {
      wifi: number;
      outlets: number;
      noise: number; // inverted: lower is better
      seating: number;
    };
    withinMinutes: number;
    transportMode: 'walking' | 'driving';
  };
  onFiltersChange: (filters: any) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
}) => {
  const placeTypes = [
    { id: 'cafe', label: 'Cafes', icon: Coffee },
    { id: 'library', label: 'Libraries', icon: BookOpen },
    { id: 'restaurant', label: 'Restaurants', icon: Utensils },
  ];

  const amenityConfig = [
    { 
      key: 'wifi', 
      label: 'WiFi Quality', 
      icon: Wifi, 
      min: 1, 
      max: 5, 
      step: 0.5,
      description: 'Minimum WiFi rating'
    },
    { 
      key: 'outlets', 
      label: 'Power Outlets', 
      icon: Zap, 
      min: 1, 
      max: 5, 
      step: 0.5,
      description: 'Availability of charging spots'
    },
    { 
      key: 'seating', 
      label: 'Seating Comfort', 
      icon: Armchair, 
      min: 1, 
      max: 5, 
      step: 0.5,
      description: 'Quality and availability of seating'
    },
  ];

  const handleTypeToggle = (typeId: string) => {
    const newTypes = filters.types.includes(typeId)
      ? filters.types.filter(t => t !== typeId)
      : [...filters.types, typeId];
    
    onFiltersChange({ ...filters, types: newTypes });
  };

  const handleAmenityChange = (amenity: string, value: number[]) => {
    onFiltersChange({
      ...filters,
      amenityMinimums: {
        ...filters.amenityMinimums,
        [amenity]: value[0],
      },
    });
  };

  const handleNoiseChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      amenityMinimums: {
        ...filters.amenityMinimums,
        noise: value[0],
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-card border-l border-border shadow-strong overflow-y-auto">
        <Card className="h-full border-0 rounded-none">
          <CardHeader className="border-b border-border px-8 py-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">Filters</CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10">
                <X className="h-6 w-6" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 p-8">
            {/* Place Types */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Place Types</h3>
              <div className="grid grid-cols-2 gap-3">
                {placeTypes.map((type) => {
                  const IconComponent = type.icon;
                  const isSelected = filters.types.includes(type.id);

                  return (
                    <Button
                      key={type.id}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => handleTypeToggle(type.id)}
                      className="justify-start h-auto p-4"
                    >
                      <IconComponent className="h-5 w-5 mr-3" />
                      <span className="text-base">{type.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Transport Mode Toggle */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                Transportation
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={filters.transportMode === 'walking' ? "default" : "outline"}
                  onClick={() => onFiltersChange({ ...filters, transportMode: 'walking' })}
                  className="justify-start h-auto p-4"
                >
                  <User className="h-5 w-5 mr-3" />
                  <span className="text-base">Walking</span>
                </Button>
                <Button
                  variant={filters.transportMode === 'driving' ? "default" : "outline"}
                  onClick={() => onFiltersChange({ ...filters, transportMode: 'driving' })}
                  className="justify-start h-auto p-4"
                >
                  <Car className="h-5 w-5 mr-3" />
                  <span className="text-base">Driving</span>
                </Button>
              </div>
            </div>

            {/* Open Now Toggle */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-semibold">Open Now</span>
                </div>
                <Switch
                  checked={filters.openNow}
                  onCheckedChange={(checked) =>
                    onFiltersChange({ ...filters, openNow: checked })
                  }
                />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                Price Range
              </h3>
              <div className="px-2">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) =>
                    onFiltersChange({ ...filters, priceRange: [Math.max(1, value[0]), Math.min(3, value[1])] as [number, number] })
                  }
                  max={3}
                  min={1}
                  step={1}
                  className="mb-3"
                />
                <div className="flex justify-between items-center text-base text-muted-foreground">
                  <span>$</span>
                  <span className="text-foreground font-semibold text-lg">
                    {"$".repeat(Math.max(1, Math.min(3, filters.priceRange[0])))} - {"$".repeat(Math.max(1, Math.min(3, filters.priceRange[1])))}
                  </span>
                  <span>$$$</span>
                </div>
              </div>
            </div>

            {/* Travel Time */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Within Walking Distance</h3>
              <div className="px-2">
                <Slider
                  value={[filters.withinMinutes]}
                  onValueChange={(value) =>
                    onFiltersChange({ ...filters, withinMinutes: value[0] })
                  }
                  max={30}
                  min={5}
                  step={5}
                  className="mb-3"
                />
                <div className="text-center text-base text-muted-foreground">
                  {filters.withinMinutes} minutes {filters.transportMode === 'walking' ? 'walk' : 'drive'}
                </div>
              </div>
            </div>

            {/* Noise Level */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-muted-foreground" />
                Maximum Noise Level
              </h3>
              <div className="px-2">
                <Slider
                  value={[filters.amenityMinimums.noise]}
                  onValueChange={handleNoiseChange}
                  max={5}
                  min={1}
                  step={0.5}
                  className="mb-3"
                />
                <div className="flex justify-between items-center text-base text-muted-foreground">
                  <span>Very Quiet</span>
                  <span className="text-foreground font-semibold text-lg">{filters.amenityMinimums.noise}</span>
                  <span>Loud</span>
                </div>
              </div>
            </div>

            {/* Other Amenities */}
            {amenityConfig.map((amenity) => {
              const IconComponent = amenity.icon;

              return (
                <div key={amenity.key}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    {amenity.label}
                  </h3>
                  <div className="px-2">
                    <Slider
                      value={[filters.amenityMinimums[amenity.key as keyof typeof filters.amenityMinimums]]}
                      onValueChange={(value) => handleAmenityChange(amenity.key, value)}
                      max={amenity.max}
                      min={amenity.min}
                      step={amenity.step}
                      className="mb-3"
                    />
                    <div className="flex justify-between items-center text-base text-muted-foreground">
                      <span>{amenity.min}</span>
                      <span className="text-foreground font-semibold text-lg">
                        {filters.amenityMinimums[amenity.key as keyof typeof filters.amenityMinimums]}
                      </span>
                      <span>{amenity.max}</span>
                    </div>
                    <p className="text-base text-muted-foreground mt-2">
                      {amenity.description}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Active Filters Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Active Filters</h3>
              <div className="flex flex-wrap gap-2">
                {filters.types.map((type) => (
                  <Badge key={type} variant="secondary" className="text-base px-3 py-1">
                    {placeTypes.find(t => t.id === type)?.label}
                  </Badge>
                ))}
                {filters.openNow && (
                  <Badge variant="secondary" className="text-base px-3 py-1">Open Now</Badge>
                )}
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {"$".repeat(Math.max(1, Math.min(3, filters.priceRange[0])))} - {"$".repeat(Math.max(1, Math.min(3, filters.priceRange[1])))}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FilterPanel;
