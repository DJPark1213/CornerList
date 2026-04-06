"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Dj, Review } from "@/types/dj";
import {
  DjProfileHeader,
  ProfileBookingPanel,
  DjAboutSection,
  DjDetailsSection,
  DjReviewsSection,
  ReviewForm,
  BookingModal,
} from "@/features/dj-profile";

type Props = {
  dj: Dj;
  reviews: Review[];
};

export default function DjProfilePageClient({ dj, reviews }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoPayBookingId = searchParams.get("pay");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [reviewList, setReviewList] = useState(reviews);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/search"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Back to search
      </Link>

      <div className="space-y-8">
        <DjProfileHeader
          dj={dj}
          onRequestBooking={() => setBookingOpen(true)}
        />
        <ProfileBookingPanel dj={dj} autoPayBookingId={autoPayBookingId} />
        <DjAboutSection about={dj.about} />
        <DjDetailsSection
          equipmentSummary={dj.equipmentSummary}
          availabilitySummary={dj.availabilitySummary}
        />

        <section>
          <h2 className="text-lg font-semibold text-foreground">Showcase</h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {dj.showcaseImages.length > 0 ? (
              dj.showcaseImages.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${src}-${i}`}
                  src={src}
                  alt=""
                  className="aspect-video w-full rounded-lg border border-border object-cover"
                />
              ))
            ) : (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex aspect-video items-center justify-center rounded-lg border border-border bg-surface text-sm text-muted/40"
                >
                  Media {i}
                </div>
              ))
            )}
          </div>
        </section>

        <ReviewForm
          djId={dj.id}
          onReviewSubmitted={() => {
            router.refresh();
          }}
        />
        <DjReviewsSection reviews={reviewList} />
      </div>

      <BookingModal
        dj={dj}
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </main>
  );
}
