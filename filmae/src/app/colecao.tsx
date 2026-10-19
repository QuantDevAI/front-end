import { MoviePosterTile } from '@/components/movie/MoviePosterTile';
import { AppBottomNav } from '@/components/navigation/AppBottomNav';
import { collectionService } from '@/services/collection.service';
import { ratingsService } from '@/services/ratings.service';
import { theme } from '@/theme';
import type {
  CollectionFilter,
  CollectionStateKey,
  UpsertCollectionMovieRequest,
} from '@/types/collection';
import type { MovieListItem } from '@/types/movies';
import { formatRuntimeMinutes } from '@/utils/movies';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTERS: { label: string; value: CollectionFilter }[] = [
  { label: 'Tudo', value: 'all' },
  { label: 'Quero assistir', value: 'watchlist' },
  { label: 'Assistidos', value: 'watched' },
  { label: 'Favoritos', value: 'favorite' },
  { label: 'Reassistir', value: 'rewatch' },
];

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

function buildCollectionRequest(
  stateKey: CollectionStateKey,
  nextValue: boolean,
): UpsertCollectionMovieRequest {
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
}

export default function CollectionScreen() {
  const { width } = useWindowDimensions();
  const [activeFilter, setActiveFilter] = useState<CollectionFilter>('all');
  const [collection, setCollection] = useState<Awaited<
    ReturnType<typeof collectionService.getCollection>
  > | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingMovieId, setUpdatingMovieId] = useState<string | null>(null);

  const posterSize = useMemo(() => {
    const horizontalPadding = theme.spacing.xxl * 2;
    const cardWidth = Math.min(width, 520) - horizontalPadding;
    const posterWidth = Math.min(88, cardWidth * 0.26);

    return {
      height: posterWidth * 1.45,
      width: posterWidth,
    };
  }, [width]);

  const loadCollection = useCallback(async (filter: CollectionFilter, showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }

    setErrorMessage(null);

    try {
      const result = await collectionService.getCollection({ filter });
      setCollection(result);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível carregar sua coleção.';
      setErrorMessage(message);
      setCollection(null);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadCollection(activeFilter);
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [activeFilter, loadCollection]);

  const updateCollectionState = useCallback(
    async (movie: MovieListItem, stateKey: CollectionStateKey) => {
      setUpdatingMovieId(movie.id);
      setErrorMessage(null);

      try {
        await collectionService.upsertMovieCollectionState(
          movie.id,
          buildCollectionRequest(stateKey, !movie.userState[stateKey]),
        );
        await loadCollection(activeFilter, false);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Não foi possível atualizar a coleção.';
        setErrorMessage(message);
      } finally {
        setUpdatingMovieId(null);
      }
    },
    [activeFilter, loadCollection],
  );

  const updateRating = useCallback(
    async (movieId: string, rating: number) => {
      setUpdatingMovieId(movieId);
      setErrorMessage(null);

      try {
        await ratingsService.saveMovieRating(movieId, { rating });
        await loadCollection(activeFilter, false);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Não foi possível salvar a avaliação.';
        setErrorMessage(message);
      } finally {
        setUpdatingMovieId(null);
      }
    },
    [activeFilter, loadCollection],
  );

  const clearRating = useCallback(
    async (movieId: string) => {
      setUpdatingMovieId(movieId);
      setErrorMessage(null);

      try {
        await ratingsService.deleteMovieRating(movieId);
        await loadCollection(activeFilter, false);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Não foi possível remover a avaliação.';
        setErrorMessage(message);
      } finally {
        setUpdatingMovieId(null);
      }
    },
    [activeFilter, loadCollection],
  );

  const removeMovieFromCollection = useCallback(
    async (movieId: string) => {
      setUpdatingMovieId(movieId);
      setErrorMessage(null);

      try {
        await collectionService.removeMovieFromCollection(movieId);
        await loadCollection(activeFilter, false);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Não foi possível remover o filme da coleção.';
        setErrorMessage(message);
      } finally {
        setUpdatingMovieId(null);
      }
    },
    [activeFilter, loadCollection],
  );

  function openMovieDetails(movieId: string) {
    router.push({
      pathname: '/filme/[id]',
      params: { id: movieId },
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Minha coleção</Text>
            <Text style={styles.subtitle}>
              {collection?.summary.total ?? 0} filme
              {(collection?.summary.total ?? 0) === 1 ? '' : 's'} salvos
            </Text>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{collection?.summary.watchlist ?? 0}</Text>
              <Text style={styles.summaryLabel}>Quero assistir</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{collection?.summary.watched ?? 0}</Text>
              <Text style={styles.summaryLabel}>Assistidos</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{collection?.summary.favorite ?? 0}</Text>
              <Text style={styles.summaryLabel}>Favoritos</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{collection?.summary.rewatch ?? 0}</Text>
              <Text style={styles.summaryLabel}>Reassistir</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            contentContainerStyle={styles.filterRow}
            showsHorizontalScrollIndicator={false}
          >
            {FILTERS.map((filterOption) => {
              const selected = activeFilter === filterOption.value;

              return (
                <Pressable
                  key={filterOption.value}
                  accessibilityRole="button"
                  onPress={() => setActiveFilter(filterOption.value)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    selected && styles.filterChipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
                    {filterOption.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {isLoading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={styles.stateText}>Carregando sua coleção...</Text>
            </View>
          ) : collection && collection.items.length > 0 ? (
            <View style={styles.list}>
              {errorMessage ? (
                <View style={styles.warningBanner}>
                  <Text accessibilityLiveRegion="polite" style={styles.warningText}>
                    {errorMessage}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void loadCollection(activeFilter)}
                    style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.retryButtonText}>Atualizar</Text>
                  </Pressable>
                </View>
              ) : null}

              {collection.items.map((movie) => {
                const isUpdating = updatingMovieId === movie.id;

                return (
                  <View key={movie.id} style={styles.movieCard}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => openMovieDetails(movie.id)}
                      style={({ pressed }) => [styles.movieRow, pressed && styles.pressed]}
                    >
                      <MoviePosterTile
                        height={posterSize.height}
                        movie={movie}
                        onPress={() => openMovieDetails(movie.id)}
                        width={posterSize.width}
                      />

                      <View style={styles.movieText}>
                        <Text style={styles.movieTitle}>{movie.title}</Text>
                        <Text style={styles.movieMeta}>
                          {movie.year} • {formatRuntimeMinutes(movie.runtimeMinutes)}
                        </Text>
                        <Text style={styles.movieMeta}>
                          IMDb {movie.imdb.rating.toFixed(1)} • Compatibilidade{' '}
                          {movie.compatibilityScore}%
                        </Text>
                        <Text style={styles.movieMeta}>
                          Sua nota:{' '}
                          {movie.userState.rating === null
                            ? 'não avaliado'
                            : `${movie.userState.rating}/5`}
                        </Text>
                      </View>
                    </Pressable>

                    <View style={styles.toggleGrid}>
                      <Pressable
                        accessibilityRole="button"
                        disabled={isUpdating}
                        onPress={() => void updateCollectionState(movie, 'watchlist')}
                        style={({ pressed }) => [
                          styles.toggleChip,
                          movie.userState.watchlist && styles.toggleChipSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.toggleChipText,
                            movie.userState.watchlist && styles.toggleChipTextSelected,
                          ]}
                        >
                          Quero assistir
                        </Text>
                      </Pressable>

                      <Pressable
                        accessibilityRole="button"
                        disabled={isUpdating}
                        onPress={() => void updateCollectionState(movie, 'watched')}
                        style={({ pressed }) => [
                          styles.toggleChip,
                          movie.userState.watched && styles.toggleChipSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.toggleChipText,
                            movie.userState.watched && styles.toggleChipTextSelected,
                          ]}
                        >
                          Assistido
                        </Text>
                      </Pressable>

                      <Pressable
                        accessibilityRole="button"
                        disabled={isUpdating}
                        onPress={() => void updateCollectionState(movie, 'favorite')}
                        style={({ pressed }) => [
                          styles.toggleChip,
                          movie.userState.favorite && styles.toggleChipSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.toggleChipText,
                            movie.userState.favorite && styles.toggleChipTextSelected,
                          ]}
                        >
                          Favorito
                        </Text>
                      </Pressable>

                      <Pressable
                        accessibilityRole="button"
                        disabled={isUpdating}
                        onPress={() => void updateCollectionState(movie, 'rewatch')}
                        style={({ pressed }) => [
                          styles.toggleChip,
                          movie.userState.rewatch && styles.toggleChipSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.toggleChipText,
                            movie.userState.rewatch && styles.toggleChipTextSelected,
                          ]}
                        >
                          Reassistir
                        </Text>
                      </Pressable>
                    </View>

                    <View style={styles.ratingRow}>
                      {STAR_VALUES.map((value) => (
                        <Pressable
                          key={value}
                          accessibilityRole="button"
                          disabled={isUpdating}
                          onPress={() => void updateRating(movie.id, value)}
                          style={({ pressed }) => [styles.starButton, pressed && styles.pressed]}
                        >
                          <MaterialIcons
                            color={
                              movie.userState.rating !== null && movie.userState.rating >= value
                                ? theme.colors.rating
                                : theme.colors.prototypeMuted
                            }
                            name="star"
                            size={18}
                          />
                        </Pressable>
                      ))}

                      <Pressable
                        accessibilityRole="button"
                        disabled={isUpdating || movie.userState.rating === null}
                        onPress={() => void clearRating(movie.id)}
                        style={({ pressed }) => [
                          styles.clearRatingButton,
                          pressed && styles.pressed,
                          (isUpdating || movie.userState.rating === null) && styles.disabledAction,
                        ]}
                      >
                        <Text style={styles.clearRatingText}>Limpar nota</Text>
                      </Pressable>
                    </View>

                    <View style={styles.footerRow}>
                      <Pressable
                        accessibilityRole="button"
                        disabled={isUpdating}
                        onPress={() => void removeMovieFromCollection(movie.id)}
                        style={({ pressed }) => [
                          styles.removeButton,
                          pressed && styles.pressed,
                          isUpdating && styles.disabledAction,
                        ]}
                      >
                        <Text style={styles.removeButtonText}>Remover da coleção</Text>
                      </Pressable>

                      {isUpdating ? (
                        <ActivityIndicator color={theme.colors.primary} size="small" />
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              {errorMessage ? (
                <View style={styles.warningBanner}>
                  <Text accessibilityLiveRegion="polite" style={styles.warningText}>
                    {errorMessage}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void loadCollection(activeFilter)}
                    style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.retryButtonText}>Atualizar</Text>
                  </Pressable>
                </View>
              ) : null}

              <MaterialIcons color={theme.colors.creamMuted} name="local-movies" size={28} />
              <Text style={styles.emptyTitle}>Sua coleção está vazia</Text>
              <Text style={styles.emptyText}>
                Adicione filmes em Descobrir ou no detalhe para começar a organizar sua jornada.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace('/descobrir')}
                style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
              >
                <Text style={styles.retryButtonText}>Ir para Descobrir</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        <AppBottomNav activeTab="collection" />
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
  header: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: theme.fontWeights.bold,
  },
  subtitle: {
    marginTop: 2,
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.body,
  },
  summaryGrid: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  summaryCard: {
    minWidth: '47%',
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  summaryNumber: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: theme.fontWeights.bold,
  },
  summaryLabel: {
    marginTop: 2,
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
  },
  filterRow: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  filterChip: {
    height: 34,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  filterChipSelected: {
    borderColor: theme.colors.primaryTransparent,
    backgroundColor: theme.colors.primaryTransparent,
  },
  filterChipText: {
    color: theme.colors.prototypeMuted,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.medium,
  },
  filterChipTextSelected: {
    color: theme.colors.primary,
  },
  stateContainer: {
    paddingTop: 72,
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
    height: 44,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  retryButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  list: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  movieCard: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  movieRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  movieText: {
    flex: 1,
    justifyContent: 'center',
  },
  movieTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  movieMeta: {
    marginTop: 2,
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
  },
  toggleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  toggleChip: {
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  toggleChipSelected: {
    borderColor: theme.colors.primaryTransparent,
    backgroundColor: theme.colors.primaryTransparent,
  },
  toggleChipText: {
    color: theme.colors.prototypeMuted,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.medium,
  },
  toggleChipTextSelected: {
    color: theme.colors.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearRatingButton: {
    marginLeft: theme.spacing.sm,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
  },
  clearRatingText: {
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeButton: {
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  removeButtonText: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.medium,
  },
  emptyState: {
    marginTop: 72,
    paddingHorizontal: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: theme.fontWeights.semiBold,
  },
  emptyText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.body,
    lineHeight: 20,
    textAlign: 'center',
  },
  warningBanner: {
    width: '100%',
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 114, 0.45)',
    backgroundColor: 'rgba(255, 107, 114, 0.1)',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  warningText: {
    color: theme.colors.cream,
    fontSize: theme.fontSizes.small,
    lineHeight: 18,
    textAlign: 'center',
  },
  disabledAction: {
    opacity: 0.5,
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
});
