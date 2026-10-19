import { api } from '@/services/api';
import { normalizeServiceError, requireApiData } from '@/services/service-error';
import type { ApiEnvelope } from '@/types/api';
import type { HomePayload } from '@/types/home';

const HOME_ROUTES = {
  home: '/home',
  outsideBubble: '/recommendations/outside-bubble',
  recommendations: '/recommendations',
  recommendationsDaily: '/recommendations/daily',
} as const;

export const homeService = {
  routes: HOME_ROUTES,

  async getHome(): Promise<HomePayload> {
    try {
      const response = await api.get<ApiEnvelope<HomePayload>>(HOME_ROUTES.home);

      return requireApiData(
        response.data,
        'Resposta inválida ao carregar a Home. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível carregar a Home no momento.');
    }
  },
};
