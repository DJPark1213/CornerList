"use client";

import { useRouter } from "next/navigation";
import { Genre } from "@/types/dj";

const ALL_GENRES: Genre[] = [
  "Hip-Hop",
  "EDM",
  "Pop",
  "House",
  "R&B",
  "Latin",
  "Rock",
  "Top 40",
];

export type SearchParams = {
  q: string;
  genre: Genre | "";
  date: string;
  maxPrice: string;
  location: string;
};

type Props = {
  params: SearchParams;
  onChange: (params: SearchParams) => void;
  resultCount: number;
};

export default function SearchResultsBar({
  params,
  onChange,
  resultCount,
}: Props) {
  const router = useRouter();

  const set = (partial: Partial<SearchParams>) => {
    const next = { ...params, ...partial };
    onChange(next);

    const sp = new URLSearchParams();
    if (next.q) sp.set("q", next.q);
    if (next.genre) sp.set("genre", next.genre);
    if (next.date) sp.set("date", next.date);
    if (next.maxPrice) sp.set("maxPrice", next.maxPrice);
    if (next.location) sp.set("location", next.location);
    router.replace(`/search?${sp.toString()}`);
  };

  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
        {/* Inline mini search bar */}
        <input
          type="text"
          value={params.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="DJ name or keywords"
          className="rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary sm:w-48"
        />

        <select
          value={params.genre}
          onChange={(e) => set({ genre: e.target.value as Genre | "" })}
          className="rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary sm:w-36"
        >
          <option value="">Any genre</option>
          {ALL_GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={params.date}
          onChange={(e) => set({ date: e.target.value })}
          className="rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary sm:w-40"
          style={{ colorScheme: "dark" }}
        />

        <input
          type="text"
          value={params.location}
          onChange={(e) => set({ location: e.target.value })}
          placeholder="Location"
          className="rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary sm:w-36"
        />

        <input
          type="number"
          min={0}
          value={params.maxPrice}
          onChange={(e) => set({ maxPrice: e.target.value })}
          placeholder="Max $/hr"
          className="rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary sm:w-28"
        />

        <span className="ml-auto text-sm text-muted">
          {resultCount} {resultCount === 1 ? "DJ" : "DJs"} found
        </span>
      </div>
    </div>
  );
}
