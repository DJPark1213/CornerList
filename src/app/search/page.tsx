"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Genre } from "@/types";
import { DjGrid, SearchResultsBar } from "@/features/search";
import type { SearchParams } from "@/features/search";
import type { Dj } from "@/types/dj";

function SearchContent() {
  const searchParams = useSearchParams();

  const filters = useMemo<SearchParams>(
    () => ({
      q: searchParams.get("q") ?? "",
      genre: (searchParams.get("genre") as Genre) ?? "",
      date: searchParams.get("date") ?? "",
      maxPrice: searchParams.get("maxPrice") ?? "",
    }),
    [searchParams]
  );

  const { data, isPending, isError } = useQuery({
    queryKey: ["djs", filters.q, filters.genre, filters.maxPrice],
    queryFn: async (): Promise<{ djs: Dj[] }> => {
      const sp = new URLSearchParams();
      if (filters.q) sp.set("q", filters.q);
      if (filters.genre) sp.set("genre", filters.genre);
      if (filters.maxPrice) sp.set("maxPrice", filters.maxPrice);
      const res = await fetch(`/api/djs?${sp.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load DJs");
      }
      return res.json();
    },
  });

  const djs = data?.djs ?? [];

  return (
    <>
      <SearchResultsBar
        params={filters}
        onChange={() => undefined}
        resultCount={djs.length}
      />

      <section className="mx-auto max-w-6xl px-4 py-8">
        {isPending ? (
          <div className="py-16 text-center text-muted">Loading DJs…</div>
        ) : isError ? (
          <div className="py-16 text-center text-destructive">
            Something went wrong. Try again.
          </div>
        ) : (
          <DjGrid djs={djs} />
        )}
      </section>
    </>
  );
}

export default function SearchPage() {
  return (
    <main>
      <Suspense
        fallback={
          <div className="py-20 text-center text-muted">Loading...</div>
        }
      >
        <SearchContent />
      </Suspense>
    </main>
  );
}
