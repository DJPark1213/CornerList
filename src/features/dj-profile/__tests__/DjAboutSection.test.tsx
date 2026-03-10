import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DjAboutSection from "../components/DjAboutSection";

describe("DjAboutSection", () => {
  it("renders the About heading", () => {
    render(<DjAboutSection about="Some bio text" />);
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("renders the bio text", () => {
    render(<DjAboutSection about="I love mixing house music." />);
    expect(screen.getByText("I love mixing house music.")).toBeInTheDocument();
  });
});
