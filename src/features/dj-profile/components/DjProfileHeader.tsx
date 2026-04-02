import Image from "next/image";
import { Dj } from "@/types/dj";

type Props = {
  dj: Dj;
  onRequestBooking?: () => void;
  isOwner?: boolean;
};

export default function DjProfileHeader({ dj, onRequestBooking, isOwner }: Props) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      {/* Avatar */}
      {dj.avatarUrl ? (
        <Image
          src={dj.avatarUrl}
          alt={dj.stageName}
          width={128}
          height={128}
          className="h-32 w-32 shrink-0 rounded-full border border-border object-cover"
        />
      ) : (
        <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/20 text-5xl text-muted/40">
          ♪
        </div>
      )}

      <div className="flex-1">
        <h1 className="text-3xl font-bold tracking-tight">{dj.stageName}</h1>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1 text-star">
            ★ {dj.rating.toFixed(1)}
            <span className="text-sm text-muted">
              ({dj.ratingCount} reviews)
            </span>
          </span>
          <span className="text-sm text-muted">
            {dj.yearsExperience} yrs experience
          </span>
          {dj.location && (
            <span className="text-sm text-muted">📍 {dj.location}</span>
          )}
          <span className="text-sm font-semibold text-foreground">
            ${dj.pricePerHour}/hr
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {dj.genres.map((g) => (
            <span
              key={g}
              className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-hover"
            >
              {g}
            </span>
          ))}
        </div>

        {!isOwner && onRequestBooking && (
          <button
            onClick={onRequestBooking}
            className="mt-5 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-primary/40"
          >
            Request Booking
          </button>
        )}
      </div>
    </div>
  );
}
