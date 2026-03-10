import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DjProfileHeader from "../components/DjProfileHeader";
import { Dj } from "@/types/dj";

const mockDj: Dj = {
  id: "test-dj",
  stageName: "DJ Tester",
  yearsExperience: 5,
  pricePerHour: 150,
  rating: 4.8,
  ratingCount: 40,
  genres: ["EDM", "House"],
  about: "bio",
  equipmentSummary: "gear",
  availabilitySummary: "weekends",
  avatarUrl: null,
  showcaseImages: [],
};

describe("DjProfileHeader", () => {
  it("renders DJ stage name", () => {
    render(<DjProfileHeader dj={mockDj} onRequestBooking={vi.fn()} />);
    expect(screen.getByText("DJ Tester")).toBeInTheDocument();
  });

  it("renders rating with count", () => {
    render(<DjProfileHeader dj={mockDj} onRequestBooking={vi.fn()} />);
    expect(screen.getByText("★ 4.8")).toBeInTheDocument();
    expect(screen.getByText("(40 reviews)")).toBeInTheDocument();
  });

  it("renders price per hour", () => {
    render(<DjProfileHeader dj={mockDj} onRequestBooking={vi.fn()} />);
    expect(screen.getByText("$150/hr")).toBeInTheDocument();
  });

  it("renders genre tags", () => {
    render(<DjProfileHeader dj={mockDj} onRequestBooking={vi.fn()} />);
    expect(screen.getByText("EDM")).toBeInTheDocument();
    expect(screen.getByText("House")).toBeInTheDocument();
  });

  it("calls onRequestBooking when button is clicked", async () => {
    const user = userEvent.setup();
    const onBook = vi.fn();
    render(<DjProfileHeader dj={mockDj} onRequestBooking={onBook} />);

    await user.click(screen.getByText("Request Booking"));
    expect(onBook).toHaveBeenCalledOnce();
  });
});
