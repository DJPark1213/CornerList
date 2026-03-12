import { Dj } from "@/types/dj";

export const MOCK_DJS: Dj[] = [
  {
    id: "mike-beats",
    stageName: "DJ Mike Beats",
    yearsExperience: 5,
    pricePerHour: 120,
    rating: 4.9,
    ratingCount: 47,
    genres: ["Hip-Hop", "Top 40"],
    about:
      "High-energy DJ specializing in Hip-Hop and Top 40. I bring the crowd to their feet at every event. Five years of experience playing frat parties, formals, and campus events across Charlottesville.",
    equipmentSummary: "Pioneer DDJ-1000, JBL EON615 speakers, LED uplighting",
    availabilitySummary: "Weekends (Fri–Sun), some weeknights",
    avatarUrl: null,
    showcaseImages: [],
  },
  {
    id: "emma-vibe",
    stageName: "DJ Emma Vibe",
    yearsExperience: 3,
    pricePerHour: 150,
    rating: 5.0,
    ratingCount: 32,
    genres: ["EDM", "House"],
    about:
      "I create immersive dance experiences with deep house and melodic EDM. Known for smooth transitions and reading the room perfectly. Perfect for late-night events and themed parties.",
    equipmentSummary: "Traktor S4, QSC K12.2 speakers, fog machine, laser kit",
    availabilitySummary: "Fri & Sat evenings only",
    avatarUrl: null,
    showcaseImages: [],
  },
  {
    id: "dynamic-d",
    stageName: "DJ Dynamic",
    yearsExperience: 7,
    pricePerHour: 200,
    rating: 4.8,
    ratingCount: 89,
    genres: ["EDM", "Hip-Hop", "Pop"],
    about:
      "Versatile DJ with 7 years of professional experience. From frat basements to bar takeovers, I adapt my sound to the crowd. UVA alum who knows the local scene inside and out.",
    equipmentSummary:
      "CDJ-3000 x2, DJM-900NXS2, full PA system with subs, professional lighting rig",
    availabilitySummary: "Available most days, book 2 weeks in advance",
    avatarUrl: null,
    showcaseImages: [],
  },
  {
    id: "luna-bass",
    stageName: "DJ Luna Bass",
    yearsExperience: 2,
    pricePerHour: 90,
    rating: 4.6,
    ratingCount: 18,
    genres: ["R&B", "Pop", "Top 40"],
    about:
      "Smooth R&B and Pop blends for chill kickbacks and classy events. Great at setting a vibe without overpowering conversation. Perfect for brunches, dinners, and cocktail hours.",
    equipmentSummary: "DDJ-400, portable Bose L1 system",
    availabilitySummary: "Weekdays and weekends, flexible schedule",
    avatarUrl: null,
    showcaseImages: [],
  },
  {
    id: "rico-flame",
    stageName: "DJ Rico Flame",
    yearsExperience: 4,
    pricePerHour: 160,
    rating: 4.7,
    ratingCount: 55,
    genres: ["Latin", "Hip-Hop", "Top 40"],
    about:
      "Bringing the heat with Latin rhythms fused with Hip-Hop. My sets get everyone moving, whether it's reggaeton, bachata, or trap. The go-to DJ for multicultural events at UVA.",
    equipmentSummary:
      "Pioneer DDJ-SX3, EV ZLX-15P speakers, wireless mic for MC duties",
    availabilitySummary: "Thu–Sat, also available for Sunday day events",
    avatarUrl: null,
    showcaseImages: [],
  },
  {
    id: "kaz-wave",
    stageName: "DJ Kaz Wave",
    yearsExperience: 6,
    pricePerHour: 180,
    rating: 4.9,
    ratingCount: 63,
    genres: ["House", "EDM", "Pop"],
    about:
      "Progressive house and festival-style EDM with a pop sensibility. I've played Spring Fling, Foxfield afterparties, and private events. Big sound, smooth mixing, zero dead air.",
    equipmentSummary:
      "CDJ-2000NXS2 x2, DJM-750MK2, JBL VTX series PA, haze machine",
    availabilitySummary: "Weekends preferred, weekdays negotiable",
    avatarUrl: null,
    showcaseImages: [],
  },
];

export function getDjById(id: string): Dj | undefined {
  return MOCK_DJS.find((dj) => dj.id === id);
}
