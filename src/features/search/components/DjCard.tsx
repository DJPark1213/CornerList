import Link from "next/link";
import { Dj } from "@/types/dj";

type Props = {
  dj: Dj;
};

export default function DjCard({ dj }: Props) {
  return (
    <Link href={`/djs/${dj.id}`} className="group block">
      <article className="flex h-full flex-col rounded-xl border border-border bg-surface p-4 shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-primary-glow">
        {/* Image placeholder */}
        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gradient-to-br from-surface-light to-background">
          <div className="flex h-full items-center justify-center text-3xl text-muted/30">
            ♪
          </div>
        </div>

        <div className="mt-3 flex-1">
          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {dj.stageName}
          </h3>
          <div className="mt-1 flex flex-wrap gap-1">
            {dj.genres.map((g) => (
              <span
                key={g}
                className="rounded-full bg-surface-light px-2 py-0.5 text-[11px] font-medium text-muted"
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm font-semibold text-foreground">
            ${dj.pricePerHour}
            <span className="text-xs font-normal text-muted"> / hr</span>
          </span>
          <span className="flex items-center gap-1 text-sm text-star">
            ★ {dj.rating.toFixed(1)}
            <span className="text-xs text-muted">({dj.ratingCount})</span>
          </span>
        </div>
      </article>
    </Link>
  );
}
