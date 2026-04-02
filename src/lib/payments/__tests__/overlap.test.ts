import { describe, it, expect } from "vitest";

// Extracted copy of timesOverlap from api/bookings/[id]/route.ts
function timesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  const toMinutes = (t: string) => {
    const parts = t.trim().split(":").map(Number);
    return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  };
  let aS = toMinutes(aStart);
  let aE = toMinutes(aEnd);
  let bS = toMinutes(bStart);
  let bE = toMinutes(bEnd);
  if (aE <= aS) aE += 24 * 60;
  if (bE <= bS) bE += 24 * 60;
  return aS < bE && aE > bS;
}

describe("timesOverlap", () => {
  it("detects direct overlap", () => {
    expect(timesOverlap("18:00", "22:00", "20:00", "23:00")).toBe(true);
  });

  it("detects no overlap — A fully before B", () => {
    expect(timesOverlap("14:00", "16:00", "18:00", "22:00")).toBe(false);
  });

  it("detects no overlap — A fully after B", () => {
    expect(timesOverlap("22:00", "23:00", "18:00", "21:00")).toBe(false);
  });

  it("adjacent slots do not overlap (end == start of next)", () => {
    expect(timesOverlap("18:00", "20:00", "20:00", "22:00")).toBe(false);
  });

  it("A contained within B", () => {
    expect(timesOverlap("19:00", "21:00", "18:00", "22:00")).toBe(true);
  });

  it("B contained within A", () => {
    expect(timesOverlap("18:00", "23:00", "19:00", "21:00")).toBe(true);
  });

  it("identical slots overlap", () => {
    expect(timesOverlap("20:00", "22:00", "20:00", "22:00")).toBe(true);
  });

  it("midnight-crossing A does not overlap with B that ends before it starts", () => {
    expect(timesOverlap("22:00", "02:00", "18:00", "21:00")).toBe(false);
  });

  it("both crossing midnight — no overlap", () => {
    expect(timesOverlap("23:00", "01:00", "02:00", "04:00")).toBe(false);
  });

  it("both crossing midnight — A and B share same window", () => {
    expect(timesOverlap("22:00", "02:00", "22:00", "02:00")).toBe(true);
  });

  it("A crossing midnight fully contains B crossing midnight", () => {
    expect(timesOverlap("21:00", "03:00", "22:00", "02:00")).toBe(true);
  });
});
