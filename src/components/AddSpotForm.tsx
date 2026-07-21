import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Place } from '@/data/mockPlaces';
import { addUserPlace } from '@/data/userPlaces';
import { Coffee, BookOpen, Utensils, Briefcase, X, Loader2, MapPin, Crosshair } from 'lucide-react';

interface AddSpotFormProps {
  open: boolean;
  onClose: () => void;
  onAdded: (place: Place) => void;
  /** Coordinates chosen by clicking the map. */
  picked: { lat: number; lng: number } | null;
  /** Turn map-picking mode on/off. */
  onStartPicking: () => void;
  isPicking: boolean;
  userLocation: { lat: number; lng: number } | null;
  onUseMyLocation: () => void;
}

const TYPES = [
  { id: 'cafe',       label: 'Café',      icon: Coffee },
  { id: 'library',    label: 'Library',   icon: BookOpen },
  { id: 'coworking',  label: 'Coworking', icon: Briefcase },
  { id: 'restaurant', label: 'Restaurant', icon: Utensils },
];

const AddSpotForm: React.FC<AddSpotFormProps> = ({
  open, onClose, onAdded, picked, onStartPicking, isPicking, userLocation, onUseMyLocation,
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [types, setTypes] = useState<string[]>(['cafe']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const toggleType = (id: string) =>
    setTypes(t => (t.includes(id) ? t.filter(x => x !== id) : [...t, id]));

  const reset = () => {
    setName(''); setAddress(''); setTypes(['cafe']); setError(null);
  };

  const handleSubmit = async () => {
    if (!picked) { setError('Pick the location on the map first.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const place = await addUserPlace({
        name, address, types,
        lat: picked.lat, lng: picked.lng,
      });
      onAdded(place);
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add this spot.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 pointer-events-none">
      {/* Panel is pointer-events-auto so the map behind stays clickable for picking */}
      <div className="bg-card border border-border rounded-2xl shadow-strong w-full max-w-md pointer-events-auto max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold">Add a spot</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Know a place that isn't listed? Put it on the map.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 shrink-0">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Name */}
          <div>
            <label className="text-base font-semibold block mb-2">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
              placeholder="e.g. Tamper Room"
              className="h-11 text-base"
            />
          </div>

          {/* Address */}
          <div>
            <label className="text-base font-semibold block mb-2">
              Address <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              maxLength={300}
              placeholder="43737 Boscell Rd, Fremont, CA"
              className="h-11 text-base"
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-base font-semibold block mb-2">What kind of place?</label>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  type="button"
                  variant={types.includes(id) ? 'default' : 'outline'}
                  onClick={() => toggleType(id)}
                  className="justify-start h-11"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-base font-semibold block mb-2">Location</label>
            {picked ? (
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 mb-2">
                <MapPin className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-sm">
                  {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-2">
                No location chosen yet.
              </p>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={isPicking ? 'default' : 'outline'}
                onClick={onStartPicking}
                className="flex-1 h-11"
              >
                <Crosshair className="h-4 w-4 mr-2" />
                {isPicking ? 'Click the map…' : 'Pick on map'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onUseMyLocation}
                className="flex-1 h-11"
                disabled={!userLocation}
                title={userLocation ? 'Use my current location' : 'Location not available yet'}
              >
                <MapPin className="h-4 w-4 mr-2" />
                I'm here
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex gap-3 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11 text-base">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !name.trim() || !picked}
            className="flex-1 h-11 text-base"
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {submitting ? 'Adding…' : 'Add spot'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddSpotForm;
