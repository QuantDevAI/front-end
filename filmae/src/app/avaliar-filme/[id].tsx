import { AppBottomNav } from '@/components/navigation/AppBottomNav';
import { VoiceNoteRecorder } from '@/components/voice-note/VoiceNoteRecorder'; // novo
import { collectionService } from '@/services/collection.service';
import { moviesService } from '@/services/movies.service';
import { ratingsService } from '@/services/ratings.service';
import { getVoiceNoteUri, removeVoiceNote, saveVoiceNote } from '@/services/voice-note.service'; // novo
import { theme } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RATING_LABELS = ['', 'Horrível', 'Ruim', 'Mediano', 'Bom', 'Excelente'];

export default function RateMovieScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const movieId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [movie, setMovie] = useState<Awaited<
    ReturnType<typeof moviesService.getMovieDetails>
  > | null>(null);
  const [rating, setRating] = useState(0);
  const [rewatch, setRewatch] = useState(false);
  const [saved, setSaved] = useState(false);
  const [voiceNoteUri, setVoiceNoteUri] = useState<string | null>(null);

  const loadMovie = useCallback(async () => {
    if (!movieId) {
      setLoadErrorMessage('Nenhum filme foi informado para avaliação.');
      setIsLoading(false);
      return;
    }

    setLoadErrorMessage(null);
    setActionErrorMessage(null);
    setIsLoading(true);

    try {
      const [details, collectionState] = await Promise.all([
        moviesService.getMovieDetails(movieId),
        collectionService.getMovieCollectionState(movieId),
      ]);

      setMovie(details);
      setRating(collectionState.movie.userState.rating ?? 0);
      setFavorite(collectionState.movie.userState.favorite);
      setRewatch(collectionState.movie.userState.rewatch);
      setVoiceNoteUri(getVoiceNoteUri(movieId));
      setSaved(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível carregar este filme.';
      setLoadErrorMessage(message);
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

  const saveRating = useCallback(async () => {
    if (!movieId || !movie || !rating) {
      return;
    }

    setActionErrorMessage(null);
    setIsSaving(true);

    try {
      const ratingResult = await ratingsService.saveMovieRating(movieId, { rating });

      await collectionService.upsertMovieCollectionState(movieId, {
        favorite,
        rewatch,
        watched: true,
        watchlist: false,
      });

      try {
        if (voiceNoteUri === null) {
          removeVoiceNote(movieId);
        } else if (voiceNoteUri !== getVoiceNoteUri(movieId)) {
          await saveVoiceNote(movieId, voiceNoteUri);
        }
      } catch {
        // O áudio é opcional: se falhar, a avaliação continua salva.
      }

      setMovie((currentMovie) => {
        if (!currentMovie) {
          return currentMovie;
        }

        return {
          ...currentMovie,
          userState: ratingResult.movie.userState,
        };
      });

      setSaved(true);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível salvar sua avaliação.';
      setActionErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }, [favorite, movie, movieId, rating, rewatch, voiceNoteUri]);

  if (saved && movie) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.centerState}>
            <View style={styles.successIcon}>
              <MaterialIcons color={theme.colors.text} name="check" size={28} />
            </View>
            <Text style={styles.successTitle}>Avaliação salva!</Text>
            <Text style={styles.successSubtitle}>
              Registramos {rating}/5 para {movie.title}. O Pipocai vai usar isso nas próximas
              sugestões.
            </Text>

            <View style={styles.successCard}>
              <LinearGradient colors={movie.gradientColors} style={styles.successPoster}>
                <Text style={styles.posterLetter}>{movie.title.charAt(0)}</Text>
              </LinearGradient>
              <View style={styles.successMovieText}>
                <Text style={styles.movieTitle}>{movie.title}</Text>
                <Text style={styles.movieMeta}>
                  {movie.year} • {movie.director}
                </Text>
              </View>
            </View>

            <View style={styles.successActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace('/home')}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.primaryButtonText}>Ir para a Home</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace('/colecao')}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryButtonText}>Ver coleção</Text>
              </Pressable>
            </View>
          </View>

          <AppBottomNav activeTab="add-movie" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={styles.stateText}>Carregando filme...</Text>
          </View>
        ) : movie ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Pressable
                accessibilityLabel="Voltar para adicionar filme"
                accessibilityRole="button"
                onPress={() => router.replace('/adicionar-filme')}
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              >
                <MaterialIcons color={theme.colors.creamMuted} name="arrow-back" size={20} />
              </Pressable>
              <Text style={styles.headerTitle}>Avaliar filme</Text>
            </View>

            <View style={styles.movieCard}>
              <LinearGradient colors={movie.gradientColors} style={styles.poster}>
                <Text style={styles.posterLetter}>{movie.title.charAt(0)}</Text>
              </LinearGradient>

              <View style={styles.movieTextContainer}>
                <Text style={styles.movieTitle}>{movie.title}</Text>
                <Text style={styles.movieMeta}>
                  {movie.year} • {movie.director}
                </Text>
              </View>
            </View>

            <View style={styles.ratingBlock}>
              <Text style={styles.sectionTitle}>Como foi?</Text>
              <View style={styles.starsRow}>
                {Array.from({ length: 5 }, (_, index) => {
                  const starValue = index + 1;

                  return (
                    <Pressable
                      key={starValue}
                      accessibilityLabel={`Dar nota ${starValue} para o filme`}
                      accessibilityRole="button"
                      onPress={() => setRating(starValue)}
                      style={({ pressed }) => pressed && styles.pressed}
                    >
                      <MaterialIcons
                        color={starValue <= rating ? theme.colors.rating : theme.colors.border}
                        name={starValue <= rating ? 'star' : 'star-outline'}
                        size={36}
                      />
                    </Pressable>
                  );
                })}
              </View>
              {rating ? <Text style={styles.ratingLabel}>{RATING_LABELS[rating]}</Text> : null}
            </View>

            <View style={styles.toggleBlock}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleText}>
                  <Text style={styles.toggleTitle}>Favoritar</Text>
                  <Text style={styles.toggleSubtitle}>Adicionar aos favoritos</Text>
                </View>
                <Pressable
                  accessibilityRole="switch"
                  accessibilityState={{ checked: favorite }}
                  onPress={() => setFavorite((currentValue) => !currentValue)}
                  style={[styles.switch, favorite && styles.switchActive]}
                >
                  <View style={[styles.switchThumb, favorite && styles.switchThumbActive]} />
                </Pressable>
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleText}>
                  <Text style={styles.toggleTitle}>Quero rever</Text>
                  <Text style={styles.toggleSubtitle}>Marcar para reassistir depois</Text>
                </View>
                <Pressable
                  accessibilityRole="switch"
                  accessibilityState={{ checked: rewatch }}
                  onPress={() => setRewatch((currentValue) => !currentValue)}
                  style={[styles.switch, rewatch && styles.switchActive]}
                >
                  <View style={[styles.switchThumb, rewatch && styles.switchThumbActive]} />
                </Pressable>
              </View>
            </View>

            <View style={styles.toggleBlock}>
              <View>
                <Text style={styles.toggleTitle}>Comentário em áudio</Text>
                <Text style={styles.toggleSubtitle}>
                  Grave o que você achou do filme (opcional)
                </Text>
              </View>
              <VoiceNoteRecorder onChange={setVoiceNoteUri} uri={voiceNoteUri} />
            </View>

            {actionErrorMessage ? <Text style={styles.errorText}>{actionErrorMessage}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={!rating || isSaving}
              onPress={() => void saveRating()}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.pressed,
                (!rating || isSaving) && styles.disabledButton,
              ]}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Salvando...' : 'Salvar avaliação'}
              </Text>
            </Pressable>
          </ScrollView>
        ) : (
          <View style={styles.centerState}>
            <Text accessibilityLiveRegion="polite" style={styles.stateText}>
              {loadErrorMessage ?? 'Sem filme para avaliar.'}
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
  scrollContent: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: theme.fontWeights.bold,
  },
  movieCard: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  poster: {
    width: 62,
    height: 92,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterLetter: {
    color: theme.colors.text,
    opacity: 0.3,
    fontSize: 28,
    fontWeight: theme.fontWeights.extraBold,
  },
  movieTextContainer: {
    flex: 1,
    gap: 2,
  },
  movieTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: theme.fontWeights.bold,
  },
  movieMeta: {
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
  },
  ratingBlock: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  sectionTitle: {
    alignSelf: 'flex-start',
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
    marginBottom: theme.spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  ratingLabel: {
    marginTop: theme.spacing.sm,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  toggleBlock: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  toggleSubtitle: {
    marginTop: 2,
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
  },
  switch: {
    width: 48,
    height: 28,
    borderRadius: theme.radii.round,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 3,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: theme.colors.primary,
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.text,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  saveButton: {
    marginTop: theme.spacing.sm,
    height: 48,
    borderRadius: theme.radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.bold,
  },
  disabledButton: {
    opacity: 0.45,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.bodySmall,
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
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: theme.radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.success,
  },
  successTitle: {
    marginTop: theme.spacing.lg,
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: theme.fontWeights.bold,
  },
  successSubtitle: {
    marginTop: theme.spacing.sm,
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.body,
    textAlign: 'center',
    lineHeight: 20,
  },
  successCard: {
    marginTop: theme.spacing.lg,
    width: '100%',
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  successPoster: {
    width: 48,
    height: 70,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successMovieText: {
    flex: 1,
  },
  successActions: {
    marginTop: theme.spacing.xl,
    width: '100%',
    gap: theme.spacing.sm,
  },
  primaryButton: {
    height: 48,
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
    height: 48,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.warmSurface,
  },
  secondaryButtonText: {
    color: theme.colors.cream,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
});
