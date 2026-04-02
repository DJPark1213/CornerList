export type Genre =
  | "Hip-Hop"
  | "EDM"
  | "Pop"
  | "House"
  | "R&B"
  | "Latin"
  | "Rock"
  | "Top 40";

export type Dj = {
  id: string;
  stageName: string;
  yearsExperience: number;
  pricePerHour: number;
  rating: number;
  ratingCount: number;
  genres: Genre[];
  about: string;
  equipmentSummary: string;
  availabilitySummary: string;
  location: string;
  avatarUrl: string | null;
  showcaseImages: string[];
};

export type Review = {
  id: string;
  djId: string;
  hostDisplayName: string;
  rating: number;
  comment: string;
  createdAt: string;
};
