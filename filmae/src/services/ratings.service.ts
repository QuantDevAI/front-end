import { api } from '@/services/api';
import { env } from '@/config/env';
import { mockApi } from '@/services/mock-api';
import { normalizeServiceError, requireApiData } from '@/services/service-error';
import type { ApiEnvelope } from '@/types/api';
import type {
  DeleteMovieRatingResponse,
  SaveMovieRatingRequest,
  SaveMovieRatingResponse,
} from '@/types/ratings';

const RATINGS_ROUTES = {
  deleteRating: '/users/me/ratings/{tconst}',
  getRating: '/users/me/ratings/{tconst}',
  upsertRating: '/users/me/ratings/{tconst}',
} as const;

export const ratingsService = {
  routes: RATINGS_ROUTES,

  async saveMovieRating(
    movieId: string,
    request: SaveMovieRatingRequest,
  ): Promise<SaveMovieRatingResponse> {
    if (env.useMockApi) {
      return mockApi.ratings.saveMovieRating(movieId, request);
    }

    try {
      const response = await api.put<ApiEnvelope<SaveMovieRatingResponse>>(
        RATINGS_ROUTES.upsertRating.replace('{tconst}', movieId),
        request,
      );

      return requireApiData(
        response.data,
        'Resposta inválida ao salvar avaliação. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível salvar a avaliação deste filme.');
    }
  },

  async deleteMovieRating(movieId: string): Promise<DeleteMovieRatingResponse> {
    if (env.useMockApi) {
      return mockApi.ratings.deleteMovieRating(movieId);
    }

    try {
      const response = await api.delete<ApiEnvelope<DeleteMovieRatingResponse>>(
        RATINGS_ROUTES.deleteRating.replace('{tconst}', movieId),
      );

      return requireApiData(
        response.data,
        'Resposta inválida ao remover avaliação. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível remover a avaliação deste filme.');
    }
  },

  async getMovieRating(movieId: string): Promise<number | null> {
    if (env.useMockApi) {
      return mockApi.ratings.getMovieRating(movieId);
    }

    try {
      const response = await api.get<ApiEnvelope<{ rating: number | null }>>(
        RATINGS_ROUTES.getRating.replace('{tconst}', movieId),
      );
      const data = requireApiData(
        response.data,
        'Resposta inválida ao consultar avaliação. Tente novamente em instantes.',
      );
      return data.rating;
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível carregar a avaliação deste filme.');
    }
  },
};
