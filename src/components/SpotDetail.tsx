import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getHoursLabel, Place } from "@/data/mockPlaces";
import type { Review } from "@/data/reviews";
import { getFallbackGradient } from "@/lib/placeVisual";
import {
  Armchair, Clock, DollarSign, Navigation, Sparkles, Star, Volume2, Wifi, X, Zap,
} from "lucide-react";

interface SpotDetailProps {
  place: Place | null;
  reviews: Review[];
  transportMode: "walking" | "driving";
  canReview: boolean;
  onClose: () => void;
  onRate: (place: Place) => void;
}

const getNoiseLabel = (noise: number) => {
  if (noise <= 1.5) return "Very Quiet";
  if (noise <= 2.5) return "Quiet";
  if (noise <= 3.5) return "Moderate";
  return "Loud";
};

const directionsUrl = (address: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

/** Full-height overlay with everything about one spot. */
const SpotDetail = ({ place, reviews, transportMode, canReview, onClose, onRate }: SpotDetailProps) => {
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  if (!place) return null;

  const showPhoto = !!place.photo_url && failedPhoto !== place.photo_url;
  const unrated = !!place.isDiscovered && !(place.reviewCount ?? 0);
  const typeLabel = (place.types[0] ?? "place").toUpperCase();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={place.name}
      className="fixed inset-0 z-30 overflow-y-auto bg-background"
    >
      <div className="mx-auto max-w-3xl pb-10">
        {/* Hero */}
        <div className="relative h-72 w-full overflow-hidden sm:h-96" style={{ background: getFallbackGradient(place.types) }}>
          {showPhoto && (
            <img
              src={place.photo_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => setFailedPhoto(place.photo_url ?? null)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <Button
            variant="secondary"
            size="icon"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-4 h-11 w-11 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <h2 className="break-words font-serif text-4xl font-semibold italic leading-tight">{place.name}</h2>
            <p className="font-label mt-2 break-words text-white/90">
              {typeLabel} · {place.address}
            </p>
          </div>
        </div>

        <div className="space-y-6 px-6 pt-6">
          {/* Rating / price / time */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-base">
            <div className="flex items-center gap-1.5">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-semibold">{place.rating}</span>
              {!!place.reviewCount && (
                <span className="text-muted-foreground">({place.reviewCount})</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">{"$".repeat(place.price_level)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>
                {transportMode === "walking"
                  ? `${place.travel_time.walking_min} min walk`
                  : `${place.travel_time.driving_min} min drive`}
              </span>
            </div>
          </div>
          {!place.isDiscovered && (
            <p className="text-base text-muted-foreground">{getHoursLabel(place.hours)}</p>
          )}

          {unrated ? (
            <div className="rounded-xl border border-dashed border-border p-5 text-center">
              <Sparkles className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-lg font-medium">Not yet rated</p>
              <p className="mt-1 text-base text-muted-foreground">
                No one's reviewed the WiFi, outlets, or noise here yet. Be the first to help others out!
              </p>
              <Button variant="outline" className="mt-3 h-11 text-base" onClick={() => onRate(place)} disabled={!canReview}>
                Be the first to review
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {[
                { Icon: Wifi, label: "WiFi", value: place.amenities.wifi },
                { Icon: Zap, label: "Outlets", value: place.amenities.outlets },
                { Icon: Volume2, label: "Noise", value: getNoiseLabel(place.amenities.noise) },
                { Icon: Armchair, label: "Seating", value: place.amenities.seating },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl bg-muted/60 p-4">
                  <Icon className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-label text-muted-foreground">{label}</div>
                    <div className="text-lg font-semibold">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {reviews.length > 0 && (
            <div className="space-y-2">
              <p className="text-base font-semibold text-muted-foreground">
                {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </p>
              {reviews.slice(0, 3).map((r) => (
                <div key={r.id} className="rounded-xl bg-muted/40 p-4">
                  <p className="text-base font-medium">{r.author_name || "Anonymous"}</p>
                  {r.comment && <p className="mt-1 break-words text-base text-muted-foreground">{r.comment}</p>}
                  <p className="mt-1 text-sm text-muted-foreground">
                    WiFi {r.wifi} · Outlets {r.outlets} · Noise {r.noise} · Seating {r.seating}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!unrated && (
            <Button variant="outline" className="h-12 w-full gap-2 text-base" onClick={() => onRate(place)} disabled={!canReview}>
              <Sparkles className="h-4 w-4" />
              Rate this spot
            </Button>
          )}

          <a
            href={directionsUrl(place.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-secondary text-base font-medium text-secondary-foreground"
          >
            <Navigation className="h-4 w-4" />
            Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
};

export default SpotDetail;
