export type AmenityKind = "wifi" | "outlets" | "noise" | "seating";
export type StampState = "yes" | "no" | "unknown";

/**
 * Turns an existing 1-5 score into a stamp. Noise is inverted (low noise = quiet = yes).
 * Anything that isn't a finite score in 1..5 is "unknown" — we never invent a tick.
 */
export function stampState(kind: AmenityKind, score: number | undefined): StampState {
  if (typeof score !== "number" || !Number.isFinite(score) || score < 1 || score > 5) return "unknown";
  if (kind === "noise") return score <= 2.5 ? "yes" : score >= 4 ? "no" : "unknown";
  return score >= 3.5 ? "yes" : score <= 2 ? "no" : "unknown";
}
