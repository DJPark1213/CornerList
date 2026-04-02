import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { bookingAmountCents } from "@/lib/payments/booking-amount";

type Body = {
  bookingId?: string;
};

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: Body;
    try {
      body = (await request.json()) as Body;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const bookingId = body.bookingId?.trim();
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 422 });
    }

    const { data: booking, error: bErr } = await supabase
      .from("bookings")
      .select(
        "id, host_id, dj_id, status, payment_status, start_time, end_time, event_date"
      )
      .eq("id", bookingId)
      .maybeSingle();

    if (bErr || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.host_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (booking.status !== "accepted") {
      return NextResponse.json(
        { error: "Booking must be accepted by the DJ before payment" },
        { status: 422 }
      );
    }

    if (booking.payment_status === "paid") {
      return NextResponse.json(
        { error: "Booking is already paid" },
        { status: 422 }
      );
    }

    const { data: dj, error: dErr } = await supabase
      .from("dj_profiles")
      .select("price_per_hour, stage_name, stripe_account_id")
      .eq("id", booking.dj_id)
      .maybeSingle();

    if (dErr || !dj) {
      return NextResponse.json({ error: "DJ not found" }, { status: 404 });
    }

    const amountCents = bookingAmountCents(
      dj.price_per_hour,
      booking.start_time,
      booking.end_time
    );

    const origin =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      request.headers.get("origin") ||
      "http://localhost:3000";

    const stripe = getStripe();

    // 10% platform fee
    const platformFeeCents = Math.round(amountCents * 0.1);

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `DJ booking — ${dj.stage_name}`,
              description: `${booking.event_date} · ${booking.start_time}–${booking.end_time}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/booking/confirmed?bookingId=${booking.id}`,
      cancel_url: `${origin}/djs/${booking.dj_id}`,
      metadata: { bookingId: booking.id },
    };

    // Route payment to DJ's Connect account if they've completed onboarding
    if (dj.stripe_account_id) {
      const account = await stripe.accounts.retrieve(dj.stripe_account_id);
      if (account.charges_enabled) {
        sessionParams.payment_intent_data = {
          application_fee_amount: platformFeeCents,
          transfer_data: { destination: dj.stripe_account_id },
        };
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    const { error: upErr } = await supabase
      .from("bookings")
      .update({
        stripe_session_id: session.id,
        payment_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    if (upErr) {
      console.error(upErr);
      return NextResponse.json(
        { error: "Failed to save checkout session" },
        { status: 500 }
      );
    }

    if (!session.url) {
      return NextResponse.json(
        { error: "No checkout URL returned" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
