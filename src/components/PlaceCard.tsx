import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getFallbackGradient } from '@/lib/placeVisual';
import { isOpenNow, getHoursLabel, Hours } from '@/data/mockPlaces';
import {
  Wifi,
  Zap,
  Volume2,
  Armchair,
  Star,
  Sparkles,
  Users
} from 'lucide-react';

interface PlaceCardProps {
  place: {
    id: string;
    name: string;
    rating?: number;
    price_level?: number;
    address: string;
    types?: string[];
    distance?: number;
    travel_time?: {
      walking_min: number;
      driving_min: number;
    };
    hours?: Hours;
    amenities?: {
      wifi?: number;
      outlets?: number;
      noise?: number;
      seating?: number;
    };
    badges?: string[];
    photo_url?: string;
    photo_illustrative?: boolean;
    isDiscovered?: boolean;
    reviewCount?: number;
    isUserAdded?: boolean;
  };
  onSelect?: (placeId: string) => void;
  transportMode?: 'walking' | 'driving';
  isSelected?: boolean;
  variant?: 'hero' | 'tile';
}

const AMENITY_ICONS = { wifi: Wifi, outlets: Zap, noise: Volume2, seating: Armchair } as const;

const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onSelect,
  transportMode = 'walking',
  isSelected = false,
  variant = 'tile',
}) => {
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const isHero = variant === 'hero';
  const showPhoto = !!place.photo_url && failedPhoto !== place.photo_url;
  const unrated = !!place.isDiscovered && !(place.reviewCount ?? 0);
  const typeLabel = (place.types?.[0] ?? 'place').toUpperCase();
  const minutes = place.travel_time
    ? transportMode === 'walking' ? place.travel_time.walking_min : place.travel_time.driving_min
    : null;
  const subtitle = [typeLabel, minutes !== null ? `${minutes} MIN ${transportMode === 'walking' ? 'WALK' : 'DRIVE'}` : null]
    .filter(Boolean)
    .join(' · ');

  const statusBadge = 'bg-background/90 text-foreground border-transparent text-sm';

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${place.name}${isSelected ? ', selected' : ''}`}
      data-variant={variant}
      className={`group relative overflow-hidden rounded-3xl cursor-pointer outline-none transition-all duration-200 hover:shadow-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        isHero ? 'h-80' : 'h-64'
      } ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={() => onSelect?.(place.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(place.id);
        }
      }}
    >
      {/* Photo, or warm artwork when there is none (or it failed to load) */}
      <div
        data-fallback={showPhoto ? undefined : ''}
        className="absolute inset-0"
        style={{ background: getFallbackGradient(place.types) }}
      >
        {showPhoto && (
          <img
            src={place.photo_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
            onError={() => setFailedPhoto(place.photo_url ?? null)}
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/0" />
      {showPhoto && place.photo_illustrative && (
        <span className="absolute bottom-3 right-4 rounded-full bg-black/65 px-3 py-1 text-sm text-white">
          Illustrative photo
        </span>
      )}

      {/* Status badges */}
      <div className="absolute left-4 top-4 right-4 flex flex-wrap items-center gap-2">
        {place.hours && !place.isDiscovered && (
          <Badge className={statusBadge} title={getHoursLabel(place.hours)}>
            {isOpenNow(place.hours) ? 'Open' : 'Closed'}
          </Badge>
        )}
        {place.isUserAdded && <Badge className={statusBadge}>Community</Badge>}
        {place.isDiscovered && !place.isUserAdded && unrated && <Badge className={statusBadge}>New</Badge>}
        {(place.reviewCount ?? 0) > 0 && (
          <Badge className={`${statusBadge} gap-1`}>
            <Users className="h-3 w-3" />
            {place.reviewCount}
          </Badge>
        )}
        {place.rating ? (
          <Badge className={`${statusBadge} ml-auto gap-1`}>
            <Star className="h-4 w-4 fill-warning text-warning" />
            {place.rating}
          </Badge>
        ) : null}
      </div>

      {/* Text over the photo */}
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <h3
          className={`font-marker leading-tight line-clamp-2 break-words ${
            isHero ? 'text-4xl' : 'text-2xl'
          }`}
        >
          {place.name}
        </h3>
        <p className="font-label mt-1 truncate text-white/90">{subtitle}</p>

        {unrated ? (
          <p className="mt-2 flex items-center gap-2 text-base text-white/90">
            <Sparkles className="h-4 w-4" />
            Not yet rated — be the first to review
          </p>
        ) : place.amenities ? (
          <div className="mt-3 flex gap-2">
            {Object.entries(place.amenities).map(([type, score]) => {
              const Icon = AMENITY_ICONS[type as keyof typeof AMENITY_ICONS];
              if (!Icon || !score) return null;
              return (
                <span
                  key={type}
                  title={type === 'noise' ? `Noise: ${score.toFixed(1)}` : `${type}: ${score.toFixed(1)}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/15"
                >
                  <Icon className="h-4 w-4" />
                </span>
              );
            })}
          </div>
        ) : null}
      </div>
    </Card>
  );
};

export default PlaceCard;
