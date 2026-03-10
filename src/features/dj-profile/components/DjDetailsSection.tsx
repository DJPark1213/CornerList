type Props = {
  equipmentSummary: string;
  availabilitySummary: string;
};

export default function DjDetailsSection({
  equipmentSummary,
  availabilitySummary,
}: Props) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <section className="rounded-xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Equipment & Setup
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground">
          {equipmentSummary}
        </p>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Availability
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground">
          {availabilitySummary}
        </p>
      </section>
    </div>
  );
}
