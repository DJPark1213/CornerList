import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BookingModal from "../components/BookingModal";
import { Dj } from "@/types/dj";

const mockDj: Dj = {
  id: "test-dj",
  stageName: "DJ Tester",
  yearsExperience: 3,
  pricePerHour: 120,
  rating: 4.5,
  ratingCount: 25,
  genres: ["Pop"],
  about: "bio",
  equipmentSummary: "gear",
  availabilitySummary: "weekends",
  avatarUrl: null,
  showcaseImages: [],
};

describe("BookingModal", () => {
  it("returns null when open is false", () => {
    const { container } = render(
      <BookingModal dj={mockDj} open={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders modal content when open", () => {
    render(<BookingModal dj={mockDj} open={true} onClose={vi.fn()} />);
    expect(screen.getByText("Request Booking")).toBeInTheDocument();
    expect(screen.getByText(/DJ Tester/)).toBeInTheDocument();
    expect(screen.getByText(/\$120\/hr/)).toBeInTheDocument();
  });

  it("renders form fields", () => {
    render(<BookingModal dj={mockDj} open={true} onClose={vi.fn()} />);
    expect(screen.getByText("Event date")).toBeInTheDocument();
    expect(screen.getByText("Start time")).toBeInTheDocument();
    expect(screen.getByText("End time")).toBeInTheDocument();
    expect(screen.getByText("Event type")).toBeInTheDocument();
    expect(screen.getByText("Send Request")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<BookingModal dj={mockDj} open={true} onClose={onClose} />);

    await user.click(screen.getByText("✕"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(
      <BookingModal dj={mockDj} open={true} onClose={onClose} />
    );

    const backdrop = container.querySelector(".backdrop-blur-sm");
    if (backdrop) await user.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
