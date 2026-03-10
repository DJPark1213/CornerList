import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StepIndicator from "../components/StepIndicator";

describe("StepIndicator", () => {
  const labels = ["Basics", "Style & Rate", "Photo", "Bio & Preview"];

  it("renders all step labels", () => {
    render(<StepIndicator currentStep={1} totalSteps={4} labels={labels} />);
    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("highlights the current step with active styling", () => {
    render(<StepIndicator currentStep={2} totalSteps={4} labels={labels} />);
    const activeStep = screen.getByText("Style & Rate");
    expect(activeStep.className).toContain("border-primary");
    expect(activeStep.className).toContain("bg-primary/15");
  });

  it("marks completed steps differently from future steps", () => {
    render(<StepIndicator currentStep={3} totalSteps={4} labels={labels} />);
    const completedStep = screen.getByText("Basics");
    const futureStep = screen.getByText("Bio & Preview");
    expect(completedStep.className).toContain("border-primary/40");
    expect(futureStep.className).toContain("border-border");
  });
});
