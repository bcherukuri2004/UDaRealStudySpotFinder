import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

  it("shows name, rating and a Google Maps place link (not directions)", () => {
    render(<SpotDetail {...base} place={makePlace({ name: "Joe's & Sons #1", address: '5 "B" Café Rd' })} />);
    expect(screen.getByRole("dialog", { name: "Joe's & Sons #1" })).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /View on Google Maps/ });
    expect(link).toHaveAttribute(
      "href",
      "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`Joe's & Sons #1 5 "B" Café Rd`),
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(screen.queryByRole("link", { name: /Open in Google Maps/ })).not.toBeInTheDocument();
  });

  it("writes the address out so it can be selected", () => {
    render(<SpotDetail {...base} place={makePlace({ address: "538 Ramona St, Palo Alto, CA" })} />);
    expect(screen.getByLabelText("Address")).toHaveTextContent("538 Ramona St, Palo Alto, CA");
  });

  describe("Copy address", () => {
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    afterEach(() => {
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else delete (navigator as unknown as Record<string, unknown>).clipboard;
    });
    const setClipboard = (value: unknown) =>
      Object.defineProperty(navigator, "clipboard", { value, configurable: true });

    it("copies the address and confirms", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      setClipboard({ writeText });
      render(<SpotDetail {...base} place={makePlace({ address: "1 Main St" })} />);
      await userEvent.click(screen.getByRole("button", { name: "Copy address" }));
      expect(writeText).toHaveBeenCalledWith("1 Main St");
      expect(await screen.findByRole("button", { name: "Copied!" })).toBeInTheDocument();
    });

    it("tells you to select it by hand when the clipboard is unavailable", async () => {
      setClipboard(undefined);
      render(<SpotDetail {...base} place={makePlace()} />);
      await userEvent.click(screen.getByRole("button", { name: "Copy address" }));
      expect(await screen.findByRole("status")).toHaveTextContent("Couldn't copy — select the address above");
    });

    it("shows the same message when the clipboard rejects", async () => {
      setClipboard({ writeText: vi.fn().mockRejectedValue(new Error("denied")) });
      render(<SpotDetail {...base} place={makePlace()} />);
      await userEvent.click(screen.getByRole("button", { name: "Copy address" }));
      await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Couldn't copy"));
    });

    it("resets the Copied state when a different place is shown", async () => {
      setClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
      const { rerender } = render(<SpotDetail {...base} place={makePlace({ id: "a" })} />);
      await userEvent.click(screen.getByRole("button", { name: "Copy address" }));
      await screen.findByRole("button", { name: "Copied!" });
      rerender(<SpotDetail {...base} place={makePlace({ id: "b", address: "Other" })} />);
      expect(screen.getByRole("button", { name: "Copy address" })).toBeInTheDocument();
    });
  });

  it("shows amenity stamps for a rated place", () => {
    render(<SpotDetail {...base} place={makePlace({ amenities: { wifi: 5, outlets: 1, noise: 3, seating: 3 } })} />);
    expect(screen.getByLabelText("Wifi: yes")).toBeInTheDocument();
    expect(screen.getByLabelText("Outlets: no")).toBeInTheDocument();
    expect(screen.getByLabelText("Quiet: not enough information")).toBeInTheDocument();
  });

  it("uses no italics or monospace", () => {
    const { container } = render(<SpotDetail {...base} place={makePlace()} />);
    expect(container.innerHTML).not.toMatch(/italic|font-mono|font-serif/);
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

  it("shows the photo credit as a safe link, and the illustrative label for stand-ins", () => {
    const credit = { text: "Photo: Jo · CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:X.jpg" };
    const url = "https://example.com/x.jpg";
    const { rerender } = render(<SpotDetail {...base} place={makePlace({ photo_url: url, photo_credit: credit })} />);
    const link = screen.getByRole("link", { name: credit.text });
    expect(link).toHaveAttribute("href", credit.url);
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(screen.queryByText("Illustrative photo")).not.toBeInTheDocument();
    rerender(<SpotDetail {...base} place={makePlace({ photo_url: url, photo_illustrative: true })} />);
    expect(screen.getByText("Illustrative photo")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: credit.text })).not.toBeInTheDocument();
  });

  it("hides the credit when the photo failed to load", () => {
    const credit = { text: "Photo: Jo · CC0", url: "https://commons.wikimedia.org/wiki/File:X.jpg" };
    const { container } = render(
      <SpotDetail {...base} place={makePlace({ photo_url: "https://example.com/x.jpg", photo_credit: credit })} />,
    );
    fireEvent.error(container.querySelector("img")!);
    expect(screen.queryByRole("link", { name: credit.text })).not.toBeInTheDocument();
  });
});
