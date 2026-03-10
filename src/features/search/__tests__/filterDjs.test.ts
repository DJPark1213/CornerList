import { describe, it, expect } from "vitest";
import { filterDjs } from "../utils/filterDjs";
import { MOCK_DJS } from "../data/mockDjs";

describe("filterDjs", () => {
  it("returns all DJs when no filters are set", () => {
    const result = filterDjs(MOCK_DJS, { q: "", genre: "", maxPrice: "" });
    expect(result).toHaveLength(MOCK_DJS.length);
  });

  it("filters by name substring (case-insensitive)", () => {
    const result = filterDjs(MOCK_DJS, { q: "mike", genre: "", maxPrice: "" });
    expect(result).toHaveLength(1);
    expect(result[0].stageName).toBe("DJ Mike Beats");
  });

  it("filters by bio content", () => {
    const result = filterDjs(MOCK_DJS, {
      q: "reggaeton",
      genre: "",
      maxPrice: "",
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("rico-flame");
  });

  it("filters by genre", () => {
    const result = filterDjs(MOCK_DJS, {
      q: "",
      genre: "Latin",
      maxPrice: "",
    });
    expect(result.every((dj) => dj.genres.includes("Latin"))).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("filters by max price", () => {
    const result = filterDjs(MOCK_DJS, { q: "", genre: "", maxPrice: "100" });
    expect(result.every((dj) => dj.pricePerHour <= 100)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("combines multiple filters", () => {
    const result = filterDjs(MOCK_DJS, {
      q: "",
      genre: "EDM",
      maxPrice: "160",
    });
    expect(
      result.every(
        (dj) => dj.genres.includes("EDM") && dj.pricePerHour <= 160
      )
    ).toBe(true);
  });

  it("returns empty when no DJs match", () => {
    const result = filterDjs(MOCK_DJS, {
      q: "zzzzz_no_match",
      genre: "",
      maxPrice: "",
    });
    expect(result).toHaveLength(0);
  });
});
