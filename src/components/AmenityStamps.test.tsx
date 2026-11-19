import { render, screen } from "@testing-library/react";
import AmenityStamps, { stampState } from "./AmenityStamps";

describe("stampState", () => {
  it.each([
    ["wifi", 4.9, "yes"], ["wifi", 3.5, "yes"], ["wifi", 3.49, "unknown"], ["wifi", 2.01, "unknown"],
    ["wifi", 2, "no"], ["wifi", 1, "no"],
    ["outlets", 5, "yes"], ["seating", 2, "no"], ["seating", 3, "unknown"],
  ] as const)("%s %s -> %s", (kind, score, expected) => {
    expect(stampState(kind, score)).toBe(expected);
  });

  it.each([
    [1, "yes"], [2.5, "yes"], [2.51, "unknown"], [3.99, "unknown"], [4, "no"], [5, "no"],
  ] as const)("noise %s -> %s (inverted: low noise is a yes for 'quiet')", (score, expected) => {
    expect(stampState("noise", score)).toBe(expected);
  });

  it.each([undefined, NaN, Infinity, 0, -1, 6, 99])("bad score %s is unknown, never a false tick", (bad) => {
    for (const kind of ["wifi", "outlets", "noise", "seating"] as const) {
      expect(stampState(kind, bad as number | undefined)).toBe("unknown");
    }
  });
});

describe("AmenityStamps", () => {
  it("renders one labelled stamp per amenity", () => {
    render(<AmenityStamps amenities={{ wifi: 4.9, outlets: 1.5, noise: 3, seating: 3 }} />);
    expect(screen.getByLabelText("Wifi: yes")).toBeInTheDocument();
    expect(screen.getByLabelText("Outlets: no")).toBeInTheDocument();
    expect(screen.getByLabelText("Quiet: not enough information")).toBeInTheDocument();
    expect(screen.getByLabelText("Seating: not enough information")).toBeInTheDocument();
  });

  it("uses a tick, cross and question mark so colour is not the only signal", () => {
    render(<AmenityStamps amenities={{ wifi: 5, outlets: 1, noise: 3, seating: 3 }} />);
    expect(screen.getByLabelText("Wifi: yes")).toHaveTextContent("✓");
    expect(screen.getByLabelText("Outlets: no")).toHaveTextContent("✗");
    expect(screen.getByLabelText("Seating: not enough information")).toHaveTextContent("?");
  });

  it("copes with missing amenities", () => {
    render(<AmenityStamps amenities={undefined} />);
    expect(screen.getAllByLabelText(/not enough information/)).toHaveLength(4);
  });
});
