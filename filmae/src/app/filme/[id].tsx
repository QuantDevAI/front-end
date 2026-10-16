import { AppBottomNav } from '@/components/navigation/AppBottomNav';
import { moviesService } from '@/services/movies.service';
import { theme } from '@/theme';
import { formatRuntimeMinutes, formatVotes } from '@/utils/movies';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MovieDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const movieId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [movie, setMovie] = useState<Awaited<
    ReturnType<typeof moviesService.getMovieDetails>
  > | null>(null);

  const loadMovie = useCallback(async () => {
    if (!movieId) {
      setErrorMessage('Nenhum filme foi informado.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await moviesService.getMovieDetails(movieId);
      setMovie(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Não foi possível abrir este filme.';
      setErrorMessage(message);
      setMovie(null);
    } finally {
      setIsLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadMovie();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadMovie]);

  const compatibilityText = useMemo(() => {
    if (!movie) {
      return '';
    }

    if (movie.compatibilityScore >= 90) {
      return 'Compatibilidade muito alta com seu histórico.';
    }

    if (movie.compatibilityScore >= 80) {
      return 'Boa aderência com os filmes que você mais curte.';
    }

    return 'Sugestão fora da bolha para ampliar o seu repertório.';
  }, [movie]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={styles.stateText}>Carregando detalhes...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.centerState}>
            <Text accessibilityLiveRegion="polite" style={styles.errorText}>
              {errorMessage}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void loadMovie()}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : movie ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <LinearGradient colors={movie.gradientColors} style={styles.hero}>
              <View style={styles.heroOverlay} />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Voltar para descobrir"
                onPress={() => router.back()}
                style={({ pressed }) => [styles.heroActionLeft, pressed && styles.pressed]}
              >
                <MaterialIcons color={theme.colors.text} name="arrow-back" size={22} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Favoritar filme'}
                onPress={() => setIsFavorite((currentState) => !currentState)}
                style={({ pressed }) => [styles.heroActionRight, pressed && styles.pressed]}
              >
                <MaterialIcons
                  color={theme.colors.primary}
                  name={isFavorite ? 'favorite' : 'favorite-border'}
                  size={22}
                />
              </Pressable>

              <View style={styles.heroContent}>
                <View style={styles.genreRow}>
                  {movie.genres.map((genre) => (
                    <Text key={genre} style={styles.genreChip}>
                      {genre}
                    </Text>
                  ))}
                </View>

                <Text style={styles.movieTitle}>{movie.title}</Text>
              </View>
            </LinearGradient>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{movie.year}</Text>
              <Text style={styles.metaSeparator}>•</Text>
              <Text style={styles.metaText}>{formatRuntimeMinutes(movie.runtimeMinutes)}</Text>
              <Text style={styles.metaSeparator}>•</Text>
              <MaterialIcons color={theme.colors.rating} name="star" size={15} />
              <Text style={styles.metaText}>{movie.imdb.rating.toFixed(1)}</Text>
              <Text style={styles.metaVotes}>({formatVotes(movie.imdb.votes)})</Text>
            </View>

            <Text style={styles.directorText}>Direção: {movie.director}</Text>

            <View style={styles.compatibilityCard}>
              <View style={styles.compatibilityHeader}>
                <Text style={styles.compatibilityTitle}>Compatibilidade com você</Text>
                <Text style={styles.compatibilityScore}>{movie.compatibilityScore}%</Text>
              </View>

              <View style={styles.compatibilityTrack}>
                <View
                  style={[styles.compatibilityFill, { width: `${movie.compatibilityScore}%` }]}
                />
              </View>

              <Text style={styles.compatibilityDescription}>{compatibilityText}</Text>

              <View style={styles.reasonList}>
                {movie.compatibilityReasons.map((reason) => (
                  <View key={reason} style={styles.reasonRow}>
                    <MaterialIcons color="#22C55E" name="check" size={14} />
                    <Text style={styles.reasonText}>{reason}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sinopse</Text>
              <Text style={styles.synopsis}>{movie.synopsis}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Elenco</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.castRow}
              >
                {movie.cast.map((name) => (
                  <View key={name} style={styles.castItem}>
                    <View style={styles.castAvatar}>
                      <Text style={styles.castAvatarText}>{name.charAt(0)}</Text>
                    </View>
                    <Text numberOfLines={1} style={styles.castName}>
                      {name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
              >
                <Text style={styles.primaryActionText}>Marcar como assistido</Text>
              </Pressable>

              <View style={styles.secondaryActionsRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setInWatchlist((currentState) => !currentState)}
                  style={({ pressed }) => [
                    styles.secondaryAction,
                    inWatchlist && styles.secondaryActionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.secondaryActionText,
                      inWatchlist && styles.secondaryActionTextSelected,
                    ]}
                  >
                    {inWatchlist ? '✓ Na lista' : '+ Quero assistir'}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => setIsFavorite((currentState) => !currentState)}
                  style={({ pressed }) => [
                    styles.secondaryAction,
                    isFavorite && styles.secondaryActionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.secondaryActionText,
                      isFavorite && styles.secondaryActionTextSelected,
                    ]}
                  >
                    ♥ {isFavorite ? 'Favoritado' : 'Favoritar'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.centerState}>
            <Text style={styles.stateText}>Filme indisponível.</Text>
          </View>
        )}

        <AppBottomNav activeTab="discover" />
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
    marginTop: theme.spacing.md,
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.body,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  retryButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  hero: {
    height: 250,
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11,11,13,0.45)',
  },
  heroActionLeft: {
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
  heroActionRight: {
    position: 'absolute',
    top: theme.spacing.xl,
    right: theme.spacing.lg,
    width: 40,
    height: 40,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroContent: {
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.lg,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  genreChip: {
    borderRadius: theme.radii.round,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.16)',
    color: theme.colors.text,
    fontSize: theme.fontSizes.caption,
  },
  movieTitle: {
    color: theme.colors.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: theme.fontWeights.bold,
  },
  metaRow: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.body,
  },
  metaVotes: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.small,
  },
  metaSeparator: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.body,
  },
  directorText: {
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xxl,
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.small,
  },
  compatibilityCard: {
    marginTop: theme.spacing.lg,
    marginHorizontal: theme.spacing.xxl,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(229,9,20,0.25)',
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(229,9,20,0.08)',
  },
  compatibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  compatibilityTrack: {
    height: 8,
    borderRadius: theme.radii.round,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  compatibilityFill: {
    height: '100%',
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primary,
  },
  compatibilityDescription: {
    marginTop: theme.spacing.sm,
    color: theme.colors.cream,
    fontSize: theme.fontSizes.small,
    lineHeight: 18,
  },
  reasonList: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  reasonText: {
    flex: 1,
    color: theme.colors.text,
    opacity: 0.9,
    fontSize: theme.fontSizes.small,
  },
  section: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: theme.fontWeights.semiBold,
    paddingHorizontal: theme.spacing.xxl,
    marginBottom: theme.spacing.sm,
  },
  synopsis: {
    color: theme.colors.prototypeMuted,
    fontSize: theme.fontSizes.body,
    lineHeight: 22,
    paddingHorizontal: theme.spacing.xxl,
  },
  castRow: {
    paddingHorizontal: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  castItem: {
    width: 70,
    alignItems: 'center',
  },
  castAvatar: {
    width: 56,
    height: 56,
    borderRadius: theme.radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.prototypeSurface,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
  },
  castAvatarText: {
    color: theme.colors.text,
    fontWeight: theme.fontWeights.bold,
    fontSize: theme.fontSizes.input,
  },
  castName: {
    marginTop: theme.spacing.xs,
    color: theme.colors.text,
    fontSize: theme.fontSizes.caption,
    textAlign: 'center',
  },
  actions: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  primaryAction: {
    height: 50,
    borderRadius: theme.radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  primaryActionText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.bold,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  secondaryAction: {
    flex: 1,
    height: 46,
    borderRadius: theme.radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
  },
  secondaryActionSelected: {
    borderColor: 'rgba(229,9,20,0.3)',
    backgroundColor: 'rgba(229,9,20,0.1)',
  },
  secondaryActionText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.medium,
  },
  secondaryActionTextSelected: {
    color: theme.colors.primary,
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
});
