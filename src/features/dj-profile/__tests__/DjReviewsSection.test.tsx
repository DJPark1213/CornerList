import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DjReviewsSection from "../components/DjReviewsSection";
import { Review } from "@/types/dj";

const mockReviews: Review[] = [
  {
    id: "r1",
    djId: "test",
    hostDisplayName: "Alice B.",
    rating: 5,
    comment: "Amazing show!",
    createdAt: "2026-01-15",
  },
  {
    id: "r2",
    djId: "test",
    hostDisplayName: "Bob C.",
    rating: 4,
    comment: "Great vibes.",
    createdAt: "2026-02-10",
  },
];

describe("DjReviewsSection", () => {
  it("renders review count", () => {
    render(<DjReviewsSection reviews={mockReviews} />);
    expect(screen.getByText("(2)")).toBeInTheDocument();
  });

  it("renders host display names", () => {
    render(<DjReviewsSection reviews={mockReviews} />);
    expect(screen.getByText("Alice B.")).toBeInTheDocument();
    expect(screen.getByText("Bob C.")).toBeInTheDocument();
  });

  it("renders review comments", () => {
    render(<DjReviewsSection reviews={mockReviews} />);
    expect(screen.getByText("Amazing show!")).toBeInTheDocument();
    expect(screen.getByText("Great vibes.")).toBeInTheDocument();
  });

  it("shows empty state when no reviews exist", () => {
    render(<DjReviewsSection reviews={[]} />);
    expect(screen.getByText("No reviews yet.")).toBeInTheDocument();
  });
});
