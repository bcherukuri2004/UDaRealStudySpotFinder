import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import BottomNav from "./BottomNav";

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <BottomNav />
    </MemoryRouter>,
  );

describe("BottomNav", () => {
  it("shows the four tabs in a labelled nav", () => {
    renderAt("/");
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    for (const name of ["Board", "Map", "Events", "Me"]) {
      expect(screen.getByRole("link", { name })).toBeInTheDocument();
    }
  });

  it("marks only the current route active", () => {
    renderAt("/map");
    expect(screen.getByRole("link", { name: "Map" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Board" })).not.toHaveAttribute("aria-current");
  });

  it("Board is not active on /map (exact match for root)", () => {
    renderAt("/map");
    expect(screen.getByRole("link", { name: "Board" })).not.toHaveAttribute("aria-current", "page");
  });

  it("clicking a tab changes the active tab", async () => {
    renderAt("/");
    await userEvent.click(screen.getByRole("link", { name: "Events" }));
    expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Board" })).not.toHaveAttribute("aria-current");
  });

  it("keeps the touch-target floor (56px) on every tab", () => {
    renderAt("/");
    for (const link of screen.getAllByRole("link")) {
      expect(link.className).toMatch(/min-h-\[56px\]/);
    }
  });

  it("highlights nothing on an unknown route", () => {
    renderAt("/zzz");
    for (const link of screen.getAllByRole("link")) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });
});
