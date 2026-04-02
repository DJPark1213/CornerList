import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { bookingAmountCents } from "@/lib/payments/booking-amount";
import AutoRefresh from "./AutoRefresh";

export default async function BookingConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { bookingId } = await searchParams;
  if (!bookingId) redirect("/");

  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "id, event_date, start_time, end_time, event_type, guest_count, status, payment_status, dj_id"
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking) redirect("/");

  const { data: dj } = await supabase
    .from("dj_profiles")
    .select("id, stage_name, price_per_hour")
    .eq("id", booking.dj_id)
    .maybeSingle();

  const amountCents = dj
    ? bookingAmountCents(dj.price_per_hour, booking.start_time, booking.end_time)
    : 0;
  const amountDisplay = `$${(amountCents / 100).toFixed(2)}`;

  const isConfirmed =
    booking.status === "confirmed" && booking.payment_status === "paid";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      {!isConfirmed && <AutoRefresh />}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-4xl">
        {isConfirmed ? "✓" : "⏳"}
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
        {isConfirmed ? "Booking Confirmed!" : "Payment Processing…"}
      </h1>

      <p className="mt-3 text-muted">
        {isConfirmed
          ? "Your payment was received. You're all set."
          : "Your payment is being processed. This usually takes just a moment."}
      </p>

      {dj && (
        <div className="mt-8 w-full rounded-2xl border border-border bg-surface p-6 text-left">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Booking details
          </h2>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">DJ</span>
              <span className="font-medium text-foreground">{dj.stage_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Date</span>
              <span className="font-medium text-foreground">{booking.event_date}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Time</span>
              <span className="font-medium text-foreground">
                {booking.start_time} – {booking.end_time}
              </span>
            </div>
            {booking.event_type && (
              <div className="flex justify-between text-sm">
                <span className="text-muted">Event type</span>
                <span className="font-medium text-foreground">{booking.event_type}</span>
              </div>
            )}
            {booking.guest_count && (
              <div className="flex justify-between text-sm">
                <span className="text-muted">Guests</span>
                <span className="font-medium text-foreground">{booking.guest_count}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-3 text-sm">
              <span className="font-semibold text-foreground">Total paid</span>
              <span className="font-bold text-primary">{amountDisplay}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        {dj && (
          <Link
            href={`/djs/${dj.id}`}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            View DJ profile
          </Link>
        )}
        <Link
          href="/search"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Find more DJs
        </Link>
      </div>
    </main>
  );
}
