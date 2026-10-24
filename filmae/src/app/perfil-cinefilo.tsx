import { useRegistration } from '@/context/RegistrationContext';
import { setPendingAuthLoadingTask } from '@/services/auth-loading.service';
import { onboardingService } from '@/services/onboarding.service';
import { theme } from '@/theme';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STORY_MAX_LENGTH = 400;

const STORY_PROMPTS = [
  'Finais que explodem a cabeça',
  'Terror sem jumpscare',
  'Sessão de domingo',
  'Filmes curtos durante a semana',
];

export default function CinephileProfileScreen() {
  const {
    account,
    cinephileStory,
    clearRegistration,
    favoriteMovieIds,
    genreIds,
    saveCinephileStory,
  } = useRegistration();

  const [story, setStory] = useState(cinephileStory);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleBack() {
    saveCinephileStory(story.trim());
    router.back();
  }

  function appendPrompt(prompt: string) {
    setStory((currentStory) => {
      const nextStory = currentStory.trim() ? `${currentStory.trim()}. ${prompt}` : prompt;

      return nextStory.slice(0, STORY_MAX_LENGTH);
    });
  }

  async function finishRegistration(finalStory: string) {
    if (isSubmitting) {
      return;
    }

    if (!account) {
      setErrorMessage('Volte ao cadastro e preencha seus dados antes de continuar.');
      return;
    }

    const normalizedStory = finalStory.trim();

    setErrorMessage(null);
    setIsSubmitting(true);
    saveCinephileStory(normalizedStory);

    setPendingAuthLoadingTask({
      mode: 'profile',
      run: async () => {
        // TODO: o backend ainda não tem os endpoints /users/me/onboarding/*.
        // Enquanto isso, uma falha aqui não bloqueia o fim do cadastro.
        try {
          await onboardingService.saveGenres({
            genres: genreIds,
          });
          await onboardingService.saveFavoriteMovies({
            movieIds: favoriteMovieIds,
          });
          await onboardingService.saveProfileStory({
            text: normalizedStory,
          });
          await onboardingService.completeOnboarding();
        } catch {
          // ignorado temporariamente
        }

        clearRegistration();
        return '/perfil-criado';
      },
    });

    router.replace('/auth-loading');
  }

  function handleSkip() {
    void finishRegistration('');
  }

  function handleSubmit() {
    void finishRegistration(story);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.header}>
          <View style={styles.navigationRow}>
            <Pressable
              accessibilityLabel="Voltar para os filmes favoritos"
              accessibilityRole="button"
              disabled={isSubmitting}
              hitSlop={10}
              onPress={handleBack}
            >
              <Text style={styles.navigationText}>← Voltar</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              hitSlop={10}
              onPress={handleSkip}
            >
              <Text style={styles.navigationText}>Deixar para depois</Text>
            </Pressable>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, styles.progressBarActive]} />
            <View style={[styles.progressBar, styles.progressBarActive]} />
            <View style={[styles.progressBar, styles.progressBarActive]} />
          </View>

          <Text style={styles.step}>Passo 3 de 3</Text>
          <Text style={styles.title}>Conte seu lado cinéfilo.</Text>

          <Text style={styles.subtitle}>
            Quanto mais contexto você der, melhor o Pipoca.i entende o que realmente funciona para
            você.
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tipCard}>
            <View style={styles.mascotContainer}>
              <Image
                accessibilityLabel="Pipoca.i"
                contentFit="contain"
                source={require('../../assets/images/filmae-mascote.png')}
                style={styles.mascot}
              />
            </View>

            <Text style={styles.tipText}>
              Pode falar do seu jeito. Não precisa conhecer termos de cinema.
            </Text>
          </View>

          <Text style={styles.inputLabel}>Como é uma sessão perfeita para você?</Text>

          <TextInput
            accessibilityLabel="Conte como é uma sessão perfeita para você"
            autoCapitalize="sentences"
            autoCorrect
            editable={!isSubmitting}
            maxLength={STORY_MAX_LENGTH}
            multiline
            onChangeText={setStory}
            placeholder="Ex.: gosto de filmes que me deixam pensando depois, finais inesperados e terror sem sustos baratos..."
            placeholderTextColor={theme.colors.placeholder}
            style={styles.storyInput}
            textAlignVertical="top"
            value={story}
          />

          <View style={styles.inputInfoRow}>
            <Text style={styles.inputInfo}>Ideias para começar</Text>

            <Text style={styles.inputInfo}>
              {story.length}/{STORY_MAX_LENGTH}
            </Text>
          </View>

          <View style={styles.promptList}>
            {STORY_PROMPTS.map((prompt) => (
              <Pressable
                key={prompt}
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={() => appendPrompt(prompt)}
                style={({ pressed }) => [styles.promptChip, pressed && styles.pressed]}
              >
                <Text style={styles.promptText}>{prompt}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {errorMessage ? (
            <Text accessibilityLiveRegion="polite" style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              busy: isSubmitting,
              disabled: isSubmitting,
            }}
            disabled={isSubmitting}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
              pressed && styles.pressed,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={theme.colors.text} />
            ) : (
              <Text style={styles.submitButtonText}>Criar meu perfil</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.warmBackground,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.xxl,
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
    lineHeight: 20,
    marginTop: theme.spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.lg,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderRadius: theme.radii.xxl,
    backgroundColor: theme.colors.cream,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  mascotContainer: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primaryTransparent,
  },
  mascot: {
    width: 66,
    height: 66,
  },
  tipText: {
    flex: 1,
    color: theme.colors.benefitTitle,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.medium,
    lineHeight: 20,
  },
  inputLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  storyInput: {
    minHeight: 150,
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    lineHeight: 20,
    marginTop: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
  },
  inputInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  inputInfo: {
    color: theme.colors.prototypeMuted,
    fontSize: theme.fontSizes.small,
  },
  promptList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  promptChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeBorder,
  },
  promptText: {
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
  },
  footer: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.small,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  submitButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.primary,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.input,
    fontWeight: theme.fontWeights.semiBold,
  },
  pressed: {
    opacity: theme.opacity.pressed,
    transform: [{ scale: 0.98 }],
  },
});
