import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { genreParamToSlug } from "@/lib/genre-slugs";

type Body = {
  stageName?: string;
  yearsExperience?: number;
  genres?: string[];
  pricePerHour?: number;
  contactEmail?: string;
  about?: string;
  equipmentSummary?: string;
  availabilitySummary?: string;
  profileImageUrl?: string | null;
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

    const stageName = body.stageName?.trim();
    if (!stageName) {
      return NextResponse.json(
        { error: "stageName is required" },
        { status: 422 }
      );
    }

    const price =
      typeof body.pricePerHour === "number" && !Number.isNaN(body.pricePerHour)
        ? body.pricePerHour
        : Number(body.pricePerHour);
    if (Number.isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Valid pricePerHour is required" },
        { status: 422 }
      );
    }

    const genres = Array.isArray(body.genres) ? body.genres : [];
    if (genres.length === 0) {
      return NextResponse.json(
        { error: "At least one genre is required" },
        { status: 422 }
      );
    }

    const slugSet = new Set<string>();
    for (const g of genres) {
      if (typeof g !== "string") continue;
      const slug = genreParamToSlug(g.trim());
      if (slug) slugSet.add(slug);
    }
    const slugList = [...slugSet];

    if (slugList.length === 0) {
      return NextResponse.json(
        { error: "Invalid genre values" },
        { status: 422 }
      );
    }

    const { data: genreRows, error: genreErr } = await supabase
      .from("genres")
      .select("id, slug")
      .in("slug", slugList);

    if (genreErr || !genreRows?.length) {
      return NextResponse.json(
        { error: "Could not resolve genres" },
        { status: 422 }
      );
    }

    const yearsExperience =
      body.yearsExperience != null && !Number.isNaN(Number(body.yearsExperience))
        ? Math.max(0, Math.floor(Number(body.yearsExperience)))
        : null;

    const email =
      body.contactEmail?.trim() || user.email || null;

    const profilePatch: Record<string, unknown> = {
      role: "dj",
      email,
      full_name:
        (typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : null) ||
        (typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name
          : null) ||
        stageName,
    };

    if (body.profileImageUrl?.trim()) {
      profilePatch.avatar_url = body.profileImageUrl.trim();
    }

    const { error: profileUpdateErr } = await supabase
      .from("profiles")
      .update(profilePatch)
      .eq("id", user.id);

    if (profileUpdateErr) {
      console.error(profileUpdateErr);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    const djPayload = {
      user_id: user.id,
      stage_name: stageName,
      years_experience: yearsExperience,
      price_per_hour: price,
      about: body.about?.trim() ?? null,
      equipment_summary: body.equipmentSummary?.trim() ?? null,
      availability_summary: body.availabilitySummary?.trim() ?? null,
      is_active: true,
    };

    const { data: upserted, error: upsertErr } = await supabase
      .from("dj_profiles")
      .upsert(djPayload, { onConflict: "user_id" })
      .select("id")
      .single();

    if (upsertErr || !upserted) {
      console.error(upsertErr);
      return NextResponse.json(
        { error: "Failed to save DJ profile" },
        { status: 500 }
      );
    }

    const djId = upserted.id;

    const { error: delErr } = await supabase
      .from("dj_genres")
      .delete()
      .eq("dj_id", djId);

    if (delErr) {
      console.error(delErr);
      return NextResponse.json(
        { error: "Failed to sync genres" },
        { status: 500 }
      );
    }

    const links = genreRows.map((gr) => ({
      dj_id: djId,
      genre_id: gr.id,
    }));

    const { error: insErr } = await supabase.from("dj_genres").insert(links);

    if (insErr) {
      console.error(insErr);
      return NextResponse.json(
        { error: "Failed to link genres" },
        { status: 500 }
      );
    }

    return NextResponse.json({ djProfileId: djId });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
