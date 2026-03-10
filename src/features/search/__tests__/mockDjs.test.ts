import { describe, it, expect } from "vitest";
import { MOCK_DJS, getDjById } from "../data/mockDjs";

describe("MOCK_DJS", () => {
  it("contains 6 DJs", () => {
    expect(MOCK_DJS).toHaveLength(6);
  });

  it("each DJ has required fields", () => {
    for (const dj of MOCK_DJS) {
      expect(dj.id).toBeTruthy();
      expect(dj.stageName).toBeTruthy();
      expect(dj.genres.length).toBeGreaterThan(0);
      expect(dj.pricePerHour).toBeGreaterThan(0);
      expect(dj.rating).toBeGreaterThanOrEqual(0);
      expect(dj.rating).toBeLessThanOrEqual(5);
    }
  });
});

describe("getDjById", () => {
  it("returns the correct DJ for a known id", () => {
    const dj = getDjById("mike-beats");
    expect(dj).toBeDefined();
    expect(dj!.stageName).toBe("DJ Mike Beats");
  });

  it("returns undefined for an unknown id", () => {
    expect(getDjById("nonexistent-dj")).toBeUndefined();
  });
});
