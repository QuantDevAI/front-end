import { api } from '@/services/api';
import { normalizeServiceError, requireApiData } from '@/services/service-error';
import type { ApiEnvelope } from '@/types/api';
import type { NotificationsPayload } from '@/types/notifications';

const NOTIFICATIONS_ROUTES = {
  markRead: '/users/me/notifications/{id}',
  notifications: '/users/me/notifications',
  readAll: '/users/me/notifications/read-all',
} as const;

export const notificationsService = {
  routes: NOTIFICATIONS_ROUTES,

  async getNotifications(): Promise<NotificationsPayload> {
    try {
      const response = await api.get<ApiEnvelope<NotificationsPayload>>(
        NOTIFICATIONS_ROUTES.notifications,
      );

      return requireApiData(
        response.data,
        'Resposta inválida ao carregar notificações. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível carregar as notificações.');
    }
  },

  async markAsRead(notificationId: string): Promise<NotificationsPayload> {
    try {
      const response = await api.patch<ApiEnvelope<NotificationsPayload>>(
        NOTIFICATIONS_ROUTES.markRead.replace('{id}', notificationId),
      );

      return requireApiData(
        response.data,
        'Resposta inválida ao marcar notificação como lida. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível atualizar esta notificação.');
    }
  },

  async markAllAsRead(): Promise<NotificationsPayload> {
    try {
      const response = await api.post<ApiEnvelope<NotificationsPayload>>(
        NOTIFICATIONS_ROUTES.readAll,
      );

      return requireApiData(
        response.data,
        'Resposta inválida ao marcar notificações como lidas. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível atualizar as notificações.');
    }
  },
};
