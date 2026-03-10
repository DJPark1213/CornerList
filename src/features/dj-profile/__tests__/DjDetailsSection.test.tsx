import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DjDetailsSection from "../components/DjDetailsSection";

describe("DjDetailsSection", () => {
  it("renders equipment summary", () => {
    render(
      <DjDetailsSection
        equipmentSummary="Pioneer DDJ-1000, JBL speakers"
        availabilitySummary="Weekends only"
      />
    );
    expect(screen.getByText("Equipment & Setup")).toBeInTheDocument();
    expect(
      screen.getByText("Pioneer DDJ-1000, JBL speakers")
    ).toBeInTheDocument();
  });

  it("renders availability summary", () => {
    render(
      <DjDetailsSection
        equipmentSummary="Gear"
        availabilitySummary="Mon-Fri evenings"
      />
    );
    expect(screen.getByText("Availability")).toBeInTheDocument();
    expect(screen.getByText("Mon-Fri evenings")).toBeInTheDocument();
  });
});
