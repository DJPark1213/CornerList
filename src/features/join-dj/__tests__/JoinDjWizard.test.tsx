import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JoinDjWizard from "../components/JoinDjWizard";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("JoinDjWizard", () => {
  beforeEach(() => {
    push.mockClear();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        djProfileId: "00000000-0000-0000-0000-000000000001",
      }),
    });
  });

  it("renders step 1 by default", () => {
    render(<JoinDjWizard />);
    expect(screen.getByText("Join CornerList as a DJ")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. DJ Mike Beats")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
  });

  it("disables Next button when required fields are empty on step 1", () => {
    render(<JoinDjWizard />);
    const nextBtn = screen.getByText("Next");
    expect(nextBtn).toBeDisabled();
  });

  it("enables Next button once stage name, location and email are filled", async () => {
    const user = userEvent.setup();
    render(<JoinDjWizard />);

    await user.type(screen.getByPlaceholderText("e.g. DJ Mike Beats"), "DJ Test");
    await user.type(screen.getByPlaceholderText("e.g. Charlottesville, VA"), "New York, NY");
    await user.type(screen.getByPlaceholderText("your@email.com"), "test@test.com");

    expect(screen.getByText("Next")).toBeEnabled();
  });

  it("advances from step 1 to step 2", async () => {
    const user = userEvent.setup();
    render(<JoinDjWizard />);

    await user.type(screen.getByPlaceholderText("e.g. DJ Mike Beats"), "DJ Test");
    await user.type(screen.getByPlaceholderText("e.g. Charlottesville, VA"), "New York, NY");
    await user.type(screen.getByPlaceholderText("your@email.com"), "t@t.com");
    await user.click(screen.getByText("Next"));

    expect(screen.getByText(/genres/i)).toBeInTheDocument();
    expect(screen.getByText("Hip-Hop")).toBeInTheDocument();
  });

  it("disables Back button on step 1", () => {
    render(<JoinDjWizard />);
    expect(screen.getByText("Back")).toBeDisabled();
  });

  it("toggles genre selection on step 2", async () => {
    const user = userEvent.setup();
    render(<JoinDjWizard />);

    await user.type(screen.getByPlaceholderText("e.g. DJ Mike Beats"), "DJ Test");
    await user.type(screen.getByPlaceholderText("e.g. Charlottesville, VA"), "New York, NY");
    await user.type(screen.getByPlaceholderText("your@email.com"), "t@t.com");
    await user.click(screen.getByText("Next"));

    const edm = screen.getByText("EDM");
    await user.click(edm);
    expect(edm.className).toContain("border-primary");

    await user.click(edm);
    expect(edm.className).toContain("border-border");
  });

  it("disables Next on step 2 without genre and price", async () => {
    const user = userEvent.setup();
    render(<JoinDjWizard />);

    await user.type(screen.getByPlaceholderText("e.g. DJ Mike Beats"), "DJ Test");
    await user.type(screen.getByPlaceholderText("e.g. Charlottesville, VA"), "New York, NY");
    await user.type(screen.getByPlaceholderText("your@email.com"), "t@t.com");
    await user.click(screen.getByText("Next"));

    expect(screen.getByText("Next")).toBeDisabled();
  });

  it("navigates back from step 2 to step 1", async () => {
    const user = userEvent.setup();
    render(<JoinDjWizard />);

    await user.type(screen.getByPlaceholderText("e.g. DJ Mike Beats"), "DJ Test");
    await user.type(screen.getByPlaceholderText("e.g. Charlottesville, VA"), "New York, NY");
    await user.type(screen.getByPlaceholderText("your@email.com"), "t@t.com");
    await user.click(screen.getByText("Next"));
    await user.click(screen.getByText("Back"));

    expect(screen.getByPlaceholderText("e.g. DJ Mike Beats")).toBeInTheDocument();
  });

  it("completes the full wizard and navigates to the new DJ profile", async () => {
    const user = userEvent.setup();
    render(<JoinDjWizard />);

    await user.type(screen.getByPlaceholderText("e.g. DJ Mike Beats"), "DJ Flow");
    await user.type(screen.getByPlaceholderText("e.g. Charlottesville, VA"), "New York, NY");
    await user.type(screen.getByPlaceholderText("your@email.com"), "dj@flow.com");
    await user.click(screen.getByText("Next"));

    await user.click(screen.getByText("Pop"));
    await user.type(screen.getByPlaceholderText("e.g. 150"), "100");
    await user.click(screen.getByText("Next"));

    await user.click(screen.getByText("Next"));

    expect(screen.getByText("Finish")).toBeInTheDocument();
    await user.click(screen.getByText("Finish"));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        "/djs/00000000-0000-0000-0000-000000000001"
      );
    });
  });
});
