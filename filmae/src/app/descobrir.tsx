import { MoviePosterTile } from '@/components/movie/MoviePosterTile';
import { AppBottomNav } from '@/components/navigation/AppBottomNav';
import { moviesService } from '@/services/movies.service';
import { theme } from '@/theme';
import type { GenreCatalogItem, MovieListItem } from '@/types/movies';
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
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTERS = ['Gênero', 'Ano', 'Duração', 'Nota', 'Diretor'] as const;

export default function DiscoverScreen() {
  const { width } = useWindowDimensions();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [genres, setGenres] = useState<GenreCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [search, setSearch] = useState('');

  const posterSize = useMemo(() => {
    const horizontalPadding = theme.spacing.xxl * 2;
    const cardWidth = (Math.min(width, 520) - horizontalPadding - theme.spacing.sm * 2) / 3;

    return {
      height: cardWidth * 1.45,
      width: cardWidth,
    };
  }, [width]);

  const searchMovies = useCallback(async (query: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [genresResult, moviesResult] = await Promise.all([
        moviesService.getGenres(),
        moviesService.searchMovies({ q: query, size: 20 }),
      ]);

      setGenres(genresResult);
      setMovies(moviesResult.data);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível carregar dados do catálogo.';
      setErrorMessage(message);
      setGenres([]);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void searchMovies(search);
    }, 200);

    return () => {
      clearTimeout(timeout);
    };
  }, [search, searchMovies]);

  function openMovieDetails(movieId: string) {
    router.push({
      pathname: '/filme/[id]',
      params: { id: movieId },
    });
  }

  const highlightedMovies = movies.slice(0, 5);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Descobrir</Text>

            <View style={styles.searchContainer}>
              <MaterialIcons color={theme.colors.prototypeMuted} name="search" size={18} />
              <TextInput
                accessibilityLabel="Buscar filmes, atores ou diretores"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setSearch}
                placeholder="Filmes, atores ou diretores..."
                placeholderTextColor={theme.colors.prototypeMuted}
                style={styles.searchInput}
                value={search}
              />
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {FILTERS.map((filter) => {
              const selected = activeFilter === filter;

              return (
                <Pressable
                  key={filter}
                  accessibilityRole="button"
                  onPress={() => setActiveFilter(selected ? null : filter)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    selected && styles.filterChipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
                    {filter}
                  </Text>
                  <MaterialIcons
                    color={selected ? theme.colors.primary : theme.colors.prototypeMuted}
                    name="keyboard-arrow-down"
                    size={16}
                  />
                </Pressable>
              );
            })}
          </ScrollView>

          {isLoading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={styles.stateText}>Carregando catálogo...</Text>
            </View>
          ) : (
            <>
              {errorMessage ? (
                <View style={styles.warningBanner}>
                  <Text accessibilityLiveRegion="polite" style={styles.warningText}>
                    {errorMessage}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void searchMovies(search)}
                    style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.retryButtonText}>Atualizar</Text>
                  </Pressable>
                </View>
              ) : null}

              {!search.trim() ? (
                <>
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Em alta</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.posterRow}
                    >
                      {highlightedMovies.length ? (
                        highlightedMovies.map((movie) => (
                          <MoviePosterTile
                            key={movie.id}
                            height={posterSize.height}
                            movie={movie}
                            onPress={() => openMovieDetails(movie.id)}
                            showCompatibility
                            width={posterSize.width}
                          />
                        ))
                      ) : (
                        <View style={styles.unavailableInlineCard}>
                          <Text style={styles.unavailableText}>
                            Dados de catálogo indisponíveis.
                          </Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Explorar por gênero</Text>
                    <View style={styles.genreWrap}>
                      {genres.length ? (
                        genres.slice(0, 10).map((genre) => (
                          <View key={genre.id} style={styles.genreChip}>
                            <Text style={styles.genreChipText}>{genre.name}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.unavailableText}>
                          Gêneros indisponíveis no momento.
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Todos os filmes</Text>
                    <View style={styles.grid}>
                      {movies.length ? (
                        movies.map((movie) => (
                          <MoviePosterTile
                            key={movie.id}
                            height={posterSize.height}
                            movie={movie}
                            onPress={() => openMovieDetails(movie.id)}
                            showCompatibility
                            width={posterSize.width}
                          />
                        ))
                      ) : (
                        <Text style={styles.unavailableText}>Sem dados de filmes disponíveis.</Text>
                      )}
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.section}>
                  <Text style={styles.resultCount}>
                    {movies.length} resultado{movies.length === 1 ? '' : 's'}
                  </Text>

                  {movies.length ? (
                    <View style={styles.resultList}>
                      {movies.map((movie) => (
                        <Pressable
                          key={movie.id}
                          accessibilityRole="button"
                          onPress={() => openMovieDetails(movie.id)}
                          style={({ pressed }) => [styles.resultItem, pressed && styles.pressed]}
                        >
                          <MoviePosterTile
                            height={96}
                            movie={movie}
                            onPress={() => openMovieDetails(movie.id)}
                            width={64}
                          />

                          <View style={styles.resultText}>
                            <Text style={styles.resultTitle}>{movie.title}</Text>
                            <Text style={styles.resultMeta}>
                              {movie.year} • {movie.director}
                            </Text>
                            <Text style={styles.resultMeta}>
                              {formatRuntimeMinutes(movie.runtimeMinutes)} • IMDb{' '}
                              {movie.imdb.rating.toFixed(1)}
                            </Text>
                            <Text style={styles.resultCompatibility}>
                              {movie.compatibilityScore}% para você
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.unavailableInlineCard}>
                      <Text style={styles.unavailableText}>
                        Nenhum resultado disponível para esta busca agora.
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>

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
  header: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: theme.fontWeights.bold,
    marginBottom: theme.spacing.md,
  },
  searchContainer: {
    height: 52,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
  },
  filterRow: {
    paddingHorizontal: theme.spacing.xxl,
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  filterChip: {
    height: 34,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
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
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.body,
  },
  retryButton: {
    height: 42,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  retryButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: theme.fontWeights.semiBold,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
  },
  posterRow: {
    paddingHorizontal: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  genreWrap: {
    paddingHorizontal: theme.spacing.xxl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  genreChip: {
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  genreChipText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.medium,
  },
  grid: {
    paddingHorizontal: theme.spacing.xxl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  resultCount: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.body,
    paddingHorizontal: theme.spacing.xxl,
    marginBottom: theme.spacing.md,
  },
  resultList: {
    paddingHorizontal: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  resultItem: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
    padding: theme.spacing.sm,
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  resultText: {
    flex: 1,
    justifyContent: 'center',
  },
  resultTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  resultMeta: {
    marginTop: 2,
    color: theme.colors.prototypeMuted,
    fontSize: theme.fontSizes.small,
  },
  resultCompatibility: {
    marginTop: theme.spacing.xs,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.semiBold,
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
  warningBanner: {
    marginHorizontal: theme.spacing.xxl,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 114, 0.45)',
    backgroundColor: 'rgba(255, 107, 114, 0.1)',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  warningText: {
    color: theme.colors.cream,
    fontSize: theme.fontSizes.small,
    lineHeight: 18,
  },
  unavailableInlineCard: {
    minWidth: 220,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    justifyContent: 'center',
  },
  unavailableText: {
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
    lineHeight: 18,
  },
});
