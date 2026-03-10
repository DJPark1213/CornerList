import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "../Navbar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

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

describe("Navbar", () => {
  it("renders the CornerList logo text", () => {
    render(<Navbar />);
    expect(screen.getByText("CornerList")).toBeInTheDocument();
  });

  it("renders Join as a DJ link pointing to /join-dj", () => {
    render(<Navbar />);
    const link = screen.getByText("Join as a DJ");
    expect(link.closest("a")).toHaveAttribute("href", "/join-dj");
  });

  it("renders FAQ link", () => {
    render(<Navbar />);
    expect(screen.getByText("FAQ")).toBeInTheDocument();
  });

  it("renders Sign in button", () => {
    render(<Navbar />);
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });
});
