"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Booking = {
  id: string;
  status: string;
  payment_status: string;
  event_date: string;
  start_time: string;
  end_time: string;
  event_type: string | null;
  guest_count: number | null;
  dj_profiles: { id: string; stage_name: string } | null;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "text-yellow-400",
  accepted: "text-blue-400",
  declined: "text-danger",
  confirmed: "text-green-400",
  cancelled: "text-muted",
};

const CANCELLABLE = ["pending", "accepted", "confirmed"];

export default function BookingsClient({ initial }: { initial: Booking[] }) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async (bookingId: string) => {
    setPayingId(bookingId);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const j = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(j.error ?? "Failed to create checkout");
      if (j.url) router.push(j.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPayingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Failed to cancel");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status: "cancelled",
                payment_status: b.payment_status === "paid" ? "refunded" : b.payment_status,
              }
            : b
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="mt-12 text-center">
        <p className="text-muted">You haven't made any bookings yet.</p>
        <Link
          href="/search"
          className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Find a DJ
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {error && (
        <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      {bookings.map((b) => (
        <div
          key={b.id}
          className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {b.dj_profiles?.stage_name ?? "Unknown DJ"}
              </span>
              <span className={`text-xs font-semibold ${STATUS_COLOR[b.status] ?? "text-muted"}`}>
                {STATUS_LABEL[b.status] ?? b.status}
                {b.payment_status === "refunded" && " · Refunded"}
              </span>
            </div>
            <p className="text-sm text-muted">
              {b.event_date} · {b.start_time}–{b.end_time}
              {b.event_type ? ` · ${b.event_type}` : ""}
              {b.guest_count ? ` · ${b.guest_count} guests` : ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {b.status === "accepted" && b.payment_status !== "paid" && (
              <button
                type="button"
                disabled={payingId === b.id}
                onClick={() => void handlePay(b.id)}
                className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
              >
                {payingId === b.id ? "Redirecting…" : "Pay now"}
              </button>
            )}
            {b.dj_profiles && (
              <Link
                href={`/djs/${b.dj_profiles.id}`}
                className="text-sm text-muted hover:text-foreground"
              >
                View DJ →
              </Link>
            )}
            {CANCELLABLE.includes(b.status) && (
              <button
                type="button"
                disabled={busyId === b.id}
                onClick={() => void handleCancel(b.id)}
                className="text-sm text-muted hover:text-danger disabled:opacity-50"
              >
                {busyId === b.id ? "Cancelling…" : "Cancel"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
