"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDjById } from "@/features/search";
import {
  DjProfileHeader,
  DjAboutSection,
  DjDetailsSection,
  DjReviewsSection,
  BookingModal,
  getReviewsByDjId,
} from "@/features/dj-profile";

export default function DjProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const dj = getDjById(id);
  const [bookingOpen, setBookingOpen] = useState(false);

  if (!dj) {
    notFound();
  }

  const reviews = getReviewsByDjId(dj.id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Back to search
      </Link>

      <div className="space-y-8">
        <DjProfileHeader dj={dj} onRequestBooking={() => setBookingOpen(true)} />
        <DjAboutSection about={dj.about} />
        <DjDetailsSection
          equipmentSummary={dj.equipmentSummary}
          availabilitySummary={dj.availabilitySummary}
        />

        {/* Showcase placeholder */}
        <section>
          <h2 className="text-lg font-semibold text-foreground">Showcase</h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex aspect-video items-center justify-center rounded-lg border border-border bg-surface text-sm text-muted/40"
              >
                Media {i}
              </div>
            ))}
          </div>
        </section>

        <DjReviewsSection reviews={reviews} />
      </div>

      <BookingModal
        dj={dj}
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </main>
  );
}
