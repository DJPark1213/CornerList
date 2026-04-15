import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the asset belongs to this user's DJ profile
    const { data: asset } = await supabase
      .from("media_assets")
      .select("id, storage_path, dj_profiles(user_id)")
      .eq("id", id)
      .maybeSingle();

    if (!asset) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const djProfile = asset.dj_profiles as unknown as { user_id: string } | null;
    if (djProfile?.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete from storage
    if (asset.storage_path) {
      await supabase.storage.from("dj-media").remove([asset.storage_path]);
    }

    // Delete DB row (RLS will also enforce ownership)
    const { error } = await supabase
      .from("media_assets")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
