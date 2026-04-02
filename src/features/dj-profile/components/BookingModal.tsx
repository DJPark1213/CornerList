"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Dj } from "@/types/dj";

type Props = {
  dj: Dj;
  open: boolean;
  onClose: () => void;
};

export default function BookingModal({ dj, open, onClose }: Props) {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventType, setEventType] = useState("House party");
  const [guestCount, setGuestCount] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsSignedIn(!!data.user);
    });
  }, [open]);

  if (!open) return null;

  const reset = () => {
    setEventDate("");
    setStartTime("");
    setEndTime("");
    setEventType("House party");
    setGuestCount("");
    setNotes("");
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 text-muted hover:text-foreground"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-foreground">
          Request Booking
        </h2>
        <p className="mt-1 text-sm text-muted">
          {dj.stageName} · ${dj.pricePerHour}/hr
        </p>

        {isSignedIn === false ? (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted">You need to be signed in to request a booking.</p>
            <button
              type="button"
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: { redirectTo: `${window.location.origin}/auth/callback` },
                });
              }}
              className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Sign in with Google
            </button>
          </div>
        ) : success ? (
          <p className="mt-6 text-sm text-foreground">
            Request sent. The DJ will be notified.
          </p>
        ) : (
          <form
            className="mt-5 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setSubmitting(true);
              try {
                const res = await fetch("/api/bookings", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    djId: dj.id,
                    eventDate,
                    startTime,
                    endTime,
                    guestCount: guestCount ? Number(guestCount) : undefined,
                    eventType,
                    notes: notes || undefined,
                  }),
                });
                const data = (await res.json().catch(() => ({}))) as {
                  error?: string;
                };
                if (!res.ok) {
                  throw new Error(data.error || "Could not send request");
                }
                setSuccess(true);
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Something went wrong"
                );
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {error && (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Event date
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                style={{ colorScheme: "dark" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  Start time
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  style={{ colorScheme: "dark" }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  End time
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Event type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              >
                <option>House party</option>
                <option>Formal</option>
                <option>Bar event</option>
                <option>Campus event</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Guest count (optional)
              </label>
              <input
                type="number"
                min={1}
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                placeholder="~50"
                className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Notes (optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or details..."
                className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send Request"}
            </button>

            <p className="text-center text-xs text-muted">
              You will be charged once the DJ approves your request.
            </p>
          </form>
        )}

        {success && (
          <button
            type="button"
            onClick={handleClose}
            className="mt-4 w-full rounded-lg border border-border py-2 text-sm font-medium text-foreground hover:border-primary"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
