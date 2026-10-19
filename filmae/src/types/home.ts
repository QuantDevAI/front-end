import type { MovieListItem } from '@/types/movies';

export type HomeUser = {
  id: number;
  name: string;
  onboardingCompleted: boolean;
};

export type HomeCollectionSummary = {
  favorite: number;
  rewatch: number;
  watched: number;
  watchlist: number;
};

export type HomeDailyMovie = MovieListItem & {
  reason: string;
};

export type HomePayload = {
  collectionSummary: HomeCollectionSummary;
  dailyMovie: HomeDailyMovie;
  outsideBubble: MovieListItem[];
  recommendations: MovieListItem[];
  unreadNotifications: number;
  user: HomeUser;
};
