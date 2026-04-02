import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookingsClient from "../BookingsClient";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const makeBooking = (overrides = {}) => ({
  id: "booking-1",
  status: "pending",
  payment_status: "unpaid",
  event_date: "2025-08-10",
  start_time: "20:00",
  end_time: "23:00",
  event_type: "Birthday",
  guest_count: 50,
  dj_profiles: { id: "dj-1", stage_name: "DJ Test" },
  ...overrides,
});

describe("BookingsClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows empty state when no bookings", () => {
    render(<BookingsClient initial={[]} />);
    expect(screen.getByText(/haven't made any bookings/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /find a dj/i })).toBeInTheDocument();
  });

  it("renders booking details", () => {
    render(<BookingsClient initial={[makeBooking()]} />);
    expect(screen.getByText("DJ Test")).toBeInTheDocument();
    expect(screen.getByText(/2025-08-10/)).toBeInTheDocument();
    expect(screen.getByText(/Birthday/)).toBeInTheDocument();
    expect(screen.getByText(/50 guests/)).toBeInTheDocument();
  });

  it("shows Pending status badge", () => {
    render(<BookingsClient initial={[makeBooking({ status: "pending" })]} />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("shows Confirmed status badge", () => {
    render(<BookingsClient initial={[makeBooking({ status: "confirmed", payment_status: "paid" })]} />);
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
  });

  it("shows Refunded badge when payment_status is refunded", () => {
    render(<BookingsClient initial={[makeBooking({ status: "cancelled", payment_status: "refunded" })]} />);
    expect(screen.getByText(/Refunded/)).toBeInTheDocument();
  });

  it("shows cancel button for cancellable statuses", () => {
    render(<BookingsClient initial={[makeBooking({ status: "pending" })]} />);
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("does not show cancel button for declined bookings", () => {
    render(<BookingsClient initial={[makeBooking({ status: "declined" })]} />);
    expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
  });

  it("shows Pay now button for accepted+unpaid bookings", () => {
    render(<BookingsClient initial={[makeBooking({ status: "accepted", payment_status: "unpaid" })]} />);
    expect(screen.getByRole("button", { name: /pay now/i })).toBeInTheDocument();
  });

  it("does not show Pay now when already paid", () => {
    render(<BookingsClient initial={[makeBooking({ status: "accepted", payment_status: "paid" })]} />);
    expect(screen.queryByRole("button", { name: /pay now/i })).not.toBeInTheDocument();
  });

  it("calls cancel API and updates status optimistically", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true, status: "cancelled" }), { status: 200 })
    );

    render(<BookingsClient initial={[makeBooking({ status: "pending" })]} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.getByText("Cancelled")).toBeInTheDocument();
    });
  });

  it("shows error message when cancel API fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Cannot cancel" }), { status: 422 })
    );

    render(<BookingsClient initial={[makeBooking({ status: "pending" })]} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.getByText("Cannot cancel")).toBeInTheDocument();
    });
  });

  it("does not cancel when confirm dialog is dismissed", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const fetchSpy = vi.spyOn(global, "fetch");

    render(<BookingsClient initial={[makeBooking({ status: "pending" })]} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("renders multiple bookings", () => {
    render(
      <BookingsClient
        initial={[
          makeBooking({ id: "b1", dj_profiles: { id: "d1", stage_name: "DJ Alpha" } }),
          makeBooking({ id: "b2", dj_profiles: { id: "d2", stage_name: "DJ Beta" } }),
        ]}
      />
    );
    expect(screen.getByText("DJ Alpha")).toBeInTheDocument();
    expect(screen.getByText("DJ Beta")).toBeInTheDocument();
  });
});
