import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchHero from "../components/SearchHero";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("SearchHero", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("renders the hero heading", () => {
    render(<SearchHero />);
    expect(screen.getByText(/book the/i)).toBeInTheDocument();
    expect(screen.getByText(/perfect dj/i)).toBeInTheDocument();
  });

  it("renders search input fields", () => {
    render(<SearchHero />);
    expect(screen.getByPlaceholderText("Search by name...")).toBeInTheDocument();
    expect(screen.getByLabelText("Search")).toBeInTheDocument();
  });

  it("navigates to /search with empty params when search is clicked with no input", async () => {
    const user = userEvent.setup();
    render(<SearchHero />);

    await user.click(screen.getByLabelText("Search"));

    expect(pushMock).toHaveBeenCalledWith("/search?");
  });

  it("builds correct query string from filled inputs", async () => {
    const user = userEvent.setup();
    render(<SearchHero />);

    await user.type(screen.getByPlaceholderText("Search by name..."), "Mike");
    await user.click(screen.getByLabelText("Search"));

    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("q=Mike"));
  });

  it("navigates on Enter key press", async () => {
    const user = userEvent.setup();
    render(<SearchHero />);

    const input = screen.getByPlaceholderText("Search by name...");
    await user.type(input, "Luna{Enter}");

    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("q=Luna"));
  });
});
