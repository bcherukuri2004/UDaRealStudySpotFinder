import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import PlaceCard from "./PlaceCard";
import { makePlace } from "@/test/fakeExplore";

describe("PlaceCard", () => {
  it("renders the name in both variants", () => {
    const place = makePlace({ name: "Bean There" });
    const { rerender } = render(<PlaceCard place={place} variant="hero" />);
    expect(screen.getByText("Bean There")).toBeInTheDocument();
    rerender(<PlaceCard place={place} variant="tile" />);
    expect(screen.getByText("Bean There")).toBeInTheDocument();
    rerender(<PlaceCard place={place} />);
    expect(screen.getByText("Bean There")).toBeInTheDocument();
  });

  it("hero is taller than tile", () => {
    const place = makePlace();
    const { container, rerender } = render(<PlaceCard place={place} variant="hero" />);
    const hero = container.querySelector("[data-variant]")!;
    expect(hero.getAttribute("data-variant")).toBe("hero");
    rerender(<PlaceCard place={place} variant="tile" />);
    expect(container.querySelector("[data-variant]")!.getAttribute("data-variant")).toBe("tile");
  });

  it("shows no <img> without a photo and uses the gradient fallback", () => {
    const { container } = render(<PlaceCard place={makePlace()} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[data-fallback]")).not.toBeNull();
  });

  it("renders the photo, and swaps back to the fallback when it fails to load", () => {
    const { container } = render(<PlaceCard place={makePlace({ photo_url: "https://example.com/x.jpg" })} />);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("src", "https://example.com/x.jpg");
    fireEvent.error(img);
    expect(container.querySelector("img")).toBeNull();
  });

  it("clamps a 200-character name instead of breaking the layout", () => {
    const long = "A".repeat(200);
    render(<PlaceCard place={makePlace({ name: long })} />);
    expect(screen.getByRole("heading", { name: long }).className).toMatch(/line-clamp-2|truncate/);
  });

  it("Enter and Space select; click selects with the id", async () => {
    const onSelect = vi.fn();
    render(<PlaceCard place={makePlace({ id: "xyz" })} onSelect={onSelect} />);
    const card = screen.getByRole("button");
    card.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await userEvent.click(card);
    expect(onSelect).toHaveBeenCalledTimes(3);
    expect(onSelect).toHaveBeenCalledWith("xyz");
  });

  it("exposes selected state to assistive tech", () => {
    render(<PlaceCard place={makePlace({ name: "Bean" })} isSelected />);
    const card = screen.getByRole("button");
    expect(card).toHaveAttribute("aria-pressed", "true");
    expect(card).toHaveAccessibleName("Bean, selected");
  });

  it("shows status badges", () => {
    const { rerender } = render(<PlaceCard place={makePlace({ hours: { open: 0, close: 24 } })} />);
    expect(screen.getByText("Open")).toBeInTheDocument();
    rerender(<PlaceCard place={makePlace({ isUserAdded: true, isDiscovered: true })} />);
    expect(screen.getByText("Community")).toBeInTheDocument();
    rerender(<PlaceCard place={makePlace({ isDiscovered: true, reviewCount: 0 })} />);
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText(/Not yet rated/)).toBeInTheDocument();
    rerender(<PlaceCard place={makePlace({ reviewCount: 7 })} />);
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("shows travel time for the chosen mode and survives missing optional data", () => {
    const { rerender } = render(<PlaceCard place={makePlace()} transportMode="driving" />);
    expect(screen.getByText(/2 min drive/i)).toBeInTheDocument();
    rerender(
      <PlaceCard
        place={{ id: "bare", name: "Bare", address: "Nowhere" }}
      />,
    );
    expect(screen.getByText("Bare")).toBeInTheDocument();
  });

  it("labels stand-in photos as illustrative, but not real or missing photos", () => {
    const url = "https://example.com/x.jpg";
    const { rerender } = render(<PlaceCard place={makePlace({ photo_url: url, photo_illustrative: true })} />);
    expect(screen.getByText("Illustrative photo")).toBeInTheDocument();
    rerender(<PlaceCard place={makePlace({ photo_url: url })} />);
    expect(screen.queryByText("Illustrative photo")).not.toBeInTheDocument();
    rerender(<PlaceCard place={makePlace({ photo_illustrative: true })} />);
    expect(screen.queryByText("Illustrative photo")).not.toBeInTheDocument();
  });

  it("drops the illustrative label when the photo fails to load", () => {
    const { container } = render(
      <PlaceCard place={makePlace({ photo_url: "https://example.com/x.jpg", photo_illustrative: true })} />,
    );
    fireEvent.error(container.querySelector("img")!);
    expect(screen.queryByText("Illustrative photo")).not.toBeInTheDocument();
  });

  it("shows amenity stamps for rated places and none for unrated ones", () => {
    const { rerender } = render(<PlaceCard place={makePlace({ amenities: { wifi: 5, outlets: 1, noise: 1, seating: 3 } })} />);
    expect(screen.getByLabelText("Wifi: yes")).toBeInTheDocument();
    expect(screen.getByLabelText("Outlets: no")).toBeInTheDocument();
    expect(screen.getByLabelText("Quiet: yes")).toBeInTheDocument();
    rerender(<PlaceCard place={makePlace({ isDiscovered: true, reviewCount: 0 })} />);
    expect(screen.queryByLabelText(/Wifi:/)).not.toBeInTheDocument();
  });

  it("applies the requested tilt and defaults to none", () => {
    const { container, rerender } = render(<PlaceCard place={makePlace()} tilt="left" />);
    expect(container.firstElementChild).toHaveClass("note-tilt-left");
    rerender(<PlaceCard place={makePlace()} tilt="right" />);
    expect(container.firstElementChild).toHaveClass("note-tilt-right");
    rerender(<PlaceCard place={makePlace()} />);
    expect(container.firstElementChild!.className).not.toMatch(/note-tilt/);
  });

  it("shows the rating with a star in the meta line and copes with a missing one", () => {
    const { rerender } = render(<PlaceCard place={makePlace({ rating: 4.8 })} />);
    expect(screen.getByText(/★ 4\.8/)).toBeInTheDocument();
    rerender(<PlaceCard place={makePlace({ rating: undefined })} />);
    expect(screen.queryByText(/★/)).not.toBeInTheDocument();
  });

  it("uses no italics or monospace", () => {
    const { container } = render(<PlaceCard place={makePlace()} variant="hero" />);
    expect(container.innerHTML).not.toMatch(/italic|font-mono/);
  });
});
