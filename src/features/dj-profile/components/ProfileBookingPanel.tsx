"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Dj } from "@/types/dj";

type BookingRow = {
  id: string;
  status: string;
  payment_status: string;
  event_date: string;
  start_time: string;
  end_time: string;
  dj_id: string;
  host?: { full_name: string | null; email: string | null } | null;
};

export default function ProfileBookingPanel({ dj, autoPayBookingId }: { dj: Dj; autoPayBookingId?: string | null }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [hostBookings, setHostBookings] = useState<BookingRow[]>([]);
  const [djBookings, setDjBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const autoPayFired = useRef(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUserId(null);
      setRole(null);
      setHostBookings([]);
      setDjBookings([]);
      setLoading(false);
      return;
    }
    setUserId(user.id);
    const { data: prof } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const r = prof?.role ?? null;
    setRole(r);

    // Always fetch bookings this user has made with this DJ
    const hostRes = await fetch(
      `/api/bookings?djId=${encodeURIComponent(dj.id)}`
    );
    const hostJson = (await hostRes.json()) as { bookings?: BookingRow[] };
    setHostBookings(hostJson.bookings ?? []);

    if (r === "dj") {
      // Also fetch bookings for this DJ profile to accept/decline
      const djRes = await fetch("/api/bookings?asDj=1");
      const djJson = (await djRes.json()) as { bookings?: BookingRow[] };
      const list = (djJson.bookings ?? []).filter((b) => b.dj_id === dj.id);
      setDjBookings(list);
    } else {
      setDjBookings([]);
    }

    setLoading(false);
  }, [dj.id]);

  useEffect(() => {
    void load();
  }, [load]);

  // Auto-trigger payment when arriving via email link (?pay=bookingId)
  useEffect(() => {
    if (!autoPayBookingId || loading || autoPayFired.current) return;
    const match = hostBookings.find(
      (b) => b.id === autoPayBookingId && b.status === "accepted" && b.payment_status !== "paid"
    );
    if (match) {
      autoPayFired.current = true;
      void handlePay(match.id);
    }
  }, [autoPayBookingId, hostBookings, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePay = async (bookingId: string) => {
    setCheckoutError(null);
    setBusyId(bookingId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const j = (await res.json()) as { url?: string; error?: string };
      if (res.ok && j.url) {
        window.location.href = j.url;
        return;
      }
      setCheckoutError(j.error ?? "Checkout failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleDjAction = async (
    bookingId: string,
    action: "accept" | "decline"
  ) => {
    setBusyId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        throw new Error(j.error ?? "Update failed");
      }
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setBusyId(null);
    }
  };

  if (loading || !userId) {
    return null;
  }

  const pendingForDj = djBookings.filter((b) => b.status === "pending");
  const isOwnDjProfile = pendingForDj.length > 0 || (role === "dj" && djBookings.length > 0);
  const payAsHost = !isOwnDjProfile
    ? hostBookings.filter((b) => b.status === "accepted" && b.payment_status !== "paid")
    : [];

  if (pendingForDj.length === 0 && payAsHost.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <h2 className="text-lg font-semibold text-foreground">Bookings</h2>
      <p className="mt-1 text-xs text-muted">
        {role === "dj"
          ? "Pending requests for this profile."
          : "Your bookings with this DJ."}
      </p>

      {checkoutError && (
        <p className="mt-2 text-sm text-danger" role="alert">
          {checkoutError}
        </p>
      )}

      {pendingForDj.length > 0 && role === "dj" && (
        <ul className="mt-3 space-y-3">
          {pendingForDj.map((b) => (
            <li
              key={b.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="text-sm">
                <span className="font-medium text-foreground">
                  {b.event_date} · {b.start_time}–{b.end_time}
                </span>
                {b.host?.full_name && (
                  <span className="block text-muted">
                    Host: {b.host.full_name}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busyId === b.id}
                  onClick={() => void handleDjAction(b.id, "accept")}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  type="button"
                  disabled={busyId === b.id}
                  onClick={() => void handleDjAction(b.id, "decline")}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-danger hover:text-danger disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {payAsHost.length > 0 && role !== "dj" && (
        <ul className="mt-3 space-y-3">
          {payAsHost.map((b) => (
            <li
              key={b.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="text-sm">
                <span className="font-medium text-foreground">
                  {b.event_date} · {b.start_time}–{b.end_time}
                </span>
                <span className="block text-muted">Accepted — pay to confirm</span>
              </div>
              <button
                type="button"
                disabled={busyId === b.id}
                onClick={() => void handlePay(b.id)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
              >
                {busyId === b.id ? "Redirecting…" : "Pay now"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
