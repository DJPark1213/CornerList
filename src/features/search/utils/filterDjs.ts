import { Dj, Genre } from "@/types/dj";

export type DjFilterParams = {
  q: string;
  genre: Genre | "";
  maxPrice: string;
};

export function filterDjs(djs: Dj[], filters: DjFilterParams): Dj[] {
  return djs.filter((dj) => {
    if (filters.maxPrice && dj.pricePerHour > Number(filters.maxPrice)) {
      return false;
    }
    if (filters.genre && !dj.genres.includes(filters.genre as Genre)) {
      return false;
    }
    if (filters.q) {
      const query = filters.q.toLowerCase();
      const matchesName = dj.stageName.toLowerCase().includes(query);
      const matchesBio = dj.about.toLowerCase().includes(query);
      if (!matchesName && !matchesBio) return false;
    }
    return true;
  });
}
