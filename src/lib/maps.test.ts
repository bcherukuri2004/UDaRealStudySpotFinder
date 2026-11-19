import { mapsPlaceUrl } from "./maps";

describe("mapsPlaceUrl", () => {
  it("builds a place-search link, not a directions link", () => {
    const url = mapsPlaceUrl("Coupa Café", "538 Ramona St, Palo Alto, CA");
    expect(url).toBe(
      "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Coupa Café 538 Ramona St, Palo Alto, CA"),
    );
    expect(url).not.toContain("/dir/");
  });

  it("encodes &, #, quotes, spaces and non-ASCII so the query cannot be broken out of", () => {
    const url = mapsPlaceUrl(`Joe's & Sons #1`, `5 "B" Rd?x=1&y=2`);
    const query = new URL(url).searchParams;
    expect(query.get("query")).toBe(`Joe's & Sons #1 5 "B" Rd?x=1&y=2`);
    expect([...query.keys()]).toEqual(["api", "query"]);
  });

  it("falls back to just the name or address when one is empty", () => {
    expect(new URL(mapsPlaceUrl("Only Name", "")).searchParams.get("query")).toBe("Only Name");
    expect(new URL(mapsPlaceUrl("", "Only Address")).searchParams.get("query")).toBe("Only Address");
  });

  it("handles very long input without throwing", () => {
    const long = "x".repeat(5000);
    expect(() => mapsPlaceUrl(long, long)).not.toThrow();
  });
});
