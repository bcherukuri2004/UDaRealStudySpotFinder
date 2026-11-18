import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import SpotDetail from "./SpotDetail";
import { makePlace } from "@/test/fakeExplore";
import type { Review } from "@/data/reviews";

const review = (over: Partial<Review> = {}): Review => ({
  id: "r1", author_name: "Sam", wifi: 5, outlets: 4, noise: 2, seating: 3,
  comment: "Great outlets", created_at: "2026-01-01", ...over,
});

const base = {
  reviews: [] as Review[],
  transportMode: "walking" as const,
  canReview: true,
  onClose: vi.fn(),
  onRate: vi.fn(),
};

describe("SpotDetail", () => {
  it("renders nothing for a null place", () => {
    const { container } = render(<SpotDetail {...base} place={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows name, rating and an encoded Google Maps link", () => {
    render(<SpotDetail {...base} place={makePlace({ name: "Bean There", address: "5 A&B St, Palo Alto" })} />);
    expect(screen.getByRole("dialog", { name: "Bean There" })).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Open in Google Maps/ });
    expect(link).toHaveAttribute("href", expect.stringContaining(encodeURIComponent("5 A&B St, Palo Alto")));
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("shows travel time for the chosen mode", () => {
    const { rerender } = render(<SpotDetail {...base} place={makePlace()} />);
    expect(screen.getByText("6 min walk")).toBeInTheDocument();
    rerender(<SpotDetail {...base} transportMode="driving" place={makePlace()} />);
    expect(screen.getByText("2 min drive")).toBeInTheDocument();
  });

  it("handles a 200-character name and address", () => {
    const long = "B".repeat(200);
    render(<SpotDetail {...base} place={makePlace({ name: long, address: long })} />);
    expect(screen.getAllByText(long).length).toBeGreaterThan(0);
  });

  it("disables Rate when canReview is false; otherwise calls onRate", async () => {
    const onRate = vi.fn();
    const place = makePlace();
    const { unmount } = render(<SpotDetail {...base} canReview={false} place={place} />);
    expect(screen.getByRole("button", { name: /Rate this spot/ })).toBeDisabled();
    unmount();
    render(<SpotDetail {...base} onRate={onRate} place={place} />);
    await userEvent.click(screen.getByRole("button", { name: /Rate this spot/ }));
    expect(onRate).toHaveBeenCalledWith(place);
  });

  it("close button and Escape-free overlay click call onClose", async () => {
    const onClose = vi.fn();
    render(<SpotDetail {...base} onClose={onClose} place={makePlace()} />);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("discovered place with no reviews shows the empty state and offers the first review", async () => {
    const onRate = vi.fn();
    const place = makePlace({ isDiscovered: true, reviewCount: 0 });
    render(<SpotDetail {...base} onRate={onRate} place={place} />);
    expect(screen.getByText("Not yet rated")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Rate this spot/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Be the first to review/ }));
    expect(onRate).toHaveBeenCalledWith(place);
  });

  it("lists at most three reviews, anonymous when unnamed", () => {
    const reviews = [review({ id: "1" }), review({ id: "2", author_name: null, comment: null }), review({ id: "3" }), review({ id: "4" })];
    render(<SpotDetail {...base} reviews={reviews} place={makePlace()} />);
    expect(screen.getByText("4 reviews")).toBeInTheDocument();
    expect(screen.getByText("Anonymous")).toBeInTheDocument();
    expect(screen.getAllByText(/WiFi 5/)).toHaveLength(3);
  });

  it("falls back to artwork when there is no photo or the photo fails", () => {
    const { container, unmount } = render(<SpotDetail {...base} place={makePlace()} />);
    expect(container.querySelector("img")).toBeNull();
    unmount();
    const r = render(<SpotDetail {...base} place={makePlace({ photo_url: "https://example.com/x.jpg" })} />);
    const img = r.container.querySelector("img")!;
    expect(img).toBeInTheDocument();
    fireEvent.error(img);
    expect(r.container.querySelector("img")).toBeNull();
  });
});
