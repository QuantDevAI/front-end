import type { MovieListItem, MovieUserState } from '@/types/movies';

export type CollectionStateKey = Exclude<keyof MovieUserState, 'rating'>;

export type CollectionFilter = 'all' | CollectionStateKey;

export type CollectionSummary = {
  favorite: number;
  rated: number;
  rewatch: number;
  total: number;
  watched: number;
  watchlist: number;
};

export type CollectionPayload = {
  items: MovieListItem[];
  summary: CollectionSummary;
};

export type CollectionMoviePayload = {
  movie: MovieListItem;
  summary: CollectionSummary;
  updatedAt: string;
};

export type GetCollectionRequest = {
  filter?: CollectionFilter;
};

export type UpsertCollectionMovieRequest = Partial<
  Pick<MovieUserState, 'favorite' | 'rewatch' | 'watched' | 'watchlist'>
>;
