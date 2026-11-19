import React, { useState } from 'react';
import AmenityStamps from '@/components/AmenityStamps';
import { getFallbackGradient } from '@/lib/placeVisual';
import { isOpenNow, getHoursLabel, Hours } from '@/data/mockPlaces';
import { Sparkles, Users } from 'lucide-react';

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
  tilt?: 'left' | 'right' | 'none';
}

const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onSelect,
  transportMode = 'walking',
  isSelected = false,
  variant = 'tile',
  tilt = 'none',
}) => {
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const isHero = variant === 'hero';
  const showPhoto = !!place.photo_url && failedPhoto !== place.photo_url;
  const unrated = !!place.isDiscovered && !(place.reviewCount ?? 0);
  const typeLabel = place.types?.[0] ?? 'place';
  const minutes = place.travel_time
    ? transportMode === 'walking' ? place.travel_time.walking_min : place.travel_time.driving_min
    : null;
  const meta = [
    typeLabel,
    minutes !== null ? `${minutes} min ${transportMode === 'walking' ? 'walk' : 'drive'}` : null,
    place.rating ? `★ ${place.rating}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${place.name}${isSelected ? ', selected' : ''}`}
      data-variant={variant}
      className={`note cursor-pointer p-3 outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--sticky))] ${
        tilt === 'left' ? 'note-tilt-left' : tilt === 'right' ? 'note-tilt-right' : ''
      } ${isSelected ? 'ring-4 ring-[hsl(var(--ink))]' : ''}`}
      onClick={() => onSelect?.(place.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(place.id);
        }
      }}
    >
      {isHero ? <div className="pin" /> : <div className="tape" />}

      {/* White-framed photo, or a warm gradient when there is none (or it failed) */}
      <div
        data-fallback={showPhoto ? undefined : ''}
        className={`relative overflow-hidden border-[6px] border-white outline outline-1 outline-black/10 ${
          isHero ? 'h-56' : 'h-40'
        }`}
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
        {showPhoto && place.photo_illustrative && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/65 px-3 py-1 text-sm text-white">
            Illustrative photo
          </span>
        )}
        {/* Status stickers */}
        <div className="absolute left-2 top-2 flex flex-wrap gap-2">
          {place.hours && !place.isDiscovered && (
            <span className="sticky-badge" title={getHoursLabel(place.hours)}>
              {isOpenNow(place.hours) ? 'Open' : 'Closed'}
            </span>
          )}
          {place.isUserAdded && <span className="sticky-badge sticky-mint">Community</span>}
          {place.isDiscovered && !place.isUserAdded && unrated && <span className="sticky-badge sticky-mint">New</span>}
          {(place.reviewCount ?? 0) > 0 && (
            <span className="sticky-badge sticky-sky inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {place.reviewCount}
            </span>
          )}
        </div>
      </div>

      <div className="px-1 pb-1 pt-3">
        <h3
          className={`font-marker leading-tight line-clamp-2 break-words ${
            isHero ? 'text-3xl' : 'text-2xl'
          }`}
        >
          {place.name}
        </h3>
        <p className="mt-1 truncate text-base text-muted-foreground">{meta}</p>

        <div className="mt-3">
          {unrated ? (
            <p className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4" />
              Not yet rated — be the first to review
            </p>
          ) : place.amenities ? (
            <AmenityStamps amenities={place.amenities} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
