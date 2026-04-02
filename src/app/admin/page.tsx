import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { bookingAmountCents } from "@/lib/payments/booking-amount";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  // Auth guard — admin role only
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/");

  // Use service-role client to bypass RLS for full data access
  const admin = createAdminClient();

  // Fetch all DJs with their owner email
  const { data: djRows } = await admin
    .from("dj_profiles")
    .select("id, stage_name, location, price_per_hour, rating_average, rating_count, is_active, created_at, user_id, profiles(email)")
    .order("created_at", { ascending: false });

  type DjRaw = {
    id: string;
    stage_name: string;
    location: string | null;
    price_per_hour: number;
    rating_average: number | null;
    rating_count: number;
    is_active: boolean;
    created_at: string;
    user_id: string;
    profiles: { email: string | null } | null;
  };

  const djs = ((djRows ?? []) as unknown as DjRaw[]).map((d) => ({
    id: d.id,
    stage_name: d.stage_name,
    location: d.location,
    price_per_hour: d.price_per_hour,
    rating_average: d.rating_average,
    rating_count: d.rating_count,
    is_active: d.is_active,
    created_at: d.created_at,
    user_email: d.profiles?.email ?? null,
  }));

  // Fetch all bookings with host + DJ names
  const { data: bookingRows } = await admin
    .from("bookings")
    .select("id, event_date, start_time, end_time, status, payment_status, host_id, dj_id, profiles(full_name), dj_profiles(stage_name, price_per_hour)")
    .order("event_date", { ascending: false });

  type BookingRaw = {
    id: string;
    event_date: string;
    start_time: string;
    end_time: string;
    status: string;
    payment_status: string;
    profiles: { full_name: string | null } | null;
    dj_profiles: { stage_name: string; price_per_hour: number } | null;
  };

  const bookings = ((bookingRows ?? []) as unknown as BookingRaw[]).map((b) => ({
    id: b.id,
    event_date: b.event_date,
    status: b.status,
    payment_status: b.payment_status,
    host_name: b.profiles?.full_name ?? null,
    dj_name: b.dj_profiles?.stage_name ?? null,
    amount_cents:
      b.payment_status === "paid" && b.dj_profiles
        ? bookingAmountCents(b.dj_profiles.price_per_hour, b.start_time, b.end_time)
        : 0,
  }));

  // Fetch all users
  const { data: userRows } = await admin
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });

  const users = (userRows ?? []) as {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string;
    created_at: string;
  }[];

  // Compute stats
  const totalRevenueCents = bookings
    .filter((b) => b.payment_status === "paid")
    .reduce((sum, b) => sum + b.amount_cents, 0);

  const stats = {
    totalDjs: djs.length,
    activeDjs: djs.filter((d) => d.is_active).length,
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter((b) => b.status === "confirmed").length,
    pendingBookings: bookings.filter((b) => b.status === "pending").length,
    totalRevenueCents,
    totalUsers: users.length,
  };

  return (
    <AdminClient
      stats={stats}
      initialDjs={djs}
      bookings={bookings}
      users={users}
    />
  );
}
