import { api } from '@/services/api';
import { normalizeServiceError, requireApiData } from '@/services/service-error';
import type { ApiEnvelope } from '@/types/api';
import type {
  UpdateUserProfileRequest,
  UserProfilePayload,
  UserProfilePreferences,
} from '@/types/profile';

const PROFILE_ROUTES = {
  deleteAccount: '/users/me',
  me: '/users/me',
  patchMe: '/users/me',
  preferences: '/users/me/preferences',
  updatePassword: '/users/me/password',
} as const;

export const profileService = {
  routes: PROFILE_ROUTES,

  async getMe(): Promise<UserProfilePayload> {
    try {
      const [profileResponse, preferencesResponse] = await Promise.all([
        api.get<ApiEnvelope<UserProfilePayload['user']>>(PROFILE_ROUTES.me),
        api.get<ApiEnvelope<UserProfilePreferences>>(PROFILE_ROUTES.preferences),
      ]);

      return {
        preferences: requireApiData(
          preferencesResponse.data,
          'Resposta inválida ao carregar preferências do perfil.',
        ),
        user: requireApiData(
          profileResponse.data,
          'Resposta inválida ao carregar dados do perfil.',
        ),
      };
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível carregar os dados de perfil.');
    }
  },

  async updateMe(request: UpdateUserProfileRequest): Promise<UserProfilePayload> {
    try {
      const response = await api.patch<ApiEnvelope<UserProfilePayload['user']>>(
        PROFILE_ROUTES.patchMe,
        request,
      );

      const user = requireApiData(
        response.data,
        'Resposta inválida ao atualizar o perfil. Tente novamente em instantes.',
      );

      const preferencesResponse = await api.get<ApiEnvelope<UserProfilePreferences>>(
        PROFILE_ROUTES.preferences,
      );

      return {
        preferences: requireApiData(
          preferencesResponse.data,
          'Resposta inválida ao carregar preferências após atualizar perfil.',
        ),
        user,
      };
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível salvar os dados de perfil.');
    }
  },
};
