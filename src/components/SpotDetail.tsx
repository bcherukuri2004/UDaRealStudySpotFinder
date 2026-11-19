import { useEffect, useState } from "react";
import AmenityStamps from "@/components/AmenityStamps";
import { getHoursLabel, Place } from "@/data/mockPlaces";
import type { Review } from "@/data/reviews";
import { getFallbackGradient } from "@/lib/placeVisual";
import { mapsPlaceUrl } from "@/lib/maps";
import { Clipboard, ClipboardCheck, ExternalLink, Sparkles, X } from "lucide-react";

interface SpotDetailProps {
  place: Place | null;
  reviews: Review[];
  transportMode: "walking" | "driving";
  canReview: boolean;
  onClose: () => void;
  onRate: (place: Place) => void;
}

const REVIEW_COLORS = ["sticky-pink", "sticky-sky", "sticky-mint"];

/** Full-height overlay with everything about one spot, laid out as notes on the board. */
const SpotDetail = ({ place, reviews, transportMode, canReview, onClose, onRate }: SpotDetailProps) => {
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => setCopyState("idle"), [place?.id]);

  if (!place) return null;

  const showPhoto = !!place.photo_url && failedPhoto !== place.photo_url;
  const unrated = !!place.isDiscovered && !(place.reviewCount ?? 0);
  const typeLabel = place.types[0] ?? "place";

  const copyAddress = async () => {
    try {
      if (!navigator.clipboard) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(place.address);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={place.name} className="board fixed inset-0 z-30 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 pb-12 pt-5">
        <div className="mb-5 flex justify-end">
          <button aria-label="Close" onClick={onClose} className="chip chip-dark h-11 w-11 justify-center rounded-full p-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main note: photo, name, address */}
        <div className="note p-4">
          <div className="pin" />
          <div
            className="relative h-64 overflow-hidden border-[6px] border-white outline outline-1 outline-black/10 sm:h-80"
            style={{ background: getFallbackGradient(place.types) }}
          >
            {showPhoto && (
              <img
                src={place.photo_url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setFailedPhoto(place.photo_url ?? null)}
              />
            )}
            {showPhoto && place.photo_illustrative && (
              <span className="absolute bottom-2 right-2 rounded-full bg-black/65 px-3 py-1 text-sm text-white">
                Illustrative photo
              </span>
            )}
          </div>
          {showPhoto && place.photo_credit && (
            <p className="mt-2 text-sm text-muted-foreground">
              <a href={place.photo_credit.url} target="_blank" rel="noopener noreferrer" className="underline">
                {place.photo_credit.text}
              </a>
            </p>
          )}

          <h2 className="font-marker mt-4 break-words text-4xl leading-tight">{place.name}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-lg">
            <span className="font-label">{typeLabel}</span>
            <span>★ <span className="font-bold">{place.rating}</span>{!!place.reviewCount && ` (${place.reviewCount})`}</span>
            <span className="font-bold">{"$".repeat(place.price_level)}</span>
            <span>
              {transportMode === "walking"
                ? `${place.travel_time.walking_min} min walk`
                : `${place.travel_time.driving_min} min drive`}
            </span>
          </div>
          {!place.isDiscovered && <p className="mt-1 text-base text-muted-foreground">{getHoursLabel(place.hours)}</p>}

          <p className="font-label mt-5">Address</p>
          <div
            aria-label="Address"
            className="mt-1 select-all break-words rounded border-2 border-dashed border-muted-foreground bg-muted px-3 py-3 text-lg"
          >
            {place.address}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" onClick={copyAddress} className="chip flex-1 justify-center">
              {copyState === "copied" ? (
                <ClipboardCheck className="mr-2 h-5 w-5" />
              ) : (
                <Clipboard className="mr-2 h-5 w-5" />
              )}
              {copyState === "copied" ? "Copied!" : "Copy address"}
            </button>
            <a
              href={mapsPlaceUrl(place.name, place.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="chip chip-dark flex-1 justify-center"
            >
              View on Google Maps
              <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <p role="status" className="mt-2 text-base text-destructive">
            {copyState === "failed" ? "Couldn't copy — select the address above" : ""}
          </p>
        </div>

        {/* What people say */}
        <div className="note note-tilt-right mt-9 p-4">
          <div className="tape" />
          <h3 className="font-marker text-2xl">What people say</h3>
          {unrated ? (
            <div className="mt-3 rounded border-2 border-dashed border-muted-foreground p-4 text-center">
              <Sparkles className="mx-auto mb-2 h-6 w-6" />
              <p className="text-lg font-bold">Not yet rated</p>
              <p className="mt-1 text-base text-muted-foreground">
                No one's reviewed the WiFi, outlets, or noise here yet. Be the first to help others out!
              </p>
              <button className="chip mt-3" onClick={() => onRate(place)} disabled={!canReview}>
                Be the first to review
              </button>
            </div>
          ) : (
            <div className="mt-3">
              <AmenityStamps amenities={place.amenities} />
            </div>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="mt-8 space-y-5">
            <p className="font-marker text-2xl text-[hsl(var(--ink))] dark:text-white">
              {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </p>
            {reviews.slice(0, 3).map((r, i) => (
              <div
                key={r.id}
                className={`sticky-note ${REVIEW_COLORS[i % 3]} p-4 ${i % 2 ? "rotate-1" : "-rotate-1"}`}
              >
                <p className="text-lg font-bold">{r.author_name || "Anonymous"}</p>
                {r.comment && <p className="mt-1 break-words text-lg">{r.comment}</p>}
                <p className="mt-1 text-base">
                  WiFi {r.wifi} · Outlets {r.outlets} · Noise {r.noise} · Seating {r.seating}
                </p>
              </div>
            ))}
          </div>
        )}

        {!unrated && (
          <button className="chip chip-dark mt-8 w-full justify-center" onClick={() => onRate(place)} disabled={!canReview}>
            <Sparkles className="mr-2 h-4 w-4" />
            Rate this spot
          </button>
        )}
      </div>
    </div>
  );
};

export default SpotDetail;
