import { stampState, type AmenityKind, type StampState } from "@/lib/stampState";

const LABELS: Record<AmenityKind, { name: string; short: string }> = {
  wifi: { name: "Wifi", short: "WIFI" },
  outlets: { name: "Outlets", short: "PLUGS" },
  noise: { name: "Quiet", short: "QUIET" },
  seating: { name: "Seating", short: "SEATS" },
};

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
