import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const files = walk("src").filter(
  (f) => /\.(tsx|css)$/.test(f) && !f.endsWith(".test.tsx") && !f.includes("components/ui/chart.tsx"),
);

describe("noticeboard style guard", () => {
  it("finds source files to check", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it.each(["font-serif", "font-mono", "italic", "Fraunces", "JetBrains"])(
    "no '%s' anywhere in the UI source (the old nomadly-like look)",
    (banned) => {
      const hits = files.filter((f) => readFileSync(f, "utf8").includes(banned));
      expect(hits).toEqual([]);
    },
  );

  it("marker font is never used for small text", () => {
    for (const f of files.filter((x) => x.endsWith(".tsx"))) {
      for (const line of readFileSync(f, "utf8").split("\n")) {
        if (line.includes("font-marker")) expect(line, `${f}: ${line.trim()}`).not.toMatch(/text-(xs|sm|base)\b/);
      }
    }
  });
});
