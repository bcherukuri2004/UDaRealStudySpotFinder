import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wifi, 
  Zap, 
  Volume2, 
  Armchair, 
  Star, 
  Clock, 
  DollarSign,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface PlaceCardProps {
  place: {
    id: string;
    name: string;
    rating?: number;
    price_level?: number;
    address: string;
    distance?: number;
    travel_time?: {
      walking_min: number;
      driving_min: number;
    };
    open_now?: boolean;
    amenities?: {
      wifi?: number;
      outlets?: number;
      noise?: number;
      seating?: number;
    };
    badges?: string[];
    photo_url?: string;
  };
  variant?: 'compact' | 'detailed';
  onSelect?: (placeId: string) => void;
  transportMode?: 'walking' | 'driving';
  isSelected?: boolean;
}

const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  variant = 'compact',
  onSelect,
  transportMode = 'walking',
  isSelected = false,
}) => {
  const amenityIcons = {
    wifi: Wifi,
    outlets: Zap,
    noise: Volume2,
    seating: Armchair,
  };

  const getAmenityColor = (type: string, score: number) => {
    if (score >= 4.0) return `amenity-${type}`;
    if (score >= 3.0) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getNoiseDescription = (noise?: number) => {
    if (!noise) return '';
    if (noise <= 2) return 'Very Quiet';
    if (noise <= 3) return 'Quiet';
    if (noise <= 4) return 'Moderate';
    return 'Loud';
  };

  const renderPriceLevel = (level?: number) => {
    if (!level) return null;
    return (
      <div className="flex items-center">
        {Array.from({ length: 4 }, (_, i) => (
          <DollarSign 
            key={i} 
            className={`h-3 w-3 ${
              i < level ? 'text-foreground' : 'text-muted-foreground/40'
            }`} 
          />
        ))}
      </div>
    );
  };

  return (
    <Card
      className={`hover:shadow-medium transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-primary ring-2 ring-primary/30'
          : 'border-border/50 hover:border-border'
      }`}
      onClick={() => onSelect?.(place.id)}
    >
      <CardContent className="p-6">
        <div className="flex gap-3">
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2.5">
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-semibold text-foreground truncate mb-1.5">
                  {place.name}
                </h3>
                <div className="flex items-center gap-3 text-base text-muted-foreground">
                  {place.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span>{place.rating}</span>
                    </div>
                  )}
                  {renderPriceLevel(place.price_level)}
                  {place.travel_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {transportMode === 'walking' ? place.travel_time.walking_min : place.travel_time.driving_min}min {transportMode === 'walking' ? 'walk' : 'drive'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {place.open_now !== undefined && (
                <Badge variant={place.open_now ? "default" : "secondary"} className="ml-2 text-xs shrink-0">
                  {place.open_now ? "Open" : "Closed"}
                </Badge>
              )}
            </div>

            {/* Amenity Scores */}
            {place.amenities && (
              <div className="flex gap-2 mb-2.5 flex-wrap">
                {Object.entries(place.amenities).map(([type, score]) => {
                  const IconComponent = amenityIcons[type as keyof typeof amenityIcons];
                  if (!IconComponent || !score) return null;

                  return (
                    <div
                      key={type}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-base ${getAmenityColor(type, score)}`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium">
                        {type === 'noise' ? getNoiseDescription(score) : score.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Badges */}
            {place.badges && place.badges.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {place.badges.map((badge, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-base px-3 py-1"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            )}

            {variant === 'detailed' && (
              <p className="text-sm text-muted-foreground mt-2 truncate">
                {place.address}
              </p>
            )}
          </div>
        </div>

        {variant === 'detailed' && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
            <Button variant="outline" size="sm" className="flex-1">
              <ExternalLink className="h-3 w-3 mr-1" />
              Details
            </Button>
            <Button size="sm" className="flex-1">
              <MapPin className="h-3 w-3 mr-1" />
              Directions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaceCard;