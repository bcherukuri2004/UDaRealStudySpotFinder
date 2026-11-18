import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import ReviewForm from "./ReviewForm";
import { makePlace } from "@/test/fakeExplore";

const submitReview = vi.fn();
vi.mock("@/data/reviews", () => ({ submitReview: (...a: unknown[]) => submitReview(...a) }));

const rateAll = async () => {
  for (const label of ["WiFi Quality", "Power Outlets", "Noise Level", "Seating Comfort"]) {
    await userEvent.click(screen.getByRole("button", { name: `${label}: 4 out of 5` }));
  }
};

beforeEach(() => {
  submitReview.mockReset();
});

describe("ReviewForm", () => {
  it("renders nothing without a place", () => {
    const { container } = render(<ReviewForm place={null} onClose={vi.fn()} onSubmitted={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("keeps Post disabled until all four categories are rated", async () => {
    render(<ReviewForm place={makePlace()} onClose={vi.fn()} onSubmitted={vi.fn()} />);
    const post = screen.getByRole("button", { name: "Post review" });
    expect(post).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "WiFi Quality: 5 out of 5" }));
    expect(post).toBeDisabled();
    await rateAll();
    expect(post).toBeEnabled();
  });

  it("submits ratings, then notifies and closes", async () => {
    submitReview.mockResolvedValue(undefined);
    const onClose = vi.fn();
    const onSubmitted = vi.fn();
    const place = makePlace();
    render(<ReviewForm place={place} onClose={onClose} onSubmitted={onSubmitted} />);
    await rateAll();
    await userEvent.type(screen.getByPlaceholderText(/Outlets are mostly/), "Nice");
    await userEvent.click(screen.getByRole("button", { name: "Post review" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(submitReview).toHaveBeenCalledWith(place, expect.objectContaining({ wifi: 4, outlets: 4, noise: 4, seating: 4, comment: "Nice" }));
    expect(onSubmitted).toHaveBeenCalled();
  });

  it("shows the server error and stays open when posting fails", async () => {
    submitReview.mockRejectedValue(new Error("Too many reviews submitted for this place."));
    const onClose = vi.fn();
    render(<ReviewForm place={makePlace()} onClose={onClose} onSubmitted={vi.fn()} />);
    await rateAll();
    await userEvent.click(screen.getByRole("button", { name: "Post review" }));
    expect(await screen.findByText("Too many reviews submitted for this place.")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Post review" })).toBeEnabled();
  });

  it("caps the comment at 1000 characters and the name at 60", () => {
    render(<ReviewForm place={makePlace()} onClose={vi.fn()} onSubmitted={vi.fn()} />);
    expect(screen.getByPlaceholderText(/Outlets are mostly/)).toHaveAttribute("maxlength", "1000");
    expect(screen.getByPlaceholderText(/Leave blank/)).toHaveAttribute("maxlength", "60");
  });
});
