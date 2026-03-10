import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DjCard from "../components/DjCard";
import { Dj } from "@/types/dj";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockDj: Dj = {
  id: "test-dj",
  stageName: "DJ Test",
  yearsExperience: 3,
  pricePerHour: 100,
  rating: 4.5,
  ratingCount: 20,
  genres: ["Hip-Hop", "Pop"],
  about: "Test bio",
  equipmentSummary: "Test gear",
  availabilitySummary: "Weekends",
  avatarUrl: null,
  showcaseImages: [],
};

describe("DjCard", () => {
  it("renders stage name", () => {
    render(<DjCard dj={mockDj} />);
    expect(screen.getByText("DJ Test")).toBeInTheDocument();
  });

  it("renders price per hour", () => {
    render(<DjCard dj={mockDj} />);
    expect(screen.getByText("$100")).toBeInTheDocument();
  });

  it("renders rating", () => {
    render(<DjCard dj={mockDj} />);
    expect(screen.getByText("★ 4.5")).toBeInTheDocument();
  });

  it("renders genre tags", () => {
    render(<DjCard dj={mockDj} />);
    expect(screen.getByText("Hip-Hop")).toBeInTheDocument();
    expect(screen.getByText("Pop")).toBeInTheDocument();
  });

  it("wraps content in a link to the DJ profile", () => {
    render(<DjCard dj={mockDj} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/djs/test-dj");
  });
});
