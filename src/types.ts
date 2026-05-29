export interface SeasonCatalogEntry {
  seasonNumber: number;
  title: string;
  episodes: number;
  year: number;
}

export interface Anime {
  id: string;
  title: string;
  image: string;
  description: string;
  season: string;
  votes: number;
  trailerUrl: string;
  episodesCount: number;
  rating: number;
  genres: string[];
  seasonsCatalog: SeasonCatalogEntry[];
  releaseCalendar: string; // e.g., "Sábados às 14:00"
  
  // Custom Dynamic Rating & Feature Codes System
  communityRating?: string; // "Péssimo" | "Ruim" | "OK" | "Bom" | "Ótimo" | "Absolute Cinema"
  topCodes?: string[];      // e.g. ["PO", "LT", "AL"]
  ratingStats?: { [ratingValue: string]: number };
  codeStats?: { [code: string]: number };
}

export interface Code {
  id: string;
  code: string;
  meaning: string;
  approved: boolean;
}

export interface Comment {
  id: string;
  animeId: string;
  userName: string;
  comment: string;
  createdAt: string;
  likes: number;
  isVip?: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: 'Filme' | 'Curiosidade' | 'Mangá' | 'Novidade';
  createdAt: string;
  imageUrl?: string;
  author: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  animeId?: string;
}
