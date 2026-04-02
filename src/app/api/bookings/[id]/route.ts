import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { hoursBetweenTimes } from "@/lib/payments/booking-amount";
import {
  sendBookingAcceptedToHost,
  sendBookingDeclinedToHost,
  sendBookingCancelledEmails,
} from "@/lib/email/booking-emails";

type PatchBody = {
  action?: "accept" | "decline" | "cancel";
};

function timesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  const toMinutes = (t: string) => {
    const parts = t.trim().split(":").map(Number);
    return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  };
  let aS = toMinutes(aStart);
  let aE = toMinutes(aEnd);
  let bS = toMinutes(bStart);
  let bE = toMinutes(bEnd);
  // Handle midnight crossing
  if (aE <= aS) aE += 24 * 60;
  if (bE <= bS) bE += 24 * 60;
  return aS < bE && aE > bS;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: PatchBody;
    try {
      body = (await request.json()) as PatchBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const action = body.action;
    if (action !== "accept" && action !== "decline" && action !== "cancel") {
      return NextResponse.json(
        { error: 'action must be "accept", "decline", or "cancel"' },
        { status: 422 }
      );
    }

    const { data: booking, error: bErr } = await supabase
      .from("bookings")
      .select(
        "id, status, payment_status, host_id, dj_id, event_date, start_time, end_time, stripe_session_id"
      )
      .eq("id", bookingId)
      .maybeSingle();

    if (bErr || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // ── CANCEL ──────────────────────────────────────────────────────────────
    if (action === "cancel") {
      // Host can cancel pending or accepted; DJ can cancel pending
      const isHost = booking.host_id === user.id;
      const { data: djProfile } = await supabase
        .from("dj_profiles")
        .select("id, user_id")
        .eq("id", booking.dj_id)
        .maybeSingle();
      const isDj = djProfile?.user_id === user.id;

      if (!isHost && !isDj) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const cancellableStatuses = isHost
        ? ["pending", "accepted", "confirmed"]
        : ["pending", "accepted"];

      if (!cancellableStatuses.includes(booking.status)) {
        return NextResponse.json(
          { error: "This booking cannot be cancelled" },
          { status: 422 }
        );
      }

      // Issue Stripe refund if already paid
      if (booking.payment_status === "paid" && booking.stripe_session_id) {
        try {
          const stripe = getStripe();
          const session = await stripe.checkout.sessions.retrieve(
            booking.stripe_session_id
          );
          if (session.payment_intent) {
            await stripe.refunds.create({
              payment_intent: session.payment_intent as string,
            });
          }
        } catch (e) {
          console.error("Refund failed", e);
          return NextResponse.json(
            { error: "Failed to process refund" },
            { status: 500 }
          );
        }
      }

      const { error: upErr } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          payment_status:
            booking.payment_status === "paid" ? "refunded" : booking.payment_status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      if (upErr) {
        console.error(upErr);
        return NextResponse.json(
          { error: "Failed to cancel booking" },
          { status: 500 }
        );
      }

      // Send cancellation emails to both parties
      try {
        const [hostRes, djProfileRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", booking.host_id)
            .maybeSingle(),
          supabase
            .from("dj_profiles")
            .select("stage_name, contact_email")
            .eq("id", booking.dj_id)
            .maybeSingle(),
        ]);
        const host = hostRes.data;
        const dj = djProfileRes.data;
        if (host?.email && dj?.contact_email) {
          await sendBookingCancelledEmails({
            hostEmail: host.email,
            hostName: host.full_name?.trim() || "there",
            djEmail: dj.contact_email,
            djName: dj.stage_name,
            eventDate: booking.event_date,
            refunded: booking.payment_status === "paid",
          });
        }
      } catch (e) {
        console.error("Cancellation email failed", e);
      }

      return NextResponse.json({ ok: true, status: "cancelled" });
    }

    // ── ACCEPT / DECLINE ─────────────────────────────────────────────────────
    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: "Booking can no longer be updated" },
        { status: 422 }
      );
    }

    const { data: djProfile, error: dErr } = await supabase
      .from("dj_profiles")
      .select("id, user_id, stage_name")
      .eq("id", booking.dj_id)
      .maybeSingle();

    if (dErr || !djProfile || djProfile.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Double-booking check on accept ────────────────────────────────────────
    if (action === "accept") {
      const { data: existing } = await supabase
        .from("bookings")
        .select("id, start_time, end_time, event_date")
        .eq("dj_id", booking.dj_id)
        .eq("event_date", booking.event_date)
        .in("status", ["accepted", "confirmed"])
        .neq("id", bookingId);

      const conflict = (existing ?? []).find((b) =>
        timesOverlap(
          booking.start_time,
          booking.end_time,
          b.start_time,
          b.end_time
        )
      );

      if (conflict) {
        return NextResponse.json(
          {
            error:
              "You already have an accepted booking that overlaps with this time slot.",
          },
          { status: 409 }
        );
      }
    }

    const nextStatus = action === "accept" ? "accepted" : "declined";

    const { error: upErr } = await supabase
      .from("bookings")
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq("id", bookingId);

    if (upErr) {
      console.error(upErr);
      return NextResponse.json(
        { error: "Failed to update booking" },
        { status: 500 }
      );
    }

    const { data: host } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", booking.host_id)
      .maybeSingle();

    if (host?.email) {
      if (action === "accept") {
        await sendBookingAcceptedToHost({
          to: host.email,
          hostName: host.full_name?.trim() || "there",
          stageName: djProfile.stage_name,
          djProfileId: djProfile.id,
          bookingId,
        });
      } else {
        await sendBookingDeclinedToHost({
          to: host.email,
          hostName: host.full_name?.trim() || "there",
          stageName: djProfile.stage_name,
        });
      }
    }

    return NextResponse.json({ ok: true, status: nextStatus });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
