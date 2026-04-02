import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Body = {
  djId?: string;
  bookingId?: string;
  rating?: number;
  comment?: string;
};

export async function POST(request: NextRequest) {
  try {
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

    const { djId, bookingId, rating, comment } = body;

    if (!djId || !bookingId || !rating || !comment?.trim()) {
      return NextResponse.json(
        { error: "djId, bookingId, rating, and comment are required" },
        { status: 422 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 422 }
      );
    }

    // Verify the booking exists, belongs to this user, and is confirmed
    const { data: booking } = await supabase
      .from("bookings")
      .select("id, host_id, dj_id, status, payment_status")
      .eq("id", bookingId)
      .eq("host_id", user.id)
      .eq("dj_id", djId)
      .eq("status", "confirmed")
      .eq("payment_status", "paid")
      .maybeSingle();

    if (!booking) {
      return NextResponse.json(
        { error: "No confirmed booking found for this DJ" },
        { status: 403 }
      );
    }

    // Check if already reviewed
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("booking_id", bookingId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this booking" },
        { status: 409 }
      );
    }

    const { data: review, error: insErr } = await supabase
      .from("reviews")
      .insert({
        booking_id: bookingId,
        host_id: user.id,
        dj_id: djId,
        rating,
        comment: comment.trim(),
      })
      .select("id")
      .single();

    if (insErr || !review) {
      console.error(insErr);
      return NextResponse.json(
        { error: "Failed to submit review" },
        { status: 500 }
      );
    }

    // Update DJ rating average and count
    const { data: allReviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("dj_id", djId);

    if (allReviews?.length) {
      const avg =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await supabase
        .from("dj_profiles")
        .update({
          rating_average: Math.round(avg * 100) / 100,
          rating_count: allReviews.length,
        })
        .eq("id", djId);
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
