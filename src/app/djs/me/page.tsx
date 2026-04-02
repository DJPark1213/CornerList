import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDjByUserId, listReviewsForDj } from "@/lib/data/djs";
import { getStripe } from "@/lib/stripe";
import MyDjProfileClient from "./MyDjProfileClient";

export default async function MyDjProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const result = await getDjByUserId(user.id);
  if (!result) redirect("/join-dj");

  const reviews = await listReviewsForDj(result.dj.id);

  // Check Stripe Connect status
  let stripeConnected = false;
  let stripeDetailsSubmitted = false;
  const { data: djRow } = await supabase
    .from("dj_profiles")
    .select("stripe_account_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (djRow?.stripe_account_id) {
    try {
      const stripe = getStripe();
      const account = await stripe.accounts.retrieve(djRow.stripe_account_id);
      stripeConnected = !!(account.charges_enabled && account.payouts_enabled);
      stripeDetailsSubmitted = !!account.details_submitted;
    } catch {
      // Stripe account may be invalid
    }
  }

  // Fetch bookings for this DJ (with host names)
  const { data: djBookingRows } = await supabase
    .from("bookings")
    .select(
      "id, status, payment_status, event_date, start_time, end_time, event_type, guest_count, profiles(full_name)"
    )
    .eq("dj_id", result.dj.id)
    .order("event_date", { ascending: false });

  type DjBookingRow = {
    id: string;
    status: string;
    payment_status: string;
    event_date: string;
    start_time: string;
    end_time: string;
    event_type: string | null;
    guest_count: number | null;
    profiles: { full_name: string | null } | null;
  };

  const djBookings = ((djBookingRows ?? []) as unknown as DjBookingRow[]).map((b) => ({
    id: b.id,
    status: b.status,
    payment_status: b.payment_status,
    event_date: b.event_date,
    start_time: b.start_time,
    end_time: b.end_time,
    event_type: b.event_type,
    guest_count: b.guest_count,
    host_name: b.profiles?.full_name ?? null,
  }));

  return (
    <MyDjProfileClient
      dj={result.dj}
      reviews={reviews}
      contactEmail={result.contactEmail}
      stripeConnected={stripeConnected}
      stripeDetailsSubmitted={stripeDetailsSubmitted}
      djBookings={djBookings}
    />
  );
}
