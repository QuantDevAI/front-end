import { api } from '@/services/api';
import { normalizeServiceError, requireApiData } from '@/services/service-error';
import type { ApiEnvelope } from '@/types/api';
import type {
  CompleteOnboardingResponse,
  OnboardingProgress,
  SaveOnboardingFavoriteMoviesRequest,
  SaveOnboardingFavoriteMoviesResponse,
  SaveOnboardingGenresRequest,
  SaveOnboardingGenresResponse,
  SaveOnboardingProfileStoryRequest,
  SaveOnboardingProfileStoryResponse,
} from '@/types/onboarding';

const ONBOARDING_ROUTES = {
  complete: '/users/me/onboarding/complete',
  favoriteMovies: '/users/me/onboarding/favorite-movies',
  genres: '/users/me/onboarding/genres',
  progress: '/users/me/onboarding',
  profileStory: '/users/me/onboarding/profile-story',
} as const;

export const onboardingService = {
  routes: ONBOARDING_ROUTES,

  async getProgress(): Promise<OnboardingProgress> {
    try {
      const response = await api.get<ApiEnvelope<OnboardingProgress>>(ONBOARDING_ROUTES.progress);

      return requireApiData(
        response.data,
        'Resposta inválida ao carregar progresso do onboarding. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível carregar seu onboarding no momento.');
    }
  },

  async saveGenres(request: SaveOnboardingGenresRequest): Promise<SaveOnboardingGenresResponse> {
    try {
      const response = await api.put<ApiEnvelope<SaveOnboardingGenresResponse>>(
        ONBOARDING_ROUTES.genres,
        request,
      );

      return requireApiData(
        response.data,
        'Resposta inválida ao salvar gêneros. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível salvar seus gêneros no momento.');
    }
  },

  async saveFavoriteMovies(
    request: SaveOnboardingFavoriteMoviesRequest,
  ): Promise<SaveOnboardingFavoriteMoviesResponse> {
    try {
      const response = await api.put<ApiEnvelope<SaveOnboardingFavoriteMoviesResponse>>(
        ONBOARDING_ROUTES.favoriteMovies,
        request,
      );

      return requireApiData(
        response.data,
        'Resposta inválida ao salvar filmes favoritos. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível salvar seus filmes favoritos.');
    }
  },

  async saveProfileStory(
    request: SaveOnboardingProfileStoryRequest,
  ): Promise<SaveOnboardingProfileStoryResponse> {
    try {
      const response = await api.put<ApiEnvelope<SaveOnboardingProfileStoryResponse>>(
        ONBOARDING_ROUTES.profileStory,
        request,
      );

      return requireApiData(
        response.data,
        'Resposta inválida ao salvar texto do perfil. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível salvar o texto do perfil.');
    }
  },

  async completeOnboarding(): Promise<CompleteOnboardingResponse> {
    try {
      const response = await api.post<ApiEnvelope<CompleteOnboardingResponse>>(
        ONBOARDING_ROUTES.complete,
      );

      return requireApiData(
        response.data,
        'Resposta inválida ao concluir onboarding. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível concluir o onboarding no momento.');
    }
  },
};
