import { existsSync } from "node:fs";
import { mockPlaces } from "./mockPlaces";

describe("curated place photos", () => {
  it("every curated place has a photo that exists in public/", () => {
    for (const p of mockPlaces) {
      expect(p.photo_url, p.name).toMatch(/^\/placeholders\/[a-z-]+\.jpg$/);
      expect(existsSync(`public${p.photo_url}`), `${p.name}: ${p.photo_url}`).toBe(true);
    }
  });

  it("no two places share the same photo", () => {
    const urls = mockPlaces.map((p) => p.photo_url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("every placeholder file is credited", async () => {
    const { readFileSync } = await import("node:fs");
    const credits = readFileSync("public/placeholders/CREDITS.md", "utf8");
    for (const p of mockPlaces) {
      const file = p.photo_url!.split("/").pop()!;
      expect(credits, file).toContain(file);
    }
  });
});

describe("photo honesty", () => {
  it("every photo is either a real, credited photo or labelled illustrative (never both, never neither)", () => {
    for (const p of mockPlaces) {
      const credited = !!p.photo_credit;
      const illustrative = !!p.photo_illustrative;
      expect(credited !== illustrative, `${p.name}: credit=${credited} illustrative=${illustrative}`).toBe(true);
    }
  });

  it("credit links point at Wikimedia Commons over https", () => {
    for (const p of mockPlaces.filter((x) => x.photo_credit)) {
      expect(p.photo_credit!.url).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    }
  });

  it("no unused files left in public/placeholders", async () => {
    const { readdirSync } = await import("node:fs");
    const used = new Set(mockPlaces.map((p) => p.photo_url!.split("/").pop()));
    const files = readdirSync("public/placeholders").filter((f) => f.endsWith(".jpg"));
    for (const f of files) expect(used.has(f), `unused: ${f}`).toBe(true);
  });
});
