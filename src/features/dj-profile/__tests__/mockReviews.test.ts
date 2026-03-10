import { describe, it, expect } from "vitest";
import { MOCK_REVIEWS, getReviewsByDjId } from "../data/mockReviews";

describe("MOCK_REVIEWS", () => {
  it("contains reviews", () => {
    expect(MOCK_REVIEWS.length).toBeGreaterThan(0);
  });

  it("each review has required fields", () => {
    for (const review of MOCK_REVIEWS) {
      expect(review.id).toBeTruthy();
      expect(review.djId).toBeTruthy();
      expect(review.hostDisplayName).toBeTruthy();
      expect(review.rating).toBeGreaterThanOrEqual(1);
      expect(review.rating).toBeLessThanOrEqual(5);
      expect(review.comment).toBeTruthy();
      expect(review.createdAt).toBeTruthy();
    }
  });
});

describe("getReviewsByDjId", () => {
  it("returns reviews for a known DJ", () => {
    const reviews = getReviewsByDjId("mike-beats");
    expect(reviews.length).toBeGreaterThan(0);
    reviews.forEach((r) => expect(r.djId).toBe("mike-beats"));
  });

  it("returns empty array for an unknown DJ", () => {
    expect(getReviewsByDjId("nonexistent")).toEqual([]);
  });
});
