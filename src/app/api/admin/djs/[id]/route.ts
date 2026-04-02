import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Verify caller is admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as { is_active?: boolean };
    if (typeof body.is_active !== "boolean") {
      return NextResponse.json({ error: "is_active (boolean) required" }, { status: 422 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("dj_profiles")
      .update({ is_active: body.is_active, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
