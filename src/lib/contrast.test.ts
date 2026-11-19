import { readFileSync } from "node:fs";
import { contrastRatio } from "./contrast";

describe("contrastRatio", () => {
  it("is 21 for black on white", () => {
    expect(contrastRatio("0 0% 0%", "0 0% 100%")).toBeCloseTo(21, 1);
  });
  it("is 1 for identical colours", () => {
    expect(contrastRatio("0 0% 100%", "0 0% 100%")).toBeCloseTo(1, 5);
  });
  it("is symmetric", () => {
    expect(contrastRatio("14 62% 40%", "42 45% 96%")).toBeCloseTo(
      contrastRatio("42 45% 96%", "14 62% 40%"),
      8,
    );
  });
  it("rejects malformed input", () => {
    expect(() => contrastRatio("banana", "0 0% 0%")).toThrow();
    expect(() => contrastRatio("", "0 0% 0%")).toThrow();
  });
});

const css = readFileSync("src/index.css", "utf8");
const block = (selector: string) => {
  const start = css.indexOf(`${selector} {`);
  const end = css.indexOf("\n  }", start);
  return css.slice(start, end);
};
const token = (b: string, name: string) => {
  const m = b.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!m) throw new Error(`missing token --${name}`);
  return m[1].trim();
};

describe.each([
  [":root", "light"],
  [".dark", "dark"],
])("theme tokens (%s / %s)", (selector) => {
  const b = block(selector);
  const bg = token(b, "background");
  it("foreground on background >= 7", () => {
    expect(contrastRatio(token(b, "foreground"), bg)).toBeGreaterThanOrEqual(7);
  });
  it("muted-foreground on background >= 4.5", () => {
    expect(contrastRatio(token(b, "muted-foreground"), bg)).toBeGreaterThanOrEqual(4.5);
  });
  it("primary on background >= 4.5", () => {
    expect(contrastRatio(token(b, "primary"), bg)).toBeGreaterThanOrEqual(4.5);
  });
  it("primary-foreground on primary >= 4.5", () => {
    expect(
      contrastRatio(token(b, "primary-foreground"), token(b, "primary")),
    ).toBeGreaterThanOrEqual(4.5);
  });
  it("muted-foreground on card >= 4.5", () => {
    expect(contrastRatio(token(b, "muted-foreground"), token(b, "card"))).toBeGreaterThanOrEqual(4.5);
  });
  it.each(["sticky", "mint", "pink", "sky"])("ink text on --%s notes >= 4.5", (note) => {
    expect(contrastRatio(token(b, "ink"), token(b, note))).toBeGreaterThanOrEqual(4.5);
  });
  it("stamp colours (success, destructive) on card >= 4.5", () => {
    expect(contrastRatio(token(b, "success"), token(b, "card"))).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(token(b, "destructive"), token(b, "card"))).toBeGreaterThanOrEqual(4.5);
  });
});
