import { MoviePosterTile } from '@/components/movie/MoviePosterTile';
import { AppBottomNav } from '@/components/navigation/AppBottomNav';
import { homeService } from '@/services/home.service';
import { theme } from '@/theme';
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
import { useProfilePhoto } from '@/hooks/useProfilePhoto';
import { Image } from 'expo-image';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [homeData, setHomeData] = useState<Awaited<ReturnType<typeof homeService.getHome>> | null>(
    null,
  );
  const userName = homeData?.user.name?.trim() || 'Cinéfilo';
  const photoUri = useProfilePhoto(homeData?.user.id);

  const posterSize = useMemo(() => {
    const horizontalPadding = theme.spacing.xxl * 2;
    const cardWidth = (Math.min(width, 520) - horizontalPadding) * 0.34;

    return {
      height: cardWidth * 1.45,
      width: cardWidth,
    };
  }, [width]);

  const loadHome = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await homeService.getHome();
      setHomeData(result);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os dados da Home agora.';
      setErrorMessage(message);
      setHomeData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  function openMovieDetails(movieId: string) {
    router.push({
      pathname: '/filme/[id]',
      params: { id: movieId },
    });
  }

  function openCollection() {
    router.push('/colecao');
  }

  function openNotifications() {
    router.push('/notificacoes');
  }

  function openProfile() {
    router.push('/perfil');
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadHome();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadHome]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={styles.stateText}>Montando sua sessão de hoje...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {errorMessage ? (
              <View style={styles.warningBanner}>
                <Text accessibilityLiveRegion="polite" style={styles.warningText}>
                  {errorMessage}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void loadHome()}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
                >
                  <Text style={styles.retryButtonText}>Atualizar</Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Boa noite, {userName} 👋</Text>
                <Text style={styles.headerTitle}>Qual é a sessão de hoje?</Text>
              </View>

              <View style={styles.headerActions}>
                <Pressable
                  accessibilityLabel="Abrir notificações"
                  accessibilityRole="button"
                  onPress={openNotifications}
                  style={({ pressed }) => [styles.notificationBadge, pressed && styles.pressed]}
                >
                  <MaterialIcons
                    color={theme.colors.creamMuted}
                    name="notifications-none"
                    size={21}
                  />
                  {(homeData?.unreadNotifications ?? 0) > 0 ? (
                    <View style={styles.unreadDot} />
                  ) : null}
                </Pressable>

                <Pressable
                  accessibilityLabel="Abrir perfil"
                  accessibilityRole="button"
                  onPress={openProfile}
                  style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}
                >
                  {photoUri ? (
                    <Image
                      contentFit="cover"
                      source={{ uri: photoUri }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
                  )}
                </Pressable>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sua escolha de hoje</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/filme-do-dia')}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Text style={styles.sectionAction}>Ver análise</Text>
                </Pressable>
              </View>

              {homeData?.dailyMovie ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => openMovieDetails(homeData.dailyMovie.id)}
                  style={({ pressed }) => [styles.dailyCard, pressed && styles.pressed]}
                >
                  <MoviePosterTile
                    height={140}
                    movie={homeData.dailyMovie}
                    onPress={() => openMovieDetails(homeData.dailyMovie.id)}
                    width={95}
                  />

                  <View style={styles.dailyTextContent}>
                    <Text style={styles.compatibilityBadge}>
                      {homeData.dailyMovie.compatibilityScore}% a sua cara
                    </Text>
                    <Text style={styles.dailyTitle}>{homeData.dailyMovie.title}</Text>
                    <Text style={styles.dailyMeta}>
                      {homeData.dailyMovie.year} •{' '}
                      {formatRuntimeMinutes(homeData.dailyMovie.runtimeMinutes)}
                    </Text>
                    <Text style={styles.dailyReason}>{homeData.dailyMovie.reason}</Text>
                  </View>
                </Pressable>
              ) : (
                <View style={styles.unavailableCard}>
                  <Text style={styles.unavailableTitle}>Filme do dia indisponível</Text>
                  <Text style={styles.unavailableText}>
                    Não recebemos recomendação agora. Tente novamente em instantes.
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>Porque você curtiu Interestelar</Text>
                  <Text style={styles.sectionSubtitle}>
                    Sem repetir sempre as mesmas sugestões.
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/descobrir')}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Text style={styles.sectionAction}>Ver tudo</Text>
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.posterRow}
              >
                {homeData?.recommendations.length ? (
                  homeData.recommendations.map((movie) => (
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
                      Recomendações indisponíveis no momento.
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Pressable
                accessibilityLabel="Abrir minha coleção"
                accessibilityRole="button"
                onPress={openCollection}
                style={({ pressed }) => [styles.collectionCard, pressed && styles.pressed]}
              >
                <MaterialIcons color={theme.colors.creamMuted} name="local-movies" size={28} />
                <View style={styles.collectionText}>
                  <Text style={styles.collectionTitle}>Minha coleção</Text>
                  <Text style={styles.collectionSubtitle}>
                    Quero assistir {homeData?.collectionSummary.watchlist ?? 0} • Assistidos{' '}
                    {homeData?.collectionSummary.watched ?? 0}
                  </Text>
                </View>
                <MaterialIcons color={theme.colors.creamMuted} name="chevron-right" size={20} />
              </Pressable>
            </View>
          </ScrollView>
        )}

        <AppBottomNav activeTab="home" />
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
    textAlign: 'center',
  },
  retryButton: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
  },
  greeting: {
    color: '#A99A92',
    fontSize: theme.fontSizes.body,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: theme.fontWeights.bold,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  notificationBadge: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.warmSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primary,
    top: 10,
    right: 10,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.cream,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: '#72090E',
    fontSize: 16,
    fontWeight: theme.fontWeights.bold,
  },
  section: {
    marginTop: theme.spacing.xl,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.xxl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: theme.fontWeights.semiBold,
  },
  sectionSubtitle: {
    marginTop: 2,
    color: '#8D817B',
    fontSize: theme.fontSizes.small,
  },
  sectionAction: {
    color: '#E95A61',
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.semiBold,
  },
  dailyCard: {
    marginHorizontal: theme.spacing.xxl,
    borderRadius: theme.radii.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255,244,220,0.12)',
    backgroundColor: theme.colors.warmSurface,
    padding: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  dailyTextContent: {
    flex: 1,
    justifyContent: 'center',
  },
  compatibilityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.cream,
    color: '#72090E',
    fontSize: theme.fontSizes.caption,
    fontWeight: theme.fontWeights.bold,
  },
  dailyTitle: {
    marginTop: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: theme.fontWeights.bold,
  },
  dailyMeta: {
    marginTop: 2,
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
  },
  dailyReason: {
    marginTop: theme.spacing.sm,
    color: '#F7E7C6',
    fontSize: theme.fontSizes.small,
    lineHeight: 18,
  },
  posterRow: {
    paddingHorizontal: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  collectionCard: {
    marginHorizontal: theme.spacing.xxl,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,244,220,0.10)',
    backgroundColor: theme.colors.warmSurface,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  collectionText: {
    flex: 1,
  },
  collectionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  collectionSubtitle: {
    marginTop: 2,
    color: '#8D817B',
    fontSize: theme.fontSizes.small,
  },
  warningBanner: {
    marginTop: theme.spacing.lg,
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
  unavailableCard: {
    marginHorizontal: theme.spacing.xxl,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
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
  unavailableTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  unavailableText: {
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
    lineHeight: 18,
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
});
