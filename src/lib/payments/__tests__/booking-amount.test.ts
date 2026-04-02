import { describe, it, expect } from "vitest";
import { hoursBetweenTimes, bookingAmountCents } from "../booking-amount";

describe("hoursBetweenTimes", () => {
  it("calculates a simple 2-hour block", () => {
    expect(hoursBetweenTimes("18:00", "20:00")).toBe(2);
  });

  it("calculates a 4.5-hour block", () => {
    expect(hoursBetweenTimes("20:00", "00:30")).toBeCloseTo(4.5);
  });

  it("handles midnight crossing (end < start means next day)", () => {
    expect(hoursBetweenTimes("22:00", "02:00")).toBe(4);
  });

  it("handles exactly midnight as end", () => {
    expect(hoursBetweenTimes("20:00", "00:00")).toBe(4);
  });

  it("handles minutes in both times", () => {
    expect(hoursBetweenTimes("13:30", "15:00")).toBeCloseTo(1.5);
  });

  it("handles HH:mm:ss format", () => {
    expect(hoursBetweenTimes("18:00:00", "20:00:00")).toBe(2);
  });

  it("handles single-hour blocks", () => {
    expect(hoursBetweenTimes("09:00", "10:00")).toBe(1);
  });
});

describe("bookingAmountCents", () => {
  it("calculates correctly for $100/hr for 2 hours", () => {
    expect(bookingAmountCents(100, "18:00", "20:00")).toBe(20000);
  });

  it("calculates correctly for $150/hr for 4 hours", () => {
    expect(bookingAmountCents(150, "20:00", "00:00")).toBe(60000);
  });

  it("enforces minimum of 50 cents", () => {
    expect(bookingAmountCents(0, "18:00", "19:00")).toBe(50);
  });

  it("handles fractional hours correctly", () => {
    expect(bookingAmountCents(100, "18:00", "19:30")).toBe(15000);
  });

  it("handles midnight-crossing bookings", () => {
    expect(bookingAmountCents(200, "22:00", "02:00")).toBe(80000);
  });

  it("rounds to nearest cent", () => {
    expect(bookingAmountCents(33, "10:00", "11:00")).toBe(3300);
  });
});
