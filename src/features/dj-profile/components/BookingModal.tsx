"use client";

import { Dj } from "@/types/dj";

type Props = {
  dj: Dj;
  open: boolean;
  onClose: () => void;
};

export default function BookingModal({ dj, open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <button
          onClick={onClose}
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

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            alert(
              "Booking request submitted! (This is a mock – backend coming soon.)"
            );
            onClose();
          }}
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Event date
            </label>
            <input
              type="date"
              required
              className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
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
                className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                End time
              </label>
              <input
                type="time"
                required
                className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Event type
            </label>
            <select className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
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
              placeholder="Any special requests or details..."
              className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover"
          >
            Send Request
          </button>

          <p className="text-center text-xs text-muted">
            You will be charged once the DJ approves your request.
          </p>
        </form>
      </div>
    </div>
  );
}
