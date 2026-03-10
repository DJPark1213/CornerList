import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DjGrid from "../components/DjGrid";
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

const makeDj = (id: string, name: string): Dj => ({
  id,
  stageName: name,
  yearsExperience: 1,
  pricePerHour: 100,
  rating: 4.0,
  ratingCount: 10,
  genres: ["Pop"],
  about: "bio",
  equipmentSummary: "gear",
  availabilitySummary: "weekends",
  avatarUrl: null,
  showcaseImages: [],
});

describe("DjGrid", () => {
  it("renders a card for each DJ", () => {
    const djs = [makeDj("a", "DJ Alpha"), makeDj("b", "DJ Beta")];
    render(<DjGrid djs={djs} />);
    expect(screen.getByText("DJ Alpha")).toBeInTheDocument();
    expect(screen.getByText("DJ Beta")).toBeInTheDocument();
  });

  it("renders empty state when no DJs provided", () => {
    render(<DjGrid djs={[]} />);
    expect(screen.getByText(/no djs match/i)).toBeInTheDocument();
  });
});
