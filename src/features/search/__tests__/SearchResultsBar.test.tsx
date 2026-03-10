import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchResultsBar, { SearchParams } from "../components/SearchResultsBar";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

const defaultParams: SearchParams = {
  q: "",
  genre: "",
  date: "",
  maxPrice: "",
};

describe("SearchResultsBar", () => {
  const onChange = vi.fn();

  beforeEach(() => {
    onChange.mockClear();
    replaceMock.mockClear();
  });

  it("renders result count", () => {
    render(
      <SearchResultsBar params={defaultParams} onChange={onChange} resultCount={5} />
    );
    expect(screen.getByText("5 DJs found")).toBeInTheDocument();
  });

  it("shows singular 'DJ' for count of 1", () => {
    render(
      <SearchResultsBar params={defaultParams} onChange={onChange} resultCount={1} />
    );
    expect(screen.getByText("1 DJ found")).toBeInTheDocument();
  });

  it("pre-fills inputs from params", () => {
    const params: SearchParams = {
      q: "Luna",
      genre: "EDM",
      date: "2026-06-15",
      maxPrice: "200",
    };
    render(
      <SearchResultsBar params={params} onChange={onChange} resultCount={3} />
    );
    expect(screen.getByDisplayValue("Luna")).toBeInTheDocument();
    expect(screen.getByDisplayValue("200")).toBeInTheDocument();
  });

  it("calls onChange when text input changes", async () => {
    const user = userEvent.setup();
    render(
      <SearchResultsBar params={defaultParams} onChange={onChange} resultCount={6} />
    );
    const input = screen.getByPlaceholderText("DJ name or keywords");
    await user.type(input, "A");

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.q).toBe("A");
  });
});
