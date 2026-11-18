import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DiscoverView from "./DiscoverView";
import { makeExplore, makePlace, withExplore } from "@/test/fakeExplore";

describe("DiscoverView", () => {
  it("shows the filter empty state when there are no places", () => {
    render(withExplore(<DiscoverView />, makeExplore()));
    expect(screen.getByText("No spots match your filters")).toBeInTheDocument();
  });

  it("empty state resets filters", async () => {
    const ctx = makeExplore();
    render(withExplore(<DiscoverView />, ctx));
    await userEvent.click(screen.getByRole("button", { name: "Reset Filters" }));
    expect(ctx.resetFilters).toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Adjust Filters" }));
    expect(ctx.openFilters).toHaveBeenCalled();
  });

  it("shows the no-matches state for a search and Clear Search empties it", async () => {
    const ctx = makeExplore({ searchQuery: "Tamper" });
    render(withExplore(<DiscoverView />, ctx));
    expect(screen.getByText("No matches found")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear Search" }));
    expect(ctx.setSearchQuery).toHaveBeenCalledWith("");
  });

  it("typing in search calls setSearchQuery; Enter triggers nearby search", async () => {
    const ctx = makeExplore();
    render(withExplore(<DiscoverView />, ctx));
    const box = screen.getByPlaceholderText(/Search by name/);
    await userEvent.type(box, "a");
    expect(ctx.setSearchQuery).toHaveBeenCalledWith("a");
    await userEvent.type(box, "{Enter}");
    expect(ctx.handleSearchNearby).toHaveBeenCalled();
  });

  it("clicking a place card toggles selection with its id", async () => {
    const ctx = makeExplore({ places: [makePlace({ id: "abc", name: "Bean There" })] });
    render(withExplore(<DiscoverView />, ctx));
    await userEvent.click(screen.getByText("Bean There"));
    expect(ctx.toggleSelect).toHaveBeenCalledWith("abc");
  });

  it("renders a 200-character name without throwing", () => {
    const long = "A".repeat(200);
    render(withExplore(<DiscoverView />, makeExplore({ places: [makePlace({ name: long, address: long })] })));
    expect(screen.getAllByText(long).length).toBeGreaterThan(0);
  });

  it("discover and add-spot buttons call their handlers; add-spot is disabled without Supabase", async () => {
    const ctx = makeExplore();
    const { unmount } = render(withExplore(<DiscoverView />, ctx));
    await userEvent.click(screen.getByRole("button", { name: /Discover real places/ }));
    expect(ctx.handleDiscover).toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: /Add a spot/ }));
    expect(ctx.startAddSpot).toHaveBeenCalled();
    unmount();
    render(withExplore(<DiscoverView />, makeExplore({ canAddSpot: false })));
    expect(screen.getByRole("button", { name: /Add a spot/ })).toBeDisabled();
  });

  it("shows the discover error", () => {
    render(withExplore(<DiscoverView />, makeExplore({ discoverError: "Location permission denied." })));
    expect(screen.getByText("Location permission denied.")).toBeInTheDocument();
  });
});
