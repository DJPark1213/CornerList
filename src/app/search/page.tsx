"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Genre } from "@/types";
import {
  DjGrid,
  SearchResultsBar,
  MOCK_DJS,
  filterDjs,
} from "@/features/search";
import type { SearchParams } from "@/features/search";

function SearchContent() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<SearchParams>({
    q: searchParams.get("q") ?? "",
    genre: (searchParams.get("genre") as Genre) ?? "",
    date: searchParams.get("date") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
  });

  const filtered = useMemo(() => filterDjs(MOCK_DJS, filters), [filters]);

  return (
    <>
      <SearchResultsBar
        params={filters}
        onChange={setFilters}
        resultCount={filtered.length}
      />

      <section className="mx-auto max-w-6xl px-4 py-8">
        <DjGrid djs={filtered} />
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
