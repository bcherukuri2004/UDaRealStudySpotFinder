import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Place } from '@/data/mockPlaces';
import { submitReview, ReviewInput } from '@/data/reviews';
import { Wifi, Zap, Volume2, Armchair, X, Loader2 } from 'lucide-react';

interface ReviewFormProps {
  place: Place | null;
  onClose: () => void;
  onSubmitted: () => void;
}

// noise is inverted on purpose: 1 = silent is GOOD, 5 = loud is bad
const AMENITIES = [
  { key: 'wifi',    label: 'WiFi Quality',    icon: Wifi,     low: 'Unusable', high: 'Excellent' },
  { key: 'outlets', label: 'Power Outlets',   icon: Zap,      low: 'None',     high: 'Plenty' },
  { key: 'noise',   label: 'Noise Level',     icon: Volume2,  low: 'Silent',   high: 'Very loud' },
  { key: 'seating', label: 'Seating Comfort', icon: Armchair, low: 'Poor',     high: 'Great' },
] as const;

type AmenityKey = typeof AMENITIES[number]['key'];

const ReviewForm: React.FC<ReviewFormProps> = ({ place, onClose, onSubmitted }) => {
  const [ratings, setRatings] = useState<Record<AmenityKey, number>>({
    wifi: 0, outlets: 0, noise: 0, seating: 0,
  });
  const [comment, setComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!place) return null;

  const allRated = AMENITIES.every(a => ratings[a.key] > 0);

  const handleSubmit = async () => {
    if (!allRated) {
      setError('Please rate all four categories.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitReview(place, {
        ...ratings,
        comment,
        authorName,
      } as ReviewInput);
      onSubmitted();
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-strong w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold">Rate this spot</h2>
            <p className="text-base text-muted-foreground mt-0.5">{place.name}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 shrink-0">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Rating rows */}
          {AMENITIES.map(({ key, label, icon: Icon, low, high }) => (
            <div key={key}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-base font-semibold">{label}</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${label}: ${n} out of 5`}
                    aria-pressed={ratings[key] === n}
                    onClick={() => setRatings(r => ({ ...r, [key]: n }))}
                    className={`flex-1 h-11 rounded-lg border text-base font-medium transition-colors
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        ratings[key] === n
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:border-primary/50'
                      }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{low}</span>
                <span>{high}</span>
              </div>
            </div>
          ))}

          {/* Optional comment */}
          <div>
            <label className="text-base font-semibold block mb-2">
              Comment <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Outlets are mostly along the back wall, gets busy after 3pm…"
              className="text-base"
            />
            <p className="text-xs text-muted-foreground mt-1">{comment.length}/1000</p>
          </div>

          {/* Optional name */}
          <div>
            <label className="text-base font-semibold block mb-2">
              Your name <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              maxLength={60}
              placeholder="Leave blank to post anonymously"
              className="text-base h-11"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11 text-base">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !allRated}
            className="flex-1 h-11 text-base"
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {submitting ? 'Posting…' : 'Post review'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
