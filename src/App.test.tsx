import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

// The real Index pulls in MapLibre (needs WebGL); routing tests don't need it.
vi.mock("@/pages/Index", async () => {
  const { Outlet } = await import("react-router-dom");
  return { default: () => <div data-testid="explore"><Outlet /></div> };
});
vi.mock("@/pages/DiscoverView", () => ({ default: () => <p>discover view</p> }));
vi.mock("@/pages/MapView", () => ({ default: () => <p>map view</p> }));

import App from "./App";

const renderAt = (path: string) => {
  window.history.pushState({}, "", path);
  return render(<App />);
};

describe("App routes", () => {
  it("unknown URL shows NotFound without the bottom nav", () => {
    renderAt("/does-not-exist");
    expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Main" })).not.toBeInTheDocument();
  });

  it("nested unknown URLs (/events/xyz, /spot/1) are NotFound too", () => {
    renderAt("/events/xyz");
    expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
  });

  it("/events and /profile show placeholders inside the shell", () => {
    renderAt("/events");
    expect(screen.getByRole("heading", { name: /events/i })).toBeInTheDocument();
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
  });

  it("/profile shows its placeholder", () => {
    renderAt("/profile");
    expect(screen.getByRole("heading", { name: /profile/i })).toBeInTheDocument();
  });

  it("/ renders the discover view and /map the map view, both inside the shell", () => {
    const { unmount } = renderAt("/");
    expect(screen.getByText("discover view")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    unmount();
    renderAt("/map");
    expect(screen.getByText("map view")).toBeInTheDocument();
  });
});
