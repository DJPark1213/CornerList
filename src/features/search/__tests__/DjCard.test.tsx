import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DjCard from "../components/DjCard";
import type { Dj } from "@/types/dj";

const baseDj: Dj = {
  id: "test-id",
  stageName: "DJ Test",
  avatarUrl: null,
  genres: ["Hip-Hop", "EDM"],
  pricePerHour: 150,
  rating: 4.5,
  ratingCount: 12,
  yearsExperience: 5,
  about: "Test bio",
  equipmentSummary: "Pioneer CDJs",
  availabilitySummary: "Weekends",
  location: "New York, NY",
  showcaseImages: [],
};

describe("DjCard", () => {
  it("renders the DJ stage name", () => {
    render(<DjCard dj={baseDj} />);
    expect(screen.getByText("DJ Test")).toBeInTheDocument();
  });

  it("renders all genres as badges", () => {
    render(<DjCard dj={baseDj} />);
    expect(screen.getByText("Hip-Hop")).toBeInTheDocument();
    expect(screen.getByText("EDM")).toBeInTheDocument();
  });

  it("renders price per hour", () => {
    render(<DjCard dj={baseDj} />);
    expect(screen.getByText("$150")).toBeInTheDocument();
    expect(screen.getByText("/ hr")).toBeInTheDocument();
  });

  it("renders rating and count", () => {
    render(<DjCard dj={baseDj} />);
    // Rating is rendered as "★ 4.5" in one element
    expect(screen.getByText(/4\.5/)).toBeInTheDocument();
    expect(screen.getByText("(12)")).toBeInTheDocument();
  });

  it("renders location when provided", () => {
    render(<DjCard dj={baseDj} />);
    expect(screen.getByText(/New York, NY/)).toBeInTheDocument();
  });

  it("does not render location when null", () => {
    render(<DjCard dj={{ ...baseDj, location: "" }} />);
    expect(screen.queryByText(/New York/)).not.toBeInTheDocument();
  });

  it("renders placeholder icon when no avatar", () => {
    render(<DjCard dj={baseDj} />);
    expect(screen.getByText("♪")).toBeInTheDocument();
  });

  it("renders avatar image when avatarUrl is provided", () => {
    render(<DjCard dj={{ ...baseDj, avatarUrl: "https://example.com/avatar.jpg" }} />);
    const img = screen.getByRole("img", { name: "DJ Test" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src");
  });

  it("links to the DJ profile page", () => {
    render(<DjCard dj={baseDj} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/djs/test-id");
  });
});
