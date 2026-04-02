import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPaymentConfirmedEmails } from "@/lib/email/booking-emails";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!whSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, whSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        await admin
          .from("bookings")
          .update({
            status: "confirmed",
            payment_status: "paid",
            updated_at: new Date().toISOString(),
          })
          .eq("id", bookingId);

        const { data: booking } = await admin
          .from("bookings")
          .select("host_id, dj_id, event_date, start_time, end_time")
          .eq("id", bookingId)
          .maybeSingle();

        if (booking) {
          const { data: host } = await admin
            .from("profiles")
            .select("email, full_name")
            .eq("id", booking.host_id)
            .maybeSingle();

          const { data: djRow } = await admin
            .from("dj_profiles")
            .select("user_id, stage_name")
            .eq("id", booking.dj_id)
            .maybeSingle();

          const { data: djProf } = djRow
            ? await admin
                .from("profiles")
                .select("email")
                .eq("id", djRow.user_id)
                .maybeSingle()
            : { data: null };

          const amountTotal = session.amount_total;
          const amountDisplay =
            amountTotal != null
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: session.currency ?? "usd",
                }).format(amountTotal / 100)
              : "your payment";

          if (
            host?.email &&
            djProf?.email &&
            djRow?.stage_name
          ) {
            await sendPaymentConfirmedEmails({
              hostEmail: host.email,
              hostName: host.full_name?.trim() || "Host",
              djEmail: djProf.email,
              djName: djRow.stage_name,
              amountDisplay,
              eventDate: String(booking.event_date),
            });
          }
        }
      }
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        await admin
          .from("bookings")
          .update({
            payment_status: "unpaid",
            updated_at: new Date().toISOString(),
          })
          .eq("id", bookingId);
      }
    }
  } catch (e) {
    console.error("Stripe webhook handler error", e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
