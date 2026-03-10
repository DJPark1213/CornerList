import { Review } from "@/types/dj";

export const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    djId: "mike-beats",
    hostDisplayName: "Sarah T.",
    rating: 5,
    comment:
      "Mike absolutely killed it at our formal. Everyone was on the dance floor the entire night. Will definitely book again!",
    createdAt: "2026-02-15",
  },
  {
    id: "r2",
    djId: "mike-beats",
    hostDisplayName: "Greek Life Council",
    rating: 5,
    comment:
      "Professional, showed up early, played exactly what we asked for. Best DJ we've booked.",
    createdAt: "2026-01-28",
  },
  {
    id: "r3",
    djId: "mike-beats",
    hostDisplayName: "Jordan K.",
    rating: 4,
    comment:
      "Great music selection and energy. Only wish he had a bigger speaker setup for our outdoor event.",
    createdAt: "2025-12-10",
  },
  {
    id: "r4",
    djId: "emma-vibe",
    hostDisplayName: "Lisa M.",
    rating: 5,
    comment:
      "Emma created the perfect atmosphere for our house party. Smooth transitions, great song choices.",
    createdAt: "2026-02-20",
  },
  {
    id: "r5",
    djId: "emma-vibe",
    hostDisplayName: "UVA Dance Club",
    rating: 5,
    comment:
      "Incredible EDM set. She read the room perfectly and kept the energy building all night.",
    createdAt: "2026-01-15",
  },
  {
    id: "r6",
    djId: "dynamic-d",
    hostDisplayName: "Alex R.",
    rating: 5,
    comment:
      "DJ Dynamic is worth every penny. Professional setup, amazing sound quality, and he knows how to work a crowd.",
    createdAt: "2026-03-01",
  },
  {
    id: "r7",
    djId: "dynamic-d",
    hostDisplayName: "Campus Events Board",
    rating: 5,
    comment:
      "Booked him for our spring concert. Flawless performance from start to finish.",
    createdAt: "2026-02-08",
  },
  {
    id: "r8",
    djId: "luna-bass",
    hostDisplayName: "Priya S.",
    rating: 5,
    comment:
      "Perfect for our cocktail hour. Luna set a beautiful vibe without being too loud. Exactly what we needed.",
    createdAt: "2026-02-25",
  },
  {
    id: "r9",
    djId: "rico-flame",
    hostDisplayName: "Marcus J.",
    rating: 5,
    comment:
      "Rico had the whole party moving with his Latin-Hip Hop mix. The MC work was a huge bonus!",
    createdAt: "2026-02-12",
  },
  {
    id: "r10",
    djId: "kaz-wave",
    hostDisplayName: "Foxfield Committee",
    rating: 5,
    comment:
      "Kaz brought a festival-level experience to our afterparty. The sound and lighting were next level.",
    createdAt: "2026-01-20",
  },
];

export function getReviewsByDjId(djId: string): Review[] {
  return MOCK_REVIEWS.filter((r) => r.djId === djId);
}
