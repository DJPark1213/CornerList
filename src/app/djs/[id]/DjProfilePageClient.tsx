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

        {dj.showcaseMedia.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground">Showcase</h2>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {dj.showcaseMedia.map((item) =>
                item.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={item.id}
                    src={item.url}
                    alt=""
                    className="aspect-video w-full rounded-lg border border-border object-cover"
                  />
                ) : (
                  <video
                    key={item.id}
                    src={item.url}
                    controls
                    playsInline
                    className="aspect-video w-full rounded-lg border border-border object-cover"
                  />
                )
              )}
            </div>
          </section>
        )}

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
