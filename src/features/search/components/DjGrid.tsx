import { Dj } from "@/types/dj";
import DjCard from "./DjCard";

type Props = {
  djs: Dj[];
};

export default function DjGrid({ djs }: Props) {
  if (djs.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-muted">No DJs match your filters.</p>
        <p className="mt-1 text-sm text-muted/70">
          Try adjusting your budget or removing some filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {djs.map((dj) => (
        <DjCard key={dj.id} dj={dj} />
      ))}
    </div>
  );
}
