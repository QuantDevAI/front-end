import { api } from '@/services/api';
import { env } from '@/config/env';
import { mockApi } from '@/services/mock-api';
import { normalizeServiceError, requireApiData } from '@/services/service-error';
import type { ApiEnvelope } from '@/types/api';
import type {
  GenreCatalogItem,
  MovieDetails,
  MovieSearchFilters,
  MovieSearchResult,
} from '@/types/movies';

const MOVIES_ROUTES = {
  genres: '/genres',
  movieDetails: '/movies/{tconst}',
  movies: '/movies',
} as const;

export const moviesService = {
  routes: MOVIES_ROUTES,

  async getGenres(): Promise<GenreCatalogItem[]> {
    if (env.useMockApi) {
      return mockApi.movies.getGenres();
    }

    try {
      const response = await api.get<ApiEnvelope<GenreCatalogItem[]>>(MOVIES_ROUTES.genres);

      return requireApiData(
        response.data,
        'Resposta inválida ao carregar os gêneros. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível carregar os gêneros.');
    }
  },

  async getMovieDetails(movieId: string): Promise<MovieDetails> {
    if (env.useMockApi) {
      return mockApi.movies.getMovieDetails(movieId);
    }

    try {
      const response = await api.get<ApiEnvelope<MovieDetails>>(
        MOVIES_ROUTES.movieDetails.replace('{tconst}', movieId),
      );

      return requireApiData(
        response.data,
        'Resposta inválida ao carregar os detalhes do filme. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível carregar os detalhes deste filme.');
    }
  },

  async searchMovies(filters: MovieSearchFilters): Promise<MovieSearchResult> {
    if (env.useMockApi) {
      return mockApi.movies.searchMovies(filters);
    }

    try {
      const response = await api.get<ApiEnvelope<MovieSearchResult>>(MOVIES_ROUTES.movies, {
        params: filters,
      });

      return requireApiData(
        response.data,
        'Resposta inválida ao buscar filmes. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível buscar filmes no momento.');
    }
  },
};
