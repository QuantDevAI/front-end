export type AppNotificationType =
  'collection' | 'daily_recommendation' | 'onboarding' | 'social' | 'system';

export type AppNotification = {
  createdAt: string;
  id: string;
  message: string;
  read: boolean;
  title: string;
  type: AppNotificationType;
};

export type NotificationsPayload = {
  items: AppNotification[];
  unreadCount: number;
};
