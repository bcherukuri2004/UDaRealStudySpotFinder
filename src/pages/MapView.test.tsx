import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import MapView from "./MapView";
import { makeExplore, withExplore } from "@/test/fakeExplore";

// MapLibre needs WebGL, which jsdom lacks.
vi.mock("@/components/Map", () => ({ default: () => <div data-testid="map-stub" /> }));

describe("MapView", () => {
  it("renders the map", () => {
    render(withExplore(<MapView />, makeExplore()));
    expect(screen.getByTestId("map-stub")).toBeInTheDocument();
  });

  it("shows the zone toggle only when the user location is known", async () => {
    const { unmount } = render(withExplore(<MapView />, makeExplore()));
    expect(screen.queryByRole("button", { name: /zone/ })).not.toBeInTheDocument();
    unmount();
    const ctx = makeExplore({ userLocation: { lat: 1, lng: 2 } });
    render(withExplore(<MapView />, ctx));
    const btn = screen.getByRole("button", { name: /20 min walk zone/ });
    await userEvent.click(btn);
    expect(ctx.toggleIsochrone).toHaveBeenCalled();
  });
});
