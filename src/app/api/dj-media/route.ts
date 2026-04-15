import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${user.id}/${Date.now()}-${safeName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadErr } = await supabase.storage
      .from("dj-media")
      .upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadErr) {
      console.error("[dj-media upload]", uploadErr);
      return NextResponse.json(
        { error: `Upload failed: ${uploadErr.message}` },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("dj-media").getPublicUrl(path);

    const type = formData.get("type");
    if (type === "profile-photo") {
      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);
    } else if (type === "image" || type === "video") {
      // Get the DJ profile id for this user
      const { data: djRow } = await supabase
        .from("dj_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (djRow) {
        const { data: asset, error: assetErr } = await supabase
          .from("media_assets")
          .insert({
            dj_id: djRow.id,
            type,
            storage_path: path,
            public_url: publicUrl,
          })
          .select("id")
          .single();

        if (assetErr) {
          console.error("[dj-media insert]", assetErr);
        } else {
          return NextResponse.json({ url: publicUrl, path, id: asset.id });
        }
      }
    }

    return NextResponse.json({ url: publicUrl, path });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
