import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import Index from "./Index";
import { useExplore } from "./exploreContext";

// Probe exposes the shared context so we can drive Index without the real views.
let ctx: ReturnType<typeof useExplore>;
const Probe = () => {
  ctx = useExplore();
  const loc = useLocation();
  return (
    <div>
      <p data-testid="selected">{String(ctx.selectedPlace)}</p>
      <p data-testid="path">{loc.pathname}</p>
      <p data-testid="count">{ctx.places.length}</p>
    </div>
  );
};

const renderIndex = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<Index />}>
          <Route path="/" element={<Probe />} />
          <Route path="/map" element={<Probe />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("Index (layout route)", () => {
  it("shares curated places and no spot is selected initially", () => {
    renderIndex();
    expect(Number(screen.getByTestId("count").textContent)).toBeGreaterThan(0);
    expect(screen.getByTestId("selected")).toHaveTextContent("null");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("selecting a place opens the detail overlay; Close dismisses it", async () => {
    renderIndex();
    const id = ctx.places[0].id;
    act(() => ctx.toggleSelect(id));
    expect(screen.getByRole("dialog", { name: ctx.places[0].name })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByTestId("selected")).toHaveTextContent("null");
  });

  it("toggleSelect on the same id deselects", () => {
    renderIndex();
    const id = ctx.places[0].id;
    act(() => ctx.toggleSelect(id));
    act(() => ctx.toggleSelect(id));
    expect(screen.getByTestId("selected")).toHaveTextContent("null");
  });

  it("Escape closes the detail", async () => {
    renderIndex();
    act(() => ctx.toggleSelect(ctx.places[0].id));
    await userEvent.keyboard("{Escape}");
    expect(screen.getByTestId("selected")).toHaveTextContent("null");
  });

  it("clears a stale selection when a filter removes the selected place", () => {
    renderIndex();
    const cafe = ctx.places.find((p) => p.types.includes("cafe") && !p.types.includes("library"))!;
    act(() => ctx.toggleSelect(cafe.id));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    act(() => ctx.setFilters({ ...ctx.filters, types: ["library"] }));
    expect(screen.getByTestId("selected")).toHaveTextContent("null");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not crash when every place is filtered out", () => {
    renderIndex();
    act(() => ctx.setFilters({ ...ctx.filters, priceRange: [9, 9] }));
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("unknown selected id is ignored without a dialog", () => {
    renderIndex();
    act(() => ctx.toggleSelect("does-not-exist"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("starting add-a-spot navigates to the map", () => {
    renderIndex();
    act(() => ctx.startAddSpot());
    expect(screen.getByTestId("path")).toHaveTextContent("/map");
    expect(ctx.isPicking).toBe(true);
  });
});
