import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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

vi.mock("next/image", () => ({
  default: function MockImage({
    src,
    alt,
    ...rest
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) {
    return <img src={src} alt={alt} {...rest} />;
  },
}));

const mockGetUser = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
    from: mockFrom,
  }),
}));

// Mock fetch for /api/bookings?asDj=1
vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
  new Response(JSON.stringify({ bookings: [] }), { status: 200 })
));

describe("Navbar", () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    // Default: profile query returns null role
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: { role: "host" } }),
        }),
      }),
    });
  });

  it("renders the CornerList logo text", async () => {
    render(<Navbar />);
    await waitFor(() => {
      expect(screen.getByText("CornerList")).toBeInTheDocument();
    });
  });

  it("renders Join as a DJ link pointing to /join-dj", async () => {
    render(<Navbar />);
    await waitFor(() => {
      const link = screen.getByText("Join as a DJ");
      expect(link.closest("a")).toHaveAttribute("href", "/join-dj");
    });
  });

  it("renders FAQ link", async () => {
    render(<Navbar />);
    await waitFor(() => {
      expect(screen.getByText("FAQ")).toBeInTheDocument();
    });
  });

  it("renders Sign in button when logged out", async () => {
    render(<Navbar />);
    await waitFor(() => {
      expect(screen.getByText("Sign in")).toBeInTheDocument();
    });
  });

  it("shows profile image and Sign out when logged in with picture metadata", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "u1",
          email: "test@example.com",
          user_metadata: {
            full_name: "Test User",
            picture: "https://lh3.googleusercontent.com/a/test",
          },
        },
      },
    });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: { role: "host" } }),
        }),
      }),
    });
    render(<Navbar />);
    await waitFor(() => {
      expect(screen.getByTestId("user-avatar")).toBeInTheDocument();
      expect(screen.getByText("Sign out")).toBeInTheDocument();
    });
    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
  });

  it("shows initials fallback and Sign out when logged in without avatar URL", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "u2",
          email: "solo@example.com",
          user_metadata: {},
        },
      },
    });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: { role: "host" } }),
        }),
      }),
    });
    render(<Navbar />);
    await waitFor(() => {
      expect(screen.getByTestId("user-avatar-fallback")).toHaveTextContent("SO");
      expect(screen.getByText("Sign out")).toBeInTheDocument();
    });
    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
  });
});
