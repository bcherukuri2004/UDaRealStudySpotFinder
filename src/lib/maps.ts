/** Google Maps link to a place's page (a search by name + address), not turn-by-turn directions. */
export function mapsPlaceUrl(name: string, address: string): string {
  const query = [name, address].map((s) => s.trim()).filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
