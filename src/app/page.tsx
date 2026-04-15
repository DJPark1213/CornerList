import { SearchHero, TrendingCarousel } from "@/features/search";
import { listDjs } from "@/lib/data/djs";

export default async function HomePage() {
  const { djs: featured } = await listDjs({ limit: 9 });

  return (
    <main>
      <SearchHero />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <TrendingCarousel
          djs={featured}
          perPage={3}
          title="Trending Entertainment in Charlottesville"
        />
      </section>
    </main>
  );
}
