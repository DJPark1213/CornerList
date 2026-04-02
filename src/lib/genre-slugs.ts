import type { Genre } from "@/types/dj";

/** Maps UI labels to `genres.slug` (database). */
export const GENRE_DISPLAY_TO_SLUG: Record<Genre, string> = {
  "Hip-Hop": "hip-hop",
  EDM: "edm",
  Pop: "pop",
  House: "house",
  "R&B": "r-and-b",
  Latin: "latin",
  Rock: "rock",
  "Top 40": "top-40",
};

const SLUGS = new Set(Object.values(GENRE_DISPLAY_TO_SLUG));

/** Resolve `genre` query param (display name or slug) to a DB slug, or null. */
export function genreParamToSlug(param: string): string | null {
  const t = param.trim();
  if (!t) return null;
  if (t in GENRE_DISPLAY_TO_SLUG) {
    return GENRE_DISPLAY_TO_SLUG[t as Genre];
  }
  if (SLUGS.has(t)) {
    return t;
  }
  return null;
}
