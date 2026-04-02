import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookingsClient from "./BookingsClient";

type Booking = {
  id: string;
  status: string;
  payment_status: string;
  event_date: string;
  start_time: string;
  end_time: string;
  event_type: string | null;
  guest_count: number | null;
  dj_profiles: { id: string; stage_name: string } | null;
};

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: rows } = await supabase
    .from("bookings")
    .select(
      "id, status, payment_status, event_date, start_time, end_time, event_type, guest_count, dj_profiles(id, stage_name)"
    )
    .eq("host_id", user.id)
    .order("event_date", { ascending: false });

  const bookings = (rows ?? []) as unknown as Booking[];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
      <p className="mt-1 text-sm text-muted">All booking requests you've made.</p>
      <BookingsClient initial={bookings} />
    </main>
  );
}
