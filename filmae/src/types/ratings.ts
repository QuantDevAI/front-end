import type { CollectionSummary } from '@/types/collection';
import type { MovieListItem } from '@/types/movies';

export type SaveMovieRatingRequest = {
  rating: number;
};

export type SaveMovieRatingResponse = {
  movie: MovieListItem;
  summary: CollectionSummary;
  updatedAt: string;
};

export type DeleteMovieRatingResponse = SaveMovieRatingResponse;
