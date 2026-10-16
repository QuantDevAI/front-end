import { AppBottomNav } from '@/components/navigation/AppBottomNav';
import { dashboardService } from '@/services/dashboard.service';
import { theme } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatMinutesAsHours(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours) {
    return `${minutes} min`;
  }

  return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
}

function formatIsoDate(dateIso: string) {
  return new Date(dateIso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function DashboardScreen() {
  const [dashboardData, setDashboardData] = useState<Awaited<
    ReturnType<typeof dashboardService.getDashboard>
  > | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await dashboardService.getDashboard();
      setDashboardData(result);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível carregar seu dashboard.';
      setErrorMessage(message);
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadDashboard]);

  const overviewCards = useMemo(() => {
    if (!dashboardData) {
      return [];
    }

    return [
      {
        label: 'Filmes assistidos',
        value: String(dashboardData.kpis.watchedCount),
      },
      {
        label: 'Filmes avaliados',
        value: String(dashboardData.kpis.ratedCount),
      },
      {
        label: 'Favoritos',
        value: String(dashboardData.kpis.favoriteCount),
      },
      {
        label: 'Na watchlist',
        value: String(dashboardData.kpis.watchlistCount),
      },
    ];
  }, [dashboardData]);

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

          <View style={styles.headerText}>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Seu perfil cinematográfico</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.stateText}>Carregando dashboard...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.centerState}>
            <Text accessibilityLiveRegion="polite" style={styles.errorText}>
              {errorMessage}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void loadDashboard()}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : dashboardData ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Visão geral</Text>
              <View style={styles.kpiGrid}>
                {overviewCards.map((card) => (
                  <View key={card.label} style={styles.kpiCard}>
                    <Text style={styles.kpiValue}>{card.value}</Text>
                    <Text style={styles.kpiLabel}>{card.label}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.helpText}>
                Tempo assistido: {formatMinutesAsHours(dashboardData.kpis.totalMinutesWatched)}
              </Text>
              <Text style={styles.helpText}>Reassistir: {dashboardData.kpis.rewatchCount}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Gêneros mais assistidos</Text>
              {dashboardData.topGenres.length ? (
                dashboardData.topGenres.map((genre) => (
                  <View key={genre.genre} style={styles.genreRow}>
                    <Text style={styles.genreName}>{genre.genre}</Text>
                    <Text style={styles.genreCount}>{genre.count}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.helpText}>Sem dados de gênero disponíveis.</Text>
              )}
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Histórico recente</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/historico')}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Text style={styles.sectionAction}>Ver tudo</Text>
                </Pressable>
              </View>

              {dashboardData.historyPreview.length ? (
                dashboardData.historyPreview.map((entry, index) => (
                  <Pressable
                    key={`${entry.movieId}-${entry.watchedAt}-${index}`}
                    accessibilityRole="button"
                    onPress={() =>
                      router.push({
                        pathname: '/filme/[id]',
                        params: { id: entry.movieId },
                      })
                    }
                    style={({ pressed }) => [styles.historyItem, pressed && styles.pressed]}
                  >
                    <View style={styles.historyText}>
                      <Text style={styles.historyTitle}>{entry.title}</Text>
                      <Text style={styles.historyMeta}>
                        {entry.year} • {formatIsoDate(entry.watchedAt)}
                      </Text>
                    </View>
                    <Text style={styles.historyRating}>
                      {entry.rating === null ? 'Sem nota' : `${entry.rating}/5`}
                    </Text>
                  </Pressable>
                ))
              ) : (
                <Text style={styles.helpText}>
                  Você ainda não tem filmes assistidos registrados.
                </Text>
              )}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.centerState}>
            <Text style={styles.stateText}>Sem dados para exibir no dashboard.</Text>
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
    gap: theme.spacing.sm,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.warmSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: theme.fontWeights.bold,
  },
  subtitle: {
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
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
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  card: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  kpiCard: {
    minWidth: '47%',
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  kpiValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: theme.fontWeights.bold,
  },
  kpiLabel: {
    marginTop: 2,
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
  },
  helpText: {
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
  },
  genreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  genreName: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.small,
  },
  genreCount: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.semiBold,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionAction: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.semiBold,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  historyText: {
    flex: 1,
  },
  historyTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.semiBold,
  },
  historyMeta: {
    marginTop: 2,
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.caption,
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
