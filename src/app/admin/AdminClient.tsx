"use client";

import { useState } from "react";
import Link from "next/link";

type DjRow = {
  id: string;
  stage_name: string;
  location: string | null;
  price_per_hour: number;
  rating_average: number | null;
  rating_count: number;
  is_active: boolean;
  created_at: string;
  user_email: string | null;
};

type BookingRow = {
  id: string;
  event_date: string;
  status: string;
  payment_status: string;
  host_name: string | null;
  dj_name: string | null;
  amount_cents: number;
};

type UserRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  created_at: string;
};

type Stats = {
  totalDjs: number;
  activeDjs: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalRevenueCents: number;
  totalUsers: number;
};

type Tab = "djs" | "bookings" | "users";

const STATUS_COLOR: Record<string, string> = {
  pending: "text-yellow-400",
  accepted: "text-blue-400",
  declined: "text-danger",
  confirmed: "text-green-400",
  cancelled: "text-muted",
};

const PAYMENT_COLOR: Record<string, string> = {
  unpaid: "text-muted",
  pending: "text-yellow-400",
  paid: "text-green-400",
  refunded: "text-blue-400",
};

export default function AdminClient({
  stats,
  initialDjs,
  bookings,
  users,
}: {
  stats: Stats;
  initialDjs: DjRow[];
  bookings: BookingRow[];
  users: UserRow[];
}) {
  const [tab, setTab] = useState<Tab>("djs");
  const [djs, setDjs] = useState(initialDjs);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleActive = async (id: string, current: boolean) => {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/djs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !current }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Failed");
      setDjs((prev) =>
        prev.map((d) => (d.id === id ? { ...d, is_active: !current } : d))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  };

  const fmt = (cents: number) =>
    `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total DJs", value: stats.totalDjs },
          { label: "Active DJs", value: stats.activeDjs },
          { label: "Total Bookings", value: stats.totalBookings },
          { label: "Confirmed", value: stats.confirmedBookings },
          { label: "Pending", value: stats.pendingBookings },
          { label: "Total Revenue", value: fmt(stats.totalRevenueCents) },
          { label: "Total Users", value: stats.totalUsers },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <p className="text-xs text-muted">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {/* Tabs */}
      <div className="mt-8 flex gap-1 border-b border-border">
        {(["djs", "bookings", "users"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "border-b-2 border-primary text-primary"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* DJs tab */}
      {tab === "djs" && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="pb-2 pr-4 font-medium">Stage name</th>
                <th className="pb-2 pr-4 font-medium">Email</th>
                <th className="pb-2 pr-4 font-medium">Location</th>
                <th className="pb-2 pr-4 font-medium">Rate</th>
                <th className="pb-2 pr-4 font-medium">Rating</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {djs.map((d) => (
                <tr key={d.id} className="text-foreground">
                  <td className="py-3 pr-4">
                    <Link
                      href={`/djs/${d.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {d.stage_name}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-muted">{d.user_email ?? "—"}</td>
                  <td className="py-3 pr-4 text-muted">{d.location ?? "—"}</td>
                  <td className="py-3 pr-4">${d.price_per_hour}/hr</td>
                  <td className="py-3 pr-4 text-star">
                    ★ {d.rating_average?.toFixed(1) ?? "—"}
                    <span className="text-muted"> ({d.rating_count})</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-xs font-semibold ${
                        d.is_active ? "text-green-400" : "text-danger"
                      }`}
                    >
                      {d.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      disabled={busyId === d.id}
                      onClick={() => void toggleActive(d.id, d.is_active)}
                      className={`rounded-lg px-3 py-1 text-xs font-medium disabled:opacity-50 ${
                        d.is_active
                          ? "border border-danger/40 text-danger hover:bg-danger/10"
                          : "border border-primary/40 text-primary hover:bg-primary/10"
                      }`}
                    >
                      {busyId === d.id
                        ? "…"
                        : d.is_active
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {djs.length === 0 && (
            <p className="mt-6 text-center text-sm text-muted">No DJs yet.</p>
          )}
        </div>
      )}

      {/* Bookings tab */}
      {tab === "bookings" && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 pr-4 font-medium">Host</th>
                <th className="pb-2 pr-4 font-medium">DJ</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 pr-4 font-medium">Payment</th>
                <th className="pb-2 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((b) => (
                <tr key={b.id} className="text-foreground">
                  <td className="py-3 pr-4">{b.event_date}</td>
                  <td className="py-3 pr-4 text-muted">{b.host_name ?? "—"}</td>
                  <td className="py-3 pr-4 text-muted">{b.dj_name ?? "—"}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-semibold capitalize ${STATUS_COLOR[b.status] ?? "text-muted"}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-semibold capitalize ${PAYMENT_COLOR[b.payment_status] ?? "text-muted"}`}>
                      {b.payment_status}
                    </span>
                  </td>
                  <td className="py-3 font-medium">
                    {b.amount_cents > 0 ? fmt(b.amount_cents) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && (
            <p className="mt-6 text-center text-sm text-muted">No bookings yet.</p>
          )}
        </div>
      )}

      {/* Users tab */}
      {tab === "users" && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="pb-2 pr-4 font-medium">Name</th>
                <th className="pb-2 pr-4 font-medium">Email</th>
                <th className="pb-2 pr-4 font-medium">Role</th>
                <th className="pb-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="text-foreground">
                  <td className="py-3 pr-4">{u.full_name ?? "—"}</td>
                  <td className="py-3 pr-4 text-muted">{u.email ?? "—"}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-xs font-semibold capitalize ${
                        u.role === "admin"
                          ? "text-primary"
                          : u.role === "dj"
                          ? "text-blue-400"
                          : "text-muted"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-muted">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="mt-6 text-center text-sm text-muted">No users yet.</p>
          )}
        </div>
      )}
    </main>
  );
}
