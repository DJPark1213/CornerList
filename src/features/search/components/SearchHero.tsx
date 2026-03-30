"use client";

import { useState } from "react";
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

export default function SearchHero() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState<Genre | "">("");
  const [eventDate, setEventDate] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (genre) params.set("genre", genre);
    if (eventDate) params.set("date", eventDate);
    router.push(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[#1a103a] via-[#0f0a2a] to-[#0a0a1a]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--color-primary-glow)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_#a78bfa20_0%,_transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          Book the{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Perfect DJ
          </span>{" "}
          for Your Event.
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted md:text-lg">
          Discover verified DJs for weddings, parties, formals, and campus
          events in Charlottesville.
        </p>

        {/* Airbnb-style search bar (budget filter lives on /search only) */}
        <div className="mt-8 overflow-hidden rounded-full border border-border bg-surface shadow-2xl shadow-black/40 md:flex">
          {/* Name / Genre */}
          <div className="flex-1 border-b border-border px-5 py-3 md:border-b-0 md:border-r">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted">
              DJ or Genre
            </label>
            <div className="mt-0.5 flex items-center gap-2">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by name..."
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted/50"
              />
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as Genre | "")}
                className="shrink-0 bg-transparent text-sm text-muted outline-none"
              >
                <option value="">Any</option>
                {ALL_GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="flex flex-1 items-center border-b border-border px-5 py-3 md:border-b-0 md:border-r">
            <div className="min-w-0 flex-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted">
                Date
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                onKeyDown={handleKeyDown}
                className="mt-0.5 w-full bg-transparent text-sm text-foreground outline-none"
              />
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center justify-center px-4 py-3 md:justify-end">
            <button
              type="button"
              onClick={handleSearch}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover hover:shadow-primary/50"
              aria-label="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
