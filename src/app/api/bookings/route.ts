import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNewBookingRequestToDj } from "@/lib/email/booking-emails";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const asDj =
      searchParams.get("asDj") === "1" ||
      searchParams.get("asDj") === "true";
    const djId = searchParams.get("djId");

    if (asDj) {
      const { data: djs } = await supabase
        .from("dj_profiles")
        .select("id")
        .eq("user_id", user.id);
      const ids = djs?.map((d) => d.id) ?? [];
      if (ids.length === 0) {
        return NextResponse.json({ bookings: [] });
      }
      const { data: rows, error } = await supabase
        .from("bookings")
        .select(
          "id, status, payment_status, event_date, start_time, end_time, host_id, dj_id, created_at, guest_count, event_type, notes"
        )
        .in("dj_id", ids)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const hostIds = [...new Set((rows ?? []).map((r) => r.host_id))];
      const { data: hosts } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", hostIds);
      const hostMap = new Map((hosts ?? []).map((h) => [h.id, h]));
      const bookings = (rows ?? []).map((r) => ({
        ...r,
        host: hostMap.get(r.host_id) ?? null,
      }));

      return NextResponse.json({ bookings });
    }

    if (djId) {
      const { data: rows, error } = await supabase
        .from("bookings")
        .select(
          "id, status, payment_status, event_date, start_time, end_time, host_id, dj_id, created_at, guest_count, event_type, notes"
        )
        .eq("host_id", user.id)
        .eq("dj_id", djId)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ bookings: rows ?? [] });
    }

    return NextResponse.json(
      { error: "Use query asDj=1 or djId=<uuid>" },
      { status: 400 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}

type Body = {
  djId?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  guestCount?: number;
  eventType?: string;
  notes?: string;
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

    const djId = body.djId?.trim();
    const eventDate = body.eventDate?.trim();
    const startTime = body.startTime?.trim();
    const endTime = body.endTime?.trim();

    if (!djId || !eventDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: "djId, eventDate, startTime, and endTime are required" },
        { status: 422 }
      );
    }

    // Reject past dates
    const today = new Date().toISOString().slice(0, 10);
    if (eventDate < today) {
      return NextResponse.json(
        { error: "Event date cannot be in the past" },
        { status: 422 }
      );
    }

    // Validate start < end (no zero- or negative-duration bookings)
    const toMinutes = (t: string) => {
      const parts = t.split(":").map(Number);
      return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
    };
    if (toMinutes(endTime) <= toMinutes(startTime)) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 422 }
      );
    }

    const { data: djRow, error: djErr } = await supabase
      .from("dj_profiles")
      .select("id, user_id")
      .eq("id", djId)
      .eq("is_active", true)
      .maybeSingle();

    if (djErr || !djRow) {
      return NextResponse.json({ error: "DJ not found" }, { status: 404 });
    }

    // Prevent a DJ from booking themselves
    if (djRow.user_id === user.id) {
      return NextResponse.json(
        { error: "You cannot book yourself" },
        { status: 422 }
      );
    }

    const { data: booking, error: insErr } = await supabase
      .from("bookings")
      .insert({
        host_id: user.id,
        dj_id: djId,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        guest_count:
          body.guestCount != null && !Number.isNaN(Number(body.guestCount))
            ? Math.floor(Number(body.guestCount))
            : null,
        event_type: body.eventType?.trim() ?? null,
        notes: body.notes?.trim() ?? null,
        status: "pending",
      })
      .select("id, status, event_date, start_time, end_time")
      .single();

    if (insErr || !booking) {
      console.error(insErr);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 }
      );
    }

    const { data: djForEmail } = await supabase
      .from("dj_profiles")
      .select("stage_name, user_id")
      .eq("id", djId)
      .maybeSingle();

    if (djForEmail) {
      const { data: djProfileRow } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", djForEmail.user_id)
        .maybeSingle();

      if (djProfileRow?.email) {
        void sendNewBookingRequestToDj({
          to: djProfileRow.email,
          djName: djForEmail.stage_name,
          djProfileId: djId,
          eventDate: String(booking.event_date),
          startTime: booking.start_time,
          endTime: booking.end_time,
        });
      }
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
