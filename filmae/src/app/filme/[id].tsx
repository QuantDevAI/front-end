import { AppBottomNav } from '@/components/navigation/AppBottomNav';
import { collectionService } from '@/services/collection.service';
import { moviesService } from '@/services/movies.service';
import { ratingsService } from '@/services/ratings.service';
import { theme } from '@/theme';
import type { CollectionStateKey, UpsertCollectionMovieRequest } from '@/types/collection';
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
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingMovieState, setIsUpdatingMovieState] = useState(false);
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
    setActionErrorMessage(null);

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

  const buildCollectionRequest = useCallback(
    (stateKey: CollectionStateKey, nextValue: boolean): UpsertCollectionMovieRequest => {
      switch (stateKey) {
        case 'favorite':
          return { favorite: nextValue };
        case 'rewatch':
          return { rewatch: nextValue };
        case 'watched':
          return { watched: nextValue };
        case 'watchlist':
          return { watchlist: nextValue };
        default:
          return {};
      }
    },
    [],
  );

  const updateCollectionState = useCallback(
    async (stateKey: CollectionStateKey, nextValue: boolean) => {
      if (!movieId || !movie) {
        return;
      }

      setActionErrorMessage(null);
      setIsUpdatingMovieState(true);

      try {
        const result = await collectionService.upsertMovieCollectionState(
          movieId,
          buildCollectionRequest(stateKey, nextValue),
        );

        setMovie((currentMovie) => {
          if (!currentMovie) {
            return currentMovie;
          }

          return {
            ...currentMovie,
            userState: result.movie.userState,
          };
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Não foi possível atualizar sua coleção.';
        setActionErrorMessage(message);
      } finally {
        setIsUpdatingMovieState(false);
      }
    },
    [buildCollectionRequest, movie, movieId],
  );

  const saveRating = useCallback(
    async (rating: number) => {
      if (!movieId || !movie) {
        return;
      }

      setActionErrorMessage(null);
      setIsUpdatingMovieState(true);

      try {
        const result = await ratingsService.saveMovieRating(movieId, { rating });
        setMovie((currentMovie) => {
          if (!currentMovie) {
            return currentMovie;
          }

          return {
            ...currentMovie,
            userState: result.movie.userState,
          };
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Não foi possível salvar sua avaliação.';
        setActionErrorMessage(message);
      } finally {
        setIsUpdatingMovieState(false);
      }
    },
    [movie, movieId],
  );

  const clearRating = useCallback(async () => {
    if (!movieId || !movie) {
      return;
    }

    setActionErrorMessage(null);
    setIsUpdatingMovieState(true);

    try {
      const result = await ratingsService.deleteMovieRating(movieId);
      setMovie((currentMovie) => {
        if (!currentMovie) {
          return currentMovie;
        }

        return {
          ...currentMovie,
          userState: result.movie.userState,
        };
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível remover sua avaliação.';
      setActionErrorMessage(message);
    } finally {
      setIsUpdatingMovieState(false);
    }
  }, [movie, movieId]);

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
                accessibilityLabel={
                  movie.userState.favorite ? 'Remover dos favoritos' : 'Favoritar filme'
                }
                onPress={() => void updateCollectionState('favorite', !movie.userState.favorite)}
                style={({ pressed }) => [styles.heroActionRight, pressed && styles.pressed]}
              >
                <MaterialIcons
                  color={theme.colors.primary}
                  name={movie.userState.favorite ? 'favorite' : 'favorite-border'}
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
              {actionErrorMessage ? (
                <Text accessibilityLiveRegion="polite" style={styles.actionErrorText}>
                  {actionErrorMessage}
                </Text>
              ) : null}

              <Pressable
                accessibilityRole="button"
                onPress={() => void updateCollectionState('watched', !movie.userState.watched)}
                style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
              >
                <Text style={styles.primaryActionText}>
                  {movie.userState.watched ? '✓ Assistido' : 'Marcar como assistido'}
                </Text>
              </Pressable>

              <View style={styles.secondaryActionsRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    void updateCollectionState('watchlist', !movie.userState.watchlist)
                  }
                  style={({ pressed }) => [
                    styles.secondaryAction,
                    movie.userState.watchlist && styles.secondaryActionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.secondaryActionText,
                      movie.userState.watchlist && styles.secondaryActionTextSelected,
                    ]}
                  >
                    {movie.userState.watchlist ? '✓ Na lista' : '+ Quero assistir'}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => void updateCollectionState('favorite', !movie.userState.favorite)}
                  style={({ pressed }) => [
                    styles.secondaryAction,
                    movie.userState.favorite && styles.secondaryActionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.secondaryActionText,
                      movie.userState.favorite && styles.secondaryActionTextSelected,
                    ]}
                  >
                    ♥ {movie.userState.favorite ? 'Favoritado' : 'Favoritar'}
                  </Text>
                </Pressable>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => void updateCollectionState('rewatch', !movie.userState.rewatch)}
                style={({ pressed }) => [
                  styles.secondaryAction,
                  movie.userState.rewatch && styles.secondaryActionSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.secondaryActionText,
                    movie.userState.rewatch && styles.secondaryActionTextSelected,
                  ]}
                >
                  ↻ {movie.userState.rewatch ? 'Reassistir marcado' : 'Quero reassistir'}
                </Text>
              </Pressable>

              <View style={styles.ratingCard}>
                <Text style={styles.ratingTitle}>Sua avaliação</Text>
                <View style={styles.ratingStarsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable
                      key={star}
                      accessibilityRole="button"
                      accessibilityLabel={`Avaliar ${star} de 5`}
                      disabled={isUpdatingMovieState}
                      onPress={() => void saveRating(star)}
                      style={({ pressed }) => [styles.starButton, pressed && styles.pressed]}
                    >
                      <MaterialIcons
                        color={
                          movie.userState.rating !== null && movie.userState.rating >= star
                            ? theme.colors.rating
                            : theme.colors.prototypeMuted
                        }
                        name="star"
                        size={22}
                      />
                    </Pressable>
                  ))}
                </View>

                <View style={styles.ratingFooter}>
                  <Text style={styles.ratingCurrentText}>
                    {movie.userState.rating === null
                      ? 'Você ainda não avaliou este filme.'
                      : `Nota atual: ${movie.userState.rating}/5`}
                  </Text>

                  <Pressable
                    accessibilityRole="button"
                    disabled={isUpdatingMovieState || movie.userState.rating === null}
                    onPress={() => void clearRating()}
                    style={({ pressed }) => [
                      styles.clearRatingButton,
                      pressed && styles.pressed,
                      (isUpdatingMovieState || movie.userState.rating === null) &&
                        styles.clearRatingButtonDisabled,
                    ]}
                  >
                    <Text style={styles.clearRatingText}>Limpar nota</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.centerState}>
            <Text accessibilityLiveRegion="polite" style={styles.stateText}>
              {errorMessage ?? 'Filme indisponível.'}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void loadMovie()}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            >
              <Text style={styles.retryButtonText}>Atualizar</Text>
            </Pressable>
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
  actionErrorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.small,
    textAlign: 'center',
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
  ratingCard: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  ratingTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.semiBold,
  },
  ratingStarsRow: {
    marginTop: theme.spacing.xs,
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  starButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingFooter: {
    marginTop: theme.spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  ratingCurrentText: {
    flex: 1,
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.caption,
  },
  clearRatingButton: {
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
  },
  clearRatingButtonDisabled: {
    opacity: 0.5,
  },
  clearRatingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.caption,
    fontWeight: theme.fontWeights.medium,
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
});
