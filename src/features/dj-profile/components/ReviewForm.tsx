"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type EligibleBooking = {
  id: string;
  event_date: string;
};

type Props = {
  djId: string;
  onReviewSubmitted: () => void;
};

export default function ReviewForm({ djId, onReviewSubmitted }: Props) {
  const [eligibleBookings, setEligibleBookings] = useState<EligibleBooking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const loadEligible = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Confirmed bookings for this DJ by this user that haven't been reviewed yet
    const { data: bookings } = await supabase
      .from("bookings")
      .select("id, event_date")
      .eq("host_id", user.id)
      .eq("dj_id", djId)
      .eq("status", "confirmed")
      .eq("payment_status", "paid")
      .order("event_date", { ascending: false });

    if (!bookings?.length) return;

    // Filter out already-reviewed bookings
    const { data: reviewed } = await supabase
      .from("reviews")
      .select("booking_id")
      .in(
        "booking_id",
        bookings.map((b) => b.id)
      );

    const reviewedIds = new Set((reviewed ?? []).map((r) => r.booking_id));
    const unreviewed = bookings.filter((b) => !reviewedIds.has(b.id));
    setEligibleBookings(unreviewed);
    if (unreviewed.length > 0) setSelectedBookingId(unreviewed[0].id);
  }, [djId]);

  useEffect(() => {
    void loadEligible();
  }, [loadEligible]);

  if (eligibleBookings.length === 0 || done) return null;

  const handleSubmit = async () => {
    if (!rating || !comment.trim() || !selectedBookingId) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          djId,
          bookingId: selectedBookingId,
          rating,
          comment,
        }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Failed to submit");
      setDone(true);
      onReviewSubmitted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-primary/30 bg-primary/5 p-5">
      <h3 className="text-base font-semibold text-foreground">Leave a Review</h3>
      <p className="mt-1 text-xs text-muted">
        Share your experience from your confirmed booking.
      </p>

      {eligibleBookings.length > 1 && (
        <select
          value={selectedBookingId}
          onChange={(e) => setSelectedBookingId(e.target.value)}
          className="mt-3 w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        >
          {eligibleBookings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.event_date}
            </option>
          ))}
        </select>
      )}

      {/* Star rating */}
      <div className="mt-4 flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="text-2xl transition-colors"
          >
            <span className={(hovered || rating) >= star ? "text-star" : "text-muted/30"}>
              ★
            </span>
          </button>
        ))}
      </div>

      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="How was your experience?"
        className="mt-3 w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
      />

      {error && (
        <p className="mt-2 text-sm text-danger">{error}</p>
      )}

      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={submitting || !rating || !comment.trim()}
        className="mt-3 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-40"
      >
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </section>
  );
}
