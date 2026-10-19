import type { ApiPaginationMeta } from '@/types/api';

export type MovieType = 'movie' | 'series';

export type ImdbRating = {
  rating: number;
  votes: number;
};

export type MovieUserState = {
  favorite: boolean;
  rating: number | null;
  rewatch: boolean;
  watched: boolean;
  watchlist: boolean;
};

export type MovieCatalogItem = {
  accentColor: string;
  cast: string[];
  compatibilityReasons: string[];
  compatibilityScore: number;
  director: string;
  genres: string[];
  gradientColors: readonly [string, string, string, string];
  id: string;
  imdb: ImdbRating;
  originalTitle: string;
  runtimeMinutes: number;
  synopsis: string;
  title: string;
  type: MovieType;
  year: number;
};

export type MovieListItem = {
  accentColor: string;
  compatibilityScore: number;
  director: string;
  genres: string[];
  gradientColors: readonly [string, string, string, string];
  id: string;
  imdb: ImdbRating;
  runtimeMinutes: number;
  title: string;
  userState: MovieUserState;
  year: number;
};

export type MovieDetails = MovieListItem & {
  accentColor: string;
  cast: string[];
  compatibilityReasons: string[];
  director: string;
  gradientColors: readonly [string, string, string, string];
  originalTitle: string;
  synopsis: string;
  type: MovieType;
};

export type MovieSearchFilters = {
  genres?: string[];
  minRating?: number;
  page?: number;
  q?: string;
  size?: number;
  yearFrom?: number;
  yearTo?: number;
};

export type MovieSearchResult = {
  data: MovieListItem[];
  meta: ApiPaginationMeta;
};

export type GenreCatalogItem = {
  id: string;
  movieCount: number;
  name: string;
};
