import { api } from '@/services/api';
import { env } from '@/config/env';
import { mockApi } from '@/services/mock-api';
import { normalizeServiceError, requireApiData } from '@/services/service-error';
import type { ApiEnvelope } from '@/types/api';
import type { DashboardPayload, WatchHistoryEntry } from '@/types/dashboard';

const DASHBOARD_ROUTES = {
  dashboard: '/users/me/dashboard',
} as const;

export const dashboardService = {
  routes: DASHBOARD_ROUTES,

  async getDashboard(): Promise<DashboardPayload> {
    if (env.useMockApi) {
      return mockApi.dashboard.getDashboard();
    }

    try {
      const response = await api.get<ApiEnvelope<DashboardPayload>>(DASHBOARD_ROUTES.dashboard);

      return requireApiData(
        response.data,
        'Resposta inválida ao carregar dashboard. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível carregar os dados do dashboard.');
    }
  },

  async getWatchHistory(): Promise<WatchHistoryEntry[]> {
    if (env.useMockApi) {
      return mockApi.dashboard.getWatchHistory();
    }

    const dashboard = await this.getDashboard();
    return dashboard.historyPreview;
  },
};
