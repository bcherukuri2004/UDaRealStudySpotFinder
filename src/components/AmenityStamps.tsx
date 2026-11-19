export type AmenityKind = "wifi" | "outlets" | "noise" | "seating";
export type StampState = "yes" | "no" | "unknown";

const LABELS: Record<AmenityKind, { name: string; short: string }> = {
  wifi: { name: "Wifi", short: "WIFI" },
  outlets: { name: "Outlets", short: "PLUGS" },
  noise: { name: "Quiet", short: "QUIET" },
  seating: { name: "Seating", short: "SEATS" },
};

/**
 * Turns an existing 1-5 score into a stamp. Noise is inverted (low noise = quiet = yes).
 * Anything that isn't a finite score in 1..5 is "unknown" — we never invent a tick.
 */
export function stampState(kind: AmenityKind, score: number | undefined): StampState {
  if (typeof score !== "number" || !Number.isFinite(score) || score < 1 || score > 5) return "unknown";
  if (kind === "noise") return score <= 2.5 ? "yes" : score >= 4 ? "no" : "unknown";
  return score >= 3.5 ? "yes" : score <= 2 ? "no" : "unknown";
}

const MARK: Record<StampState, string> = { yes: "✓", no: "✗", unknown: "?" };
const SPOKEN: Record<StampState, string> = { yes: "yes", no: "no", unknown: "not enough information" };

interface AmenityStampsProps {
  amenities?: Partial<Record<AmenityKind, number>>;
}

const AmenityStamps = ({ amenities }: AmenityStampsProps) => (
  <div className="flex flex-wrap gap-2">
    {(Object.keys(LABELS) as AmenityKind[]).map((kind) => {
      const state = stampState(kind, amenities?.[kind]);
      return (
        <div
          key={kind}
          role="img"
          aria-label={`${LABELS[kind].name}: ${SPOKEN[state]}`}
          className={`stamp stamp-${state}`}
        >
          <div>
            <b className="block text-xl" aria-hidden="true">{MARK[state]}</b>
            <span className="stamp-label" aria-hidden="true">{LABELS[kind].short}</span>
          </div>
        </div>
      );
    })}
  </div>
);

export default AmenityStamps;
