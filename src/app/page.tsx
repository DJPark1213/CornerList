import { SearchHero, DjGrid, MOCK_DJS } from "@/features/search";

export default function HomePage() {
  const featured = MOCK_DJS.slice(0, 3);

  return (
    <main>
      <SearchHero />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Trending DJs in Charlottesville
        </h2>
        <DjGrid djs={featured} />
      </section>
    </main>
  );
}
