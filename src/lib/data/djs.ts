import "server-only";

import type { Dj, Genre, Review } from "@/types/dj";
import { createClient } from "@/lib/supabase/server";
import { genreParamToSlug } from "@/lib/genre-slugs";

type DjGenreRow = {
  genres: { name: string; slug: string } | null;
} | null;

type ProfileRow = { avatar_url: string | null } | null;

type DjProfileListRow = {
  id: string;
  stage_name: string;
  years_experience: number | null;
  price_per_hour: number;
  rating_average: number | null;
  rating_count: number | null;
  about: string | null;
  equipment_summary: string | null;
  availability_summary: string | null;
  location: string | null;
  profiles: ProfileRow;
  dj_genres: DjGenreRow[] | null;
};

type MediaRow = {
  id: string;
  type: string;
  public_url: string | null;
};

type DjProfileDetailRow = DjProfileListRow & {
  media_assets: MediaRow[] | null;
};

function genresFromRow(djGenres: DjGenreRow[] | null): Genre[] {
  if (!djGenres?.length) return [];
  const names = djGenres
    .map((dg) => dg?.genres?.name)
    .filter((n): n is string => typeof n === "string" && n.length > 0);
  return names as Genre[];
}

function mapListRow(row: DjProfileListRow): Dj {
  const rating = row.rating_average != null ? Number(row.rating_average) : 0;
  const ratingCount = row.rating_count ?? 0;
  return {
    id: row.id,
    stageName: row.stage_name,
    yearsExperience: row.years_experience ?? 0,
    pricePerHour: row.price_per_hour,
    rating,
    ratingCount,
    genres: genresFromRow(row.dj_genres),
    about: row.about ?? "",
    equipmentSummary: row.equipment_summary ?? "",
    availabilitySummary: row.availability_summary ?? "",
    location: row.location ?? "",
    avatarUrl: row.profiles?.avatar_url ?? null,
    showcaseImages: [],
  };
}

function mapDetailRow(row: DjProfileDetailRow): Dj {
  const base = mapListRow(row);
  const images = (row.media_assets ?? [])
    .filter((m) => m.type === "image" && m.public_url)
    .map((m) => m.public_url as string);
  return { ...base, showcaseImages: images };
}

export type ListDjsParams = {
  q?: string | null;
  genre?: string | null;
  maxPrice?: number | null;
  location?: string | null;
  limit?: number;
  offset?: number;
};

export async function listDjs(params: ListDjsParams = {}): Promise<{ djs: Dj[] }> {
  const supabase = await createClient();
  const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
  const offset = Math.max(params.offset ?? 0, 0);

  let genreDjIds: string[] | null = null;
  if (params.genre?.trim()) {
    const slug = genreParamToSlug(params.genre.trim());
    if (slug) {
      const { data: genreRow } = await supabase
        .from("genres")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!genreRow) {
        return { djs: [] };
      }
      const { data: links } = await supabase
        .from("dj_genres")
        .select("dj_id")
        .eq("genre_id", genreRow.id);
      genreDjIds = [...new Set((links ?? []).map((l) => l.dj_id))];
      if (genreDjIds.length === 0) {
        return { djs: [] };
      }
    }
  }

  let query = supabase
    .from("dj_profiles")
    .select(
      `
      id,
      stage_name,
      years_experience,
      price_per_hour,
      rating_average,
      rating_count,
      about,
      equipment_summary,
      availability_summary,
      location,
      profiles(avatar_url),
      dj_genres(genres(name, slug))
    `
    )
    .eq("is_active", true);

  if (genreDjIds) {
    query = query.in("id", genreDjIds);
  }

  if (params.maxPrice != null && !Number.isNaN(params.maxPrice)) {
    query = query.lte("price_per_hour", params.maxPrice);
  }

  const qRaw = params.q?.trim();
  if (qRaw) {
    const safe = qRaw.replace(/,/g, "");
    query = query.or(
      `stage_name.ilike.%${safe}%,about.ilike.%${safe}%`
    );
  }

  const locationRaw = params.location?.trim();
  if (locationRaw) {
    const safe = locationRaw.replace(/,/g, "");
    query = query.ilike("location", `%${safe}%`);
  }

  query = query
    .order("rating_average", { ascending: false, nullsFirst: false })
    .order("price_per_hour", { ascending: true })
    .range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error("listDjs", error);
    throw new Error(error.message);
  }

  const rows = (data ?? []) as unknown as DjProfileListRow[];
  return { djs: rows.map(mapListRow) };
}

export async function getDjById(id: string): Promise<Dj | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dj_profiles")
    .select(
      `
      id,
      stage_name,
      years_experience,
      price_per_hour,
      rating_average,
      rating_count,
      about,
      equipment_summary,
      availability_summary,
      location,
      profiles(avatar_url),
      dj_genres(genres(name, slug)),
      media_assets(id, type, public_url)
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getDjById", error);
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapDetailRow(data as unknown as DjProfileDetailRow);
}

export async function getDjByUserId(
  userId: string
): Promise<{ dj: Dj; contactEmail: string | null } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dj_profiles")
    .select(
      `
      id,
      stage_name,
      years_experience,
      price_per_hour,
      rating_average,
      rating_count,
      about,
      equipment_summary,
      availability_summary,
      location,
      profiles(avatar_url),
      dj_genres(genres(name, slug)),
      media_assets(id, type, public_url)
    `
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("getDjByUserId", error);
    throw new Error(error.message);
  }
  if (!data) return null;

  const { data: prof } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  return {
    dj: mapDetailRow(data as unknown as DjProfileDetailRow),
    contactEmail: prof?.email ?? null,
  };
}

export async function listReviewsForDj(djId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data: reviewRows, error: revError } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, host_id")
    .eq("dj_id", djId)
    .order("created_at", { ascending: false });

  if (revError) {
    console.error("listReviewsForDj", revError);
    throw new Error(revError.message);
  }

  if (!reviewRows?.length) {
    return [];
  }

  const hostIds = [...new Set(reviewRows.map((r) => r.host_id))];
  const { data: profs, error: pError } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", hostIds);

  if (pError) {
    console.error("listReviewsForDj profiles", pError);
    throw new Error(pError.message);
  }

  const nameById = new Map(
    (profs ?? []).map((p) => [p.id, p.full_name?.trim() || "Host"])
  );

  return reviewRows.map((r) => ({
    id: r.id,
    djId,
    hostDisplayName: nameById.get(r.host_id) ?? "Host",
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at.slice(0, 10),
  }));
}
