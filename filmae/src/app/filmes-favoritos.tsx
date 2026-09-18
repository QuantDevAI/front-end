import { MoviePosterCard } from '@/components/movie/MoviePosterCard';
import { useRegistration } from '@/context/RegistrationContext';
import { MOVIES } from '@/data/preferences';
import { theme } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GRID_COLUMNS = 3;
const GRID_GAP = 10;
const HORIZONTAL_PADDING = 24;

export default function FavoriteMoviesScreen() {
  const { width } = useWindowDimensions();
  const { favoriteMovieIds, saveFavoriteMovies } = useRegistration();
  const [selectedIds, setSelectedIds] = useState(() => new Set(favoriteMovieIds));
  const [search, setSearch] = useState('');

  const filteredMovies = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');

    if (!normalizedSearch) {
      return MOVIES;
    }

    return MOVIES.filter((movie) =>
      movie.title.toLocaleLowerCase('pt-BR').includes(normalizedSearch),
    );
  }, [search]);

  const posterSize = useMemo(() => {
    const availableWidth = Math.min(width, 520) - HORIZONTAL_PADDING * 2;
    const posterWidth = (availableWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

    return {
      height: posterWidth * 1.5,
      width: posterWidth,
    };
  }, [width]);

  function toggleMovie(movieId: string) {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(movieId)) {
        nextIds.delete(movieId);
      } else {
        nextIds.add(movieId);
      }

      return nextIds;
    });
  }

  function handleBack() {
    saveFavoriteMovies(Array.from(selectedIds));
    router.back();
  }

  function handleSkip() {
    saveFavoriteMovies([]);
    router.push('/perfil-cinefilo');
  }

  function handleContinue() {
    saveFavoriteMovies(Array.from(selectedIds));
    router.push('/perfil-cinefilo');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.contentLimit}>
        <View style={styles.header}>
          <View style={styles.navigationRow}>
            <Pressable
              accessibilityLabel="Voltar para as preferências de gênero"
              accessibilityRole="button"
              onPress={handleBack}
              hitSlop={10}
            >
              <Text style={styles.navigationText}>← Voltar</Text>
            </Pressable>

            <Pressable accessibilityRole="button" onPress={handleSkip} hitSlop={10}>
              <Text style={styles.navigationText}>Deixar para depois</Text>
            </Pressable>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, styles.progressBarActive]} />
            <View style={[styles.progressBar, styles.progressBarActive]} />
            <View style={styles.progressBar} />
          </View>

          <Text style={styles.step}>Passo 2 de 3</Text>
          <Text style={styles.title}>Quais filmes você ama?</Text>
          <Text style={styles.subtitle}>Selecione seus favoritos</Text>

          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={18} color={theme.colors.prototypeMuted} />

            <TextInput
              accessibilityLabel="Buscar filmes"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setSearch}
              placeholder="Buscar filmes..."
              placeholderTextColor={theme.colors.placeholder}
              returnKeyType="search"
              style={styles.searchInput}
              value={search}
            />
          </View>
        </View>

        <FlatList
          columnWrapperStyle={styles.movieRow}
          contentContainerStyle={styles.movieList}
          data={filteredMovies}
          keyExtractor={(movie) => movie.id}
          keyboardShouldPersistTaps="handled"
          numColumns={GRID_COLUMNS}
          renderItem={({ item }) => (
            <MoviePosterCard
              height={posterSize.height}
              movie={item}
              onPress={() => toggleMovie(item.id)}
              selected={selectedIds.has(item.id)}
              width={posterSize.width}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Nenhum filme encontrado</Text>
              <Text style={styles.emptyText}>Tente buscar por outro título.</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={handleContinue}
            style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}
          >
            <Text style={styles.continueButtonText}>
              {selectedIds.size > 0 ? `Continuar (${selectedIds.size})` : 'Continuar'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.warmBackground,
  },
  contentLimit: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  navigationText: {
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.medium,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xxl,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.prototypeBorder,
  },
  progressBarActive: {
    backgroundColor: theme.colors.primary,
  },
  step: {
    color: theme.colors.prototypeMuted,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.medium,
    marginBottom: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: theme.fontWeights.bold,
    lineHeight: 30,
  },
  subtitle: {
    color: theme.colors.prototypeMuted,
    fontSize: theme.fontSizes.body,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  searchContainer: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    marginLeft: theme.spacing.sm,
  },
  movieList: {
    flexGrow: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: theme.spacing.lg,
  },
  movieRow: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  emptyText: {
    color: theme.colors.prototypeMuted,
    fontSize: theme.fontSizes.small,
    marginTop: theme.spacing.xs,
  },
  footer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  continueButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.primary,
  },
  continueButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.input,
    fontWeight: theme.fontWeights.semiBold,
  },
  pressed: {
    opacity: theme.opacity.pressed,
    transform: [{ scale: 0.98 }],
  },
});