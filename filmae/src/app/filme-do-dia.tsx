import { collectionService } from '@/services/collection.service';
import { homeService } from '@/services/home.service';
import { moviesService } from '@/services/movies.service';
import { theme } from '@/theme';
import { formatRuntimeMinutes } from '@/utils/movies';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FeedbackState = 'nope' | 'watch' | 'watched' | null;

export default function DailyMovieScreen() {
  const [dailyMovie, setDailyMovie] = useState<Awaited<
    ReturnType<typeof moviesService.getMovieDetails>
  > | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const loadDailyMovie = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const homeData = await homeService.getHome();
      const movie = await moviesService.getMovieDetails(homeData.dailyMovie.id);
      setDailyMovie(movie);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível carregar o filme do dia.';
      setErrorMessage(message);
      setDailyMovie(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadDailyMovie();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadDailyMovie]);

  const updateDailyMovieCollectionState = useCallback(
    async (stateKey: 'watchlist' | 'watched', nextValue: boolean, feedbackState: FeedbackState) => {
      if (!dailyMovie) {
        return;
      }

      setIsSubmittingFeedback(true);
      setErrorMessage(null);

      try {
        const result = await collectionService.upsertMovieCollectionState(dailyMovie.id, {
          [stateKey]: nextValue,
        });

        setDailyMovie((currentMovie) => {
          if (!currentMovie) {
            return currentMovie;
          }

          return {
            ...currentMovie,
            userState: result.movie.userState,
          };
        });

        setFeedback(feedbackState);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Não foi possível atualizar sua coleção.';
        setErrorMessage(message);
      } finally {
        setIsSubmittingFeedback(false);
      }
    },
    [dailyMovie],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={styles.stateText}>Analisando seu filme do dia...</Text>
          </View>
        ) : dailyMovie ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <LinearGradient colors={dailyMovie.gradientColors} style={styles.hero}>
              <View style={styles.heroOverlay} />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Voltar para a Home"
                onPress={() => router.back()}
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              >
                <MaterialIcons color={theme.colors.text} name="arrow-back" size={22} />
              </Pressable>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>🎬 Filme do dia</Text>
              </View>

              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>{dailyMovie.title}</Text>
                <Text style={styles.heroSubtitle}>
                  {dailyMovie.year} • {dailyMovie.director}
                </Text>
              </View>
            </LinearGradient>

            <View style={styles.content}>
              <View style={styles.compatibilityCard}>
                <View style={styles.compatibilityHeader}>
                  <Text style={styles.compatibilityTitle}>Compatibilidade</Text>
                  <Text style={styles.compatibilityScore}>{dailyMovie.compatibilityScore}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[styles.progressFill, { width: `${dailyMovie.compatibilityScore}%` }]}
                  />
                </View>
                <Text style={styles.compatibilityText}>
                  Você costuma gostar de histórias complexas e filmes de ficção científica.
                </Text>
              </View>

              <View style={styles.metaGrid}>
                <View style={styles.metaCard}>
                  <Text style={styles.metaValue}>
                    {formatRuntimeMinutes(dailyMovie.runtimeMinutes)}
                  </Text>
                  <Text style={styles.metaLabel}>Duração</Text>
                </View>
                <View style={styles.metaCard}>
                  <Text style={styles.metaValue}>{dailyMovie.imdb.rating.toFixed(1)} ★</Text>
                  <Text style={styles.metaLabel}>IMDb</Text>
                </View>
                <View style={styles.metaCard}>
                  <Text numberOfLines={1} style={styles.metaValue}>
                    {dailyMovie.genres[0]}
                  </Text>
                  <Text style={styles.metaLabel}>Gênero</Text>
                </View>
              </View>

              <Text style={styles.synopsis}>{dailyMovie.synopsis}</Text>

              <View style={styles.actions}>
                {feedback === 'watch' ? (
                  <View style={styles.successBanner}>
                    <Text style={styles.successText}>✓ Adicionado à sua lista!</Text>
                  </View>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    disabled={isSubmittingFeedback}
                    onPress={() => void updateDailyMovieCollectionState('watchlist', true, 'watch')}
                    style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.primaryButtonText}>Quero assistir</Text>
                  </Pressable>
                )}

                <Pressable
                  accessibilityRole="button"
                  disabled={isSubmittingFeedback}
                  onPress={() => void updateDailyMovieCollectionState('watched', true, 'watched')}
                  style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                >
                  <Text style={styles.secondaryButtonText}>Já assisti</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  disabled={isSubmittingFeedback}
                  onPress={() => {
                    setFeedback('nope');
                    router.replace('/home');
                  }}
                  style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
                >
                  <Text style={styles.ghostButtonText}>Não faz meu estilo</Text>
                </Pressable>
              </View>

              {feedback === 'watched' ? (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    Boa! Esse filme já está marcado como assistido. Você pode abrir o detalhe para
                    registrar sua nota.
                  </Text>
                </View>
              ) : null}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.centerState}>
            <Text accessibilityLiveRegion="polite" style={styles.stateText}>
              {errorMessage ?? 'Não há filme do dia disponível.'}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void loadDailyMovie()}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            >
              <Text style={styles.retryButtonText}>Atualizar</Text>
            </Pressable>
          </View>
        )}
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
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
  },
  stateText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.body,
    marginTop: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.body,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.lg,
    height: 42,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  retryButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  hero: {
    height: 260,
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11,11,13,0.45)',
  },
  backButton: {
    position: 'absolute',
    top: theme.spacing.xl,
    left: theme.spacing.lg,
    width: 40,
    height: 40,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  badge: {
    position: 'absolute',
    top: theme.spacing.xl,
    right: theme.spacing.lg,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
  },
  badgeText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.bold,
  },
  heroContent: {
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.lg,
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: theme.fontWeights.bold,
  },
  heroSubtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.body,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
  },
  compatibilityCard: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(229,9,20,0.2)',
    backgroundColor: 'rgba(229,9,20,0.08)',
    padding: theme.spacing.lg,
  },
  compatibilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  compatibilityTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  compatibilityScore: {
    color: theme.colors.primary,
    fontSize: 26,
    fontWeight: theme.fontWeights.extraBold,
  },
  progressTrack: {
    height: 8,
    borderRadius: theme.radii.round,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primary,
  },
  compatibilityText: {
    color: theme.colors.cream,
    fontSize: theme.fontSizes.small,
    lineHeight: 18,
    marginTop: theme.spacing.sm,
  },
  metaGrid: {
    marginTop: theme.spacing.lg,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  metaCard: {
    flex: 1,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.prototypeSurface,
  },
  metaValue: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.bold,
  },
  metaLabel: {
    marginTop: 2,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.caption,
  },
  synopsis: {
    marginTop: theme.spacing.lg,
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.body,
    lineHeight: 22,
  },
  actions: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  primaryButton: {
    height: 50,
    borderRadius: theme.radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  primaryButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.bold,
  },
  secondaryButton: {
    height: 46,
    borderRadius: theme.radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.medium,
  },
  ghostButton: {
    height: 46,
    borderRadius: theme.radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: 'transparent',
  },
  ghostButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.medium,
  },
  successBanner: {
    height: 50,
    borderRadius: theme.radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    backgroundColor: 'rgba(34,197,94,0.14)',
  },
  successText: {
    color: '#22C55E',
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  infoBox: {
    marginTop: theme.spacing.md,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
  },
  infoText: {
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
    lineHeight: 18,
    textAlign: 'center',
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
});
