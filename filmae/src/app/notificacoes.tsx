import { AppBottomNav } from '@/components/navigation/AppBottomNav';
import { notificationsService } from '@/services/notifications.service';
import { theme } from '@/theme';
import type { AppNotification } from '@/types/notifications';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatIsoDate(dateIso: string) {
  return new Date(dateIso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getNotificationIconName(
  notification: AppNotification,
): keyof typeof MaterialIcons.glyphMap {
  switch (notification.type) {
    case 'daily_recommendation':
      return 'movie';
    case 'collection':
      return 'video-library';
    case 'onboarding':
      return 'check-circle-outline';
    case 'social':
      return 'people-outline';
    case 'system':
      return 'settings';
    default:
      return 'notifications-none';
  }
}

export default function NotificationsScreen() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [notificationsData, setNotificationsData] = useState<Awaited<
    ReturnType<typeof notificationsService.getNotifications>
  > | null>(null);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await notificationsService.getNotifications();
      setNotificationsData(result);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível carregar suas notificações.';
      setErrorMessage(message);
      setNotificationsData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadNotifications();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    setErrorMessage(null);

    try {
      const result = await notificationsService.markAsRead(notificationId);
      setNotificationsData(result);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível atualizar a notificação.';
      setErrorMessage(message);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setErrorMessage(null);
    setIsMarkingAllRead(true);

    try {
      const result = await notificationsService.markAllAsRead();
      setNotificationsData(result);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível marcar notificações como lidas.';
      setErrorMessage(message);
    } finally {
      setIsMarkingAllRead(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <MaterialIcons color={theme.colors.text} name="arrow-back" size={20} />
          </Pressable>
          <Text style={styles.title}>Notificações</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.stateText}>Carregando notificações...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.centerState}>
            <Text accessibilityLiveRegion="polite" style={styles.errorText}>
              {errorMessage}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void loadNotifications()}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : notificationsData ? (
          <>
            <View style={styles.topActions}>
              <Text style={styles.unreadText}>{notificationsData.unreadCount} não lidas</Text>
              <Pressable
                accessibilityRole="button"
                disabled={!notificationsData.unreadCount || isMarkingAllRead}
                onPress={() => void markAllAsRead()}
                style={({ pressed }) => [
                  styles.markAllButton,
                  pressed && styles.pressed,
                  (!notificationsData.unreadCount || isMarkingAllRead) && styles.disabledAction,
                ]}
              >
                <Text style={styles.markAllText}>
                  {isMarkingAllRead ? 'Marcando...' : 'Marcar todas como lidas'}
                </Text>
              </Pressable>
            </View>

            {notificationsData.items.length ? (
              <ScrollView
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              >
                {notificationsData.items.map((notification) => (
                  <Pressable
                    key={notification.id}
                    accessibilityRole="button"
                    onPress={() => void markAsRead(notification.id)}
                    style={({ pressed }) => [
                      styles.notificationCard,
                      !notification.read && styles.notificationCardUnread,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.notificationIcon}>
                      <MaterialIcons
                        color={!notification.read ? theme.colors.primary : theme.colors.creamMuted}
                        name={getNotificationIconName(notification)}
                        size={20}
                      />
                    </View>

                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                      <Text style={styles.notificationDate}>
                        {formatIsoDate(notification.createdAt)}
                      </Text>
                    </View>

                    {!notification.read ? <View style={styles.unreadDot} /> : null}
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.centerState}>
                <MaterialIcons color={theme.colors.creamMuted} name="notifications-off" size={28} />
                <Text style={styles.stateText}>Você não tem notificações no momento.</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.centerState}>
            <Text style={styles.stateText}>Sem notificações para exibir.</Text>
          </View>
        )}

        <AppBottomNav activeTab="profile" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.warmBackground,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.warmBackground,
  },
  header: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.warmSurface,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: theme.fontWeights.bold,
  },
  headerPlaceholder: {
    width: 38,
    height: 38,
  },
  topActions: {
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  unreadText: {
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
  },
  markAllButton: {
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.prototypeSurface,
  },
  markAllText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.medium,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
  },
  stateText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.body,
    textAlign: 'center',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.body,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.lg,
    height: 44,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  retryButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  notificationCard: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  notificationCardUnread: {
    borderColor: theme.colors.primaryTransparent,
    backgroundColor: '#2A1616',
  },
  notificationIcon: {
    width: 34,
    height: 34,
    borderRadius: theme.radii.round,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  notificationMessage: {
    marginTop: 2,
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
    lineHeight: 18,
  },
  notificationDate: {
    marginTop: theme.spacing.xs,
    color: theme.colors.prototypeMuted,
    fontSize: theme.fontSizes.caption,
  },
  unreadDot: {
    marginTop: 4,
    width: 8,
    height: 8,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primary,
  },
  disabledAction: {
    opacity: 0.55,
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
});
