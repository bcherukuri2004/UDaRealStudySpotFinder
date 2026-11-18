/** Warm fallback artwork for places with no photo, keyed by place type. */
export function getFallbackGradient(types: string[] = []): string {
  if (types.includes("cafe")) return "linear-gradient(135deg, hsl(14 62% 36%), hsl(30 70% 50%))";
  if (types.includes("library")) return "linear-gradient(135deg, hsl(165 30% 24%), hsl(150 28% 40%))";
  if (types.includes("restaurant")) return "linear-gradient(135deg, hsl(35 70% 34%), hsl(20 65% 48%))";
  return "linear-gradient(135deg, hsl(25 20% 26%), hsl(25 22% 42%))";
}
