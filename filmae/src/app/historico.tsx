import { AppBottomNav } from '@/components/navigation/AppBottomNav';
import { dashboardService } from '@/services/dashboard.service';
import { theme } from '@/theme';
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

export default function HistoryScreen() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<Awaited<
    ReturnType<typeof dashboardService.getWatchHistory>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await dashboardService.getWatchHistory();
      setHistoryData(result);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível carregar seu histórico.';
      setErrorMessage(message);
      setHistoryData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadHistory();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadHistory]);

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
          <Text style={styles.title}>Histórico</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.stateText}>Carregando histórico...</Text>
          </View>
        ) : historyData && historyData.length > 0 ? (
          <ScrollView
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          >
            {errorMessage ? (
              <View style={styles.warningBanner}>
                <Text accessibilityLiveRegion="polite" style={styles.warningText}>
                  {errorMessage}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void loadHistory()}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
                >
                  <Text style={styles.retryButtonText}>Atualizar</Text>
                </Pressable>
              </View>
            ) : null}

            {historyData.map((entry, index) => (
              <Pressable
                key={`${entry.movieId}-${entry.watchedAt}-${index}`}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/filme/[id]',
                    params: { id: entry.movieId },
                  })
                }
                style={({ pressed }) => [styles.historyCard, pressed && styles.pressed]}
              >
                <View style={styles.historyMain}>
                  <Text style={styles.historyTitle}>{entry.title}</Text>
                  <Text style={styles.historyMeta}>
                    {entry.year} • visto em {formatIsoDate(entry.watchedAt)}
                  </Text>
                </View>
                <Text style={styles.historyRating}>
                  {entry.rating === null ? 'Sem nota' : `${entry.rating}/5`}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.centerState}>
            {errorMessage ? (
              <View style={styles.warningBanner}>
                <Text accessibilityLiveRegion="polite" style={styles.warningText}>
                  {errorMessage}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void loadHistory()}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
                >
                  <Text style={styles.retryButtonText}>Atualizar</Text>
                </Pressable>
              </View>
            ) : null}

            <MaterialIcons color={theme.colors.creamMuted} name="history" size={28} />
            <Text style={styles.stateText}>Nenhum filme assistido no histórico.</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/descobrir')}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            >
              <Text style={styles.retryButtonText}>Ir para Descobrir</Text>
            </Pressable>
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
  warningBanner: {
    width: '100%',
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 114, 0.45)',
    backgroundColor: 'rgba(255, 107, 114, 0.1)',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  warningText: {
    color: theme.colors.cream,
    fontSize: theme.fontSizes.small,
    lineHeight: 18,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  historyCard: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  historyMain: {
    flex: 1,
  },
  historyTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  historyMeta: {
    marginTop: 2,
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
  },
  historyRating: {
    color: theme.colors.rating,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.semiBold,
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
});
