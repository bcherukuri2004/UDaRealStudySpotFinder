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

describe("DiscoverView layout", () => {
  const three = [
    makePlace({ id: "a", name: "Alpha" }),
    makePlace({ id: "b", name: "Bravo" }),
    makePlace({ id: "c", name: "Charlie" }),
  ];
  const variants = (container: HTMLElement) =>
    [...container.querySelectorAll("[data-variant]")].map((n) => n.getAttribute("data-variant"));

  it("shows the editorial heading", () => {
    render(withExplore(<DiscoverView />, makeExplore()));
    expect(screen.getByRole("heading", { level: 1, name: "Choose your space." })).toBeInTheDocument();
  });

  it("first place is the hero and the rest are tiles, in order", () => {
    const { container } = render(withExplore(<DiscoverView />, makeExplore({ places: three })));
    expect(variants(container)).toEqual(["hero", "tile", "tile"]);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["Alpha", "Bravo", "Charlie"]);
  });

  it("one place gives a hero and no tile grid", () => {
    const { container } = render(withExplore(<DiscoverView />, makeExplore({ places: [three[0]] })));
    expect(variants(container)).toEqual(["hero"]);
  });

  it("zero places gives no hero and no crash", () => {
    const { container } = render(withExplore(<DiscoverView />, makeExplore({ places: [] })));
    expect(variants(container)).toEqual([]);
  });

  it("filters button shows the active-filter count and opens the panel", async () => {
    const ctx = makeExplore({ activeFilterCount: 3 });
    render(withExplore(<DiscoverView />, ctx));
    const btn = screen.getByRole("button", { name: /Filters & Preferences/ });
    expect(btn).toHaveTextContent("3");
    await userEvent.click(btn);
    expect(ctx.openFilters).toHaveBeenCalled();
  });

  it("changing sort calls setSortBy", async () => {
    const ctx = makeExplore();
    render(withExplore(<DiscoverView />, ctx));
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Sort by" }), "quietest");
    expect(ctx.setSortBy).toHaveBeenCalledWith("quietest");
  });

  it("marks the selected card", () => {
    render(withExplore(<DiscoverView />, makeExplore({ places: three, selectedPlace: "b" })));
    expect(screen.getByRole("button", { name: "Bravo, selected" })).toHaveAttribute("aria-pressed", "true");
  });
});
