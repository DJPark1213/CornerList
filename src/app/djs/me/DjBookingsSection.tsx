"use client";

import { useState } from "react";

type DjBooking = {
  id: string;
  status: string;
  payment_status: string;
  event_date: string;
  start_time: string;
  end_time: string;
  event_type: string | null;
  guest_count: number | null;
  host_name: string | null;
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

export default function DjBookingsSection({ initial }: { initial: DjBooking[] }) {
  const [bookings, setBookings] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const act = async (id: string, action: "accept" | "decline" | "cancel") => {
    if (action === "cancel" && !confirm("Cancel this booking?")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const j = (await res.json()) as { error?: string; status?: string };
      if (!res.ok) throw new Error(j.error ?? "Failed");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status: j.status ?? b.status,
                payment_status:
                  action === "cancel" && b.payment_status === "paid"
                    ? "refunded"
                    : b.payment_status,
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
    return <p className="text-sm text-muted">No booking requests yet.</p>;
  }

  return (
    <div className="space-y-3">
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
                {b.host_name ?? "Unknown host"}
              </span>
              <span className={`text-xs font-semibold ${STATUS_COLOR[b.status] ?? "text-muted"}`}>
                {STATUS_LABEL[b.status] ?? b.status}
                {b.payment_status === "paid" && " · Paid"}
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
            {b.status === "pending" && (
              <>
                <button
                  type="button"
                  disabled={busyId === b.id}
                  onClick={() => void act(b.id, "accept")}
                  className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
                >
                  {busyId === b.id ? "…" : "Accept"}
                </button>
                <button
                  type="button"
                  disabled={busyId === b.id}
                  onClick={() => void act(b.id, "decline")}
                  className="text-sm text-muted hover:text-danger disabled:opacity-50"
                >
                  Decline
                </button>
              </>
            )}
            {(b.status === "accepted" || b.status === "confirmed") && (
              <button
                type="button"
                disabled={busyId === b.id}
                onClick={() => void act(b.id, "cancel")}
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
