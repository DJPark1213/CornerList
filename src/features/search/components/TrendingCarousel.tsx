"use client";

import { useState } from "react";
import { Dj } from "@/types/dj";
import DjCard from "./DjCard";

type Props = {
  djs: Dj[];
  perPage?: number;
  title?: string;
};

export default function TrendingCarousel({ djs, perPage = 3, title }: Props) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(djs.length / perPage);
  const start = page * perPage;
  const visible = djs.slice(start, start + perPage);

  if (djs.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-muted">No artists listed yet.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="mb-6 flex items-center justify-between">
        {title && (
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {title}
          </h2>
        )}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
              aria-label="Previous"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages - 1}
              aria-label="Next"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((dj) => (
          <DjCard key={dj.id} dj={dj} />
        ))}
      </div>
    </div>
  );
}
