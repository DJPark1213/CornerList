import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 400 });
    }

    if (profile.role !== "host") {
      return NextResponse.json(
        { error: "Only hosts can request bookings" },
        { status: 403 }
      );
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

    const { data: djRow, error: djErr } = await supabase
      .from("dj_profiles")
      .select("id")
      .eq("id", djId)
      .eq("is_active", true)
      .maybeSingle();

    if (djErr || !djRow) {
      return NextResponse.json({ error: "DJ not found" }, { status: 404 });
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

    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
