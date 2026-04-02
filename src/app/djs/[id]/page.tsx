import { notFound } from "next/navigation";
import { getDjById, listReviewsForDj } from "@/lib/data/djs";
import DjProfilePageClient from "./DjProfilePageClient";

export default async function DjProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dj = await getDjById(id);
  if (!dj) {
    notFound();
  }
  const reviews = await listReviewsForDj(id);

  return <DjProfilePageClient dj={dj} reviews={reviews} />;
}
