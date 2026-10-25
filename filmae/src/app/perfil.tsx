import { AppBottomNav } from '@/components/navigation/AppBottomNav';
import { dashboardService } from '@/services/dashboard.service';
import { notificationsService } from '@/services/notifications.service';
import { profileService } from '@/services/profile.service';
import { theme } from '@/theme';
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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfilePhoto } from '@/hooks/useProfilePhoto';
import { showProfilePhotoMenu } from '@/services/profile-photo.service';
import { Image } from 'expo-image';

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

export default function ProfileScreen() {
  const [bioInput, setBioInput] = useState('');
  const [dashboardData, setDashboardData] = useState<Awaited<
    ReturnType<typeof dashboardService.getDashboard>
  > | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [notificationsData, setNotificationsData] = useState<Awaited<
    ReturnType<typeof notificationsService.getNotifications>
  > | null>(null);
  const [profileData, setProfileData] = useState<Awaited<
    ReturnType<typeof profileService.getMe>
  > | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [profileResult, dashboardResult, notificationsResult] = await Promise.allSettled([
        profileService.getMe(),
        dashboardService.getDashboard(),
        notificationsService.getNotifications(),
      ]);

      const warnings: string[] = [];

      if (profileResult.status === 'fulfilled') {
        setProfileData(profileResult.value);
        setNameInput(profileResult.value.user.name);
        setBioInput(profileResult.value.user.bio);
      } else {
        setProfileData(null);
        setNameInput('');
        setBioInput('');
        warnings.push('Perfil com dados indisponíveis no momento.');
      }

      if (dashboardResult.status === 'fulfilled') {
        setDashboardData(dashboardResult.value);
      } else {
        setDashboardData(null);
        warnings.push('Dashboard indisponível no momento.');
      }

      if (notificationsResult.status === 'fulfilled') {
        setNotificationsData(notificationsResult.value);
      } else {
        setNotificationsData(null);
        warnings.push('Notificações indisponíveis no momento.');
      }

      setErrorMessage(warnings.length ? warnings.join(' ') : null);
      setIsEditing(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as seções do perfil agora.';
      setErrorMessage(message);
      setProfileData(null);
      setDashboardData(null);
      setNotificationsData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadProfile]);

  const saveProfile = useCallback(async () => {
    if (!profileData) {
      setErrorMessage('A edição do perfil está indisponível enquanto os dados não carregarem.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const result = await profileService.updateMe({
        bio: bioInput,
        name: nameInput,
      });

      setProfileData(result);
      setNameInput(result.user.name);
      setBioInput(result.user.bio);
      setIsEditing(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Não foi possível salvar o perfil.';
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }, [bioInput, nameInput, profileData]);

  const profileInitial = useMemo(() => {
    const name = (profileData?.user.name ?? nameInput).trim();
    return name ? name.charAt(0).toUpperCase() : '?';
  }, [nameInput, profileData]);

  const photoUri = useProfilePhoto(profileData?.user.id);

  const handleChangePhoto = useCallback(() => {
    if (profileData) {
      showProfilePhotoMenu(profileData.user.id);
    }
  }, [profileData]);

  const createdAt = profileData?.user.createdAt;
  const dashboardTopGenres = dashboardData?.topGenres ?? [];
  const historyPreview = dashboardData?.historyPreview ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={styles.stateText}>Carregando seu perfil...</Text>
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
                  onPress={() => void loadProfile()}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
                >
                  <Text style={styles.retryButtonText}>Atualizar</Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.headerCard}>
              <Pressable
                accessibilityLabel="Alterar foto de perfil"
                accessibilityRole="button"
                disabled={!profileData}
                onPress={handleChangePhoto}
                style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
              >
                {photoUri ? (
                  <Image contentFit="cover" source={{ uri: photoUri }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{profileInitial}</Text>
                )}
              </Pressable>

              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Seu perfil</Text>
                <Text style={styles.headerSubtitle}>
                  {profileData?.user.email ?? 'Dados da conta indisponíveis no momento'}
                </Text>
                {createdAt ? (
                  <Text style={styles.headerSubtitle}>
                    Conta criada em {formatIsoDate(createdAt)}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Dados do perfil</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    if (!profileData) {
                      setErrorMessage(
                        'A edição do perfil estará disponível quando o servidor responder.',
                      );
                      return;
                    }

                    setIsEditing((currentState) => !currentState);
                  }}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Text style={styles.cardAction}>
                    {profileData ? (isEditing ? 'Cancelar' : 'Editar') : 'Indisponível'}
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.fieldLabel}>Nome</Text>
              {isEditing && profileData ? (
                <TextInput
                  accessibilityLabel="Nome do perfil"
                  autoCapitalize="words"
                  autoCorrect={false}
                  onChangeText={setNameInput}
                  style={styles.input}
                  value={nameInput}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {profileData?.user.name ?? 'Nome indisponível'}
                </Text>
              )}

              <Text style={styles.fieldLabel}>Bio</Text>
              {isEditing && profileData ? (
                <TextInput
                  accessibilityLabel="Bio do perfil"
                  autoCapitalize="sentences"
                  autoCorrect
                  multiline
                  onChangeText={setBioInput}
                  style={[styles.input, styles.multilineInput]}
                  textAlignVertical="top"
                  value={bioInput}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {profileData?.user.bio || 'Bio indisponível no momento.'}
                </Text>
              )}

              {isEditing && profileData ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={isSaving}
                  onPress={() => void saveProfile()}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.pressed,
                    isSaving && styles.disabledAction,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    {isSaving ? 'Salvando...' : 'Salvar alterações'}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Dashboard</Text>

              <View style={styles.kpiGrid}>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiNumber}>{dashboardData?.kpis.watchedCount ?? 0}</Text>
                  <Text style={styles.kpiLabel}>Assistidos</Text>
                </View>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiNumber}>{dashboardData?.kpis.watchlistCount ?? 0}</Text>
                  <Text style={styles.kpiLabel}>Quero assistir</Text>
                </View>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiNumber}>{dashboardData?.kpis.favoriteCount ?? 0}</Text>
                  <Text style={styles.kpiLabel}>Favoritos</Text>
                </View>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiNumber}>{dashboardData?.kpis.ratedCount ?? 0}</Text>
                  <Text style={styles.kpiLabel}>Avaliados</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <MaterialIcons color={theme.colors.creamMuted} name="schedule" size={17} />
                <Text style={styles.statsText}>
                  Tempo assistido:{' '}
                  {formatMinutesAsHours(dashboardData?.kpis.totalMinutesWatched ?? 0)}
                </Text>
              </View>

              <View style={styles.statsRow}>
                <MaterialIcons color={theme.colors.creamMuted} name="movie-filter" size={17} />
                <Text style={styles.statsText}>
                  Gêneros em alta:{' '}
                  {dashboardTopGenres.length
                    ? dashboardTopGenres.map((genre) => genre.genre).join(', ')
                    : 'dados indisponíveis'}
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Atalhos</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/dashboard')}
                style={({ pressed }) => [styles.shortcutButton, pressed && styles.pressed]}
              >
                <MaterialIcons color={theme.colors.creamMuted} name="bar-chart" size={18} />
                <Text style={styles.shortcutText}>Abrir dashboard completo</Text>
                <MaterialIcons color={theme.colors.creamMuted} name="chevron-right" size={18} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/historico')}
                style={({ pressed }) => [styles.shortcutButton, pressed && styles.pressed]}
              >
                <MaterialIcons color={theme.colors.creamMuted} name="history" size={18} />
                <Text style={styles.shortcutText}>Ver histórico completo</Text>
                <MaterialIcons color={theme.colors.creamMuted} name="chevron-right" size={18} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/notificacoes')}
                style={({ pressed }) => [styles.shortcutButton, pressed && styles.pressed]}
              >
                <MaterialIcons
                  color={theme.colors.creamMuted}
                  name="notifications-none"
                  size={18}
                />
                <Text style={styles.shortcutText}>
                  Notificações ({notificationsData?.unreadCount ?? 0} não lidas)
                </Text>
                <MaterialIcons color={theme.colors.creamMuted} name="chevron-right" size={18} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/pipocai-memoria')}
                style={({ pressed }) => [styles.shortcutButton, pressed && styles.pressed]}
              >
                <MaterialIcons color={theme.colors.creamMuted} name="psychology" size={18} />
                <Text style={styles.shortcutText}>Memória do Pipocai</Text>
                <MaterialIcons color={theme.colors.creamMuted} name="chevron-right" size={18} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/adicionar-filme')}
                style={({ pressed }) => [styles.shortcutButton, pressed && styles.pressed]}
              >
                <MaterialIcons
                  color={theme.colors.creamMuted}
                  name="add-circle-outline"
                  size={18}
                />
                <Text style={styles.shortcutText}>Registrar filme assistido</Text>
                <MaterialIcons color={theme.colors.creamMuted} name="chevron-right" size={18} />
              </Pressable>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Histórico recente</Text>
              {historyPreview.length ? (
                historyPreview.slice(0, 3).map((entry) => (
                  <Pressable
                    key={entry.movieId}
                    accessibilityRole="button"
                    onPress={() =>
                      router.push({
                        pathname: '/filme/[id]',
                        params: { id: entry.movieId },
                      })
                    }
                    style={({ pressed }) => [styles.historyRow, pressed && styles.pressed]}
                  >
                    <View style={styles.historyRowText}>
                      <Text style={styles.historyTitle}>{entry.title}</Text>
                      <Text style={styles.historyMeta}>
                        {entry.year} • visto em {formatIsoDate(entry.watchedAt)}
                      </Text>
                    </View>
                    <Text style={styles.historyRating}>
                      {entry.rating === null ? 'Sem nota' : `${entry.rating}/5`}
                    </Text>
                  </Pressable>
                ))
              ) : (
                <Text style={styles.historyEmpty}>Histórico indisponível no momento.</Text>
              )}
            </View>
          </ScrollView>
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
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.body,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.lg,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    height: 44,
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
  headerCard: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 54,
    height: 54,
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
    fontSize: 20,
    fontWeight: theme.fontWeights.bold,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: theme.fontWeights.bold,
  },
  headerSubtitle: {
    marginTop: 2,
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
  },
  card: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  cardAction: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.semiBold,
  },
  fieldLabel: {
    marginTop: theme.spacing.xs,
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.medium,
  },
  fieldValue: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    lineHeight: 20,
  },
  input: {
    height: 46,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSizes.body,
  },
  multilineInput: {
    minHeight: 94,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  primaryButton: {
    marginTop: theme.spacing.sm,
    height: 46,
    borderRadius: theme.radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  primaryButtonText: {
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
  kpiNumber: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: theme.fontWeights.bold,
  },
  kpiLabel: {
    marginTop: 2,
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statsText: {
    flex: 1,
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
  },
  shortcutButton: {
    height: 44,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  shortcutText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSizes.small,
  },
  historyRow: {
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  historyRowText: {
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
  historyEmpty: {
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
  },
  disabledAction: {
    opacity: 0.6,
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
});
