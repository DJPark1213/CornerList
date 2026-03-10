type Props = {
  currentStep: number;
  totalSteps: number;
  labels: string[];
};

export default function StepIndicator({
  currentStep,
  totalSteps,
  labels,
}: Props) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div
          key={step}
          className={`flex-1 rounded-full border px-3 py-1.5 text-center text-xs font-medium transition-colors ${
            step === currentStep
              ? "border-primary bg-primary/15 text-primary-hover"
              : step < currentStep
                ? "border-primary/40 bg-primary/5 text-primary/60"
                : "border-border bg-surface text-muted"
          }`}
        >
          {labels[step - 1]}
        </div>
      ))}
    </div>
  );
}
