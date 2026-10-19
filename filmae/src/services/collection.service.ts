import { api } from '@/services/api';
import { normalizeServiceError, requireApiData } from '@/services/service-error';
import type { ApiEnvelope } from '@/types/api';
import type {
  CollectionMoviePayload,
  CollectionPayload,
  GetCollectionRequest,
  UpsertCollectionMovieRequest,
} from '@/types/collection';

const COLLECTION_ROUTES = {
  collection: '/users/me/collection',
  movieCollection: '/users/me/collection/{tconst}',
} as const;

export const collectionService = {
  routes: COLLECTION_ROUTES,

  async getCollection(request: GetCollectionRequest = {}): Promise<CollectionPayload> {
    try {
      const response = await api.get<ApiEnvelope<CollectionPayload>>(COLLECTION_ROUTES.collection, {
        params: request.filter ? { filter: request.filter } : undefined,
      });

      return requireApiData(
        response.data,
        'Resposta inválida ao carregar sua coleção. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível carregar sua coleção.');
    }
  },

  async getMovieCollectionState(movieId: string): Promise<CollectionMoviePayload> {
    try {
      const response = await api.get<ApiEnvelope<CollectionMoviePayload>>(
        COLLECTION_ROUTES.movieCollection.replace('{tconst}', movieId),
      );

      return requireApiData(
        response.data,
        'Resposta inválida ao carregar estado da coleção para este filme.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível carregar o estado da coleção.');
    }
  },

  async upsertMovieCollectionState(
    movieId: string,
    request: UpsertCollectionMovieRequest,
  ): Promise<CollectionMoviePayload> {
    try {
      const response = await api.put<ApiEnvelope<CollectionMoviePayload>>(
        COLLECTION_ROUTES.movieCollection.replace('{tconst}', movieId),
        request,
      );

      return requireApiData(
        response.data,
        'Resposta inválida ao atualizar a coleção. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível atualizar sua coleção.');
    }
  },

  async removeMovieFromCollection(movieId: string): Promise<CollectionMoviePayload> {
    try {
      const response = await api.delete<ApiEnvelope<CollectionMoviePayload>>(
        COLLECTION_ROUTES.movieCollection.replace('{tconst}', movieId),
      );

      return requireApiData(
        response.data,
        'Resposta inválida ao remover filme da coleção. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível remover o filme da coleção.');
    }
  },
};
