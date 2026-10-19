import { AppBottomNav } from '@/components/navigation/AppBottomNav';
import { moviesService } from '@/services/movies.service';
import { theme } from '@/theme';
import type { MovieListItem } from '@/types/movies';
import { formatRuntimeMinutes } from '@/utils/movies';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SEARCH_DEBOUNCE_MS = 260;

function buildStateText(query: string, isSearching: boolean, count: number) {
  if (isSearching) {
    return 'Buscando filmes...';
  }

  if (query.trim().length > 0) {
    return count ? `${count} resultado(s) encontrado(s)` : 'Nenhum filme encontrado.';
  }

  return count ? 'Sugestões para registrar' : 'Nenhum filme sugerido no momento.';
}

export default function AddMovieScreen() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingFirstSearch, setIsLoadingFirstSearch] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [query, setQuery] = useState('');
  const requestSequenceRef = useRef(0);

  const runSearch = useCallback(
    async (rawQuery: string) => {
      const currentRequest = requestSequenceRef.current + 1;
      requestSequenceRef.current = currentRequest;
      const normalizedQuery = rawQuery.trim();

      if (!isLoadingFirstSearch) {
        setIsSearching(true);
      }

      setErrorMessage(null);

      try {
        const result = await moviesService.searchMovies(
          normalizedQuery
            ? {
                page: 0,
                q: normalizedQuery,
                size: 20,
              }
            : {
                page: 0,
                size: 8,
              },
        );

        if (requestSequenceRef.current !== currentRequest) {
          return;
        }

        setMovies(result.data);
      } catch (error: unknown) {
        if (requestSequenceRef.current !== currentRequest) {
          return;
        }

        const message =
          error instanceof Error ? error.message : 'Não foi possível carregar os filmes.';
        setErrorMessage(message);
        setMovies([]);
      } finally {
        if (requestSequenceRef.current !== currentRequest) {
          return;
        }

        setIsLoadingFirstSearch(false);
        setIsSearching(false);
      }
    },
    [isLoadingFirstSearch],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void runSearch(query);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [query, runSearch]);

  function openRating(movieId: string) {
    router.push({
      pathname: '/avaliar-filme/[id]',
      params: { id: movieId },
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Voltar para início"
            accessibilityRole="button"
            onPress={() => router.replace('/home')}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <MaterialIcons color={theme.colors.creamMuted} name="arrow-back" size={20} />
          </Pressable>

          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle}>O que você assistiu?</Text>
            <Text style={styles.headerSubtitle}>Registre um filme no seu histórico</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons color={theme.colors.prototypeMuted} name="search" size={18} />
          <TextInput
            accessibilityLabel="Buscar filme para avaliar"
            autoCapitalize="sentences"
            autoCorrect={false}
            onChangeText={setQuery}
            placeholder="Buscar filme..."
            placeholderTextColor={theme.colors.placeholder}
            style={styles.searchInput}
            value={query}
          />
        </View>

        {isLoadingFirstSearch ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={styles.stateText}>Carregando catálogo...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {errorMessage ? (
              <View style={styles.warningBanner}>
                <Text accessibilityLiveRegion="polite" style={styles.warningText}>
                  {errorMessage}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void runSearch(query)}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
                >
                  <Text style={styles.retryButtonText}>Atualizar</Text>
                </Pressable>
              </View>
            ) : null}

            <Text style={styles.listCaption}>
              {buildStateText(query, isSearching, movies.length)}
            </Text>

            {!movies.length && !isSearching ? (
              <View style={styles.emptyCard}>
                <MaterialIcons color={theme.colors.creamMuted} name="movie-filter" size={28} />
                <Text style={styles.emptyTitle}>Nenhum filme encontrado</Text>
                <Text style={styles.emptySubtitle}>
                  {errorMessage
                    ? 'Dados indisponíveis no momento. Tente novamente em instantes.'
                    : 'Tente outro título para continuar.'}
                </Text>
              </View>
            ) : (
              movies.map((movie) => (
                <Pressable
                  key={movie.id}
                  accessibilityRole="button"
                  onPress={() => openRating(movie.id)}
                  style={({ pressed }) => [styles.movieCard, pressed && styles.pressed]}
                >
                  <LinearGradient colors={movie.gradientColors} style={styles.poster}>
                    <Text style={styles.posterLetter}>{movie.title.charAt(0)}</Text>
                  </LinearGradient>

                  <View style={styles.movieTextContainer}>
                    <Text numberOfLines={1} style={styles.movieTitle}>
                      {movie.title}
                    </Text>
                    <Text style={styles.movieMeta}>
                      {movie.year} • {movie.director}
                    </Text>
                    <Text style={styles.movieMeta}>
                      {formatRuntimeMinutes(movie.runtimeMinutes)} • IMDb{' '}
                      {movie.imdb.rating.toFixed(1)}
                    </Text>
                  </View>

                  <MaterialIcons color={theme.colors.creamMuted} name="chevron-right" size={20} />
                </Pressable>
              ))
            )}
          </ScrollView>
        )}

        <AppBottomNav activeTab="add-movie" />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.warmSurface,
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: theme.fontWeights.bold,
  },
  headerSubtitle: {
    marginTop: 2,
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
  },
  searchContainer: {
    marginHorizontal: theme.spacing.xxl,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    height: 48,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    paddingVertical: 0,
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
    textAlign: 'center',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.body,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    height: 44,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.warmSurface,
  },
  retryButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  warningBanner: {
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
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  listCaption: {
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
    marginBottom: theme.spacing.xs,
  },
  emptyCard: {
    marginTop: theme.spacing.lg,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  emptyTitle: {
    marginTop: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  emptySubtitle: {
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
    textAlign: 'center',
  },
  movieCard: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
    padding: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  poster: {
    width: 46,
    height: 66,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterLetter: {
    color: theme.colors.text,
    opacity: 0.3,
    fontSize: 22,
    fontWeight: theme.fontWeights.extraBold,
  },
  movieTextContainer: {
    flex: 1,
    gap: 1,
  },
  movieTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  movieMeta: {
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
});
