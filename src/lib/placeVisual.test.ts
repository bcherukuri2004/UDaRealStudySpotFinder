import { getFallbackGradient } from "./placeVisual";

describe("getFallbackGradient", () => {
  it("differs per type", () => {
    const set = new Set([
      getFallbackGradient(["cafe"]),
      getFallbackGradient(["library"]),
      getFallbackGradient(["restaurant"]),
      getFallbackGradient([]),
    ]);
    expect(set.size).toBe(4);
  });
  it("handles unknown types and no argument", () => {
    expect(getFallbackGradient(["zoo"])).toBe(getFallbackGradient([]));
    expect(getFallbackGradient()).toBe(getFallbackGradient([]));
  });
  it("returns a css gradient", () => {
    expect(getFallbackGradient(["cafe"])).toMatch(/^linear-gradient/);
  });
});
