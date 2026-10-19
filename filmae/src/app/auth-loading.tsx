import {
  clearPendingAuthLoadingTask,
  getPendingAuthLoadingTask,
  runPendingAuthLoadingTask,
} from '@/services/auth-loading.service';
import { theme } from '@/theme';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MIN_VISUAL_LOADING_MS = 650;

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

const loadingCopy = {
  login: {
    subtitle: 'Validando suas credenciais para continuar.',
    title: 'Entrando na sua conta...',
  },
  profile: {
    subtitle: 'Estamos salvando seu perfil para preparar as recomendações.',
    title: 'Finalizando seu perfil...',
  },
  register: {
    subtitle: 'Criando sua conta para iniciar sua jornada no Filmaê.',
    title: 'Preparando seu cadastro...',
  },
} as const;

export default function AuthLoadingScreen() {
  const pendingTask = getPendingAuthLoadingTask();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const runningRef = useRef(false);

  const handleBackToLogin = useCallback(() => {
    clearPendingAuthLoadingTask();
    router.replace('/login');
  }, []);

  const runTask = useCallback(async () => {
    if (runningRef.current) {
      return;
    }

    if (!pendingTask) {
      setErrorMessage('Não existe uma operação pendente para esta tela.');
      return;
    }

    runningRef.current = true;
    setErrorMessage(null);

    try {
      const [nextRoute] = await Promise.all([
        runPendingAuthLoadingTask(),
        wait(MIN_VISUAL_LOADING_MS),
      ]);
      clearPendingAuthLoadingTask();
      router.replace(nextRoute);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível concluir esta etapa.';

      setErrorMessage(message);
      runningRef.current = false;
    }
  }, [pendingTask]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void runTask();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [runTask]);

  const copy = pendingTask ? loadingCopy[pendingTask.mode] : loadingCopy.login;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Image
          accessibilityLabel="Pipoca.i"
          contentFit="contain"
          source={require('../../assets/images/filmae-mascote.png')}
          style={styles.mascot}
        />

        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text accessibilityLiveRegion="polite" style={styles.errorText}>
              {errorMessage}
            </Text>

            <View style={styles.actionRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => void runTask()}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryButtonText}>Tentar novamente</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={handleBackToLogin}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.primaryButtonText}>Voltar</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <ActivityIndicator color={theme.colors.primary} size="large" style={styles.loader} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.warmBackground,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
  },
  mascot: {
    width: 150,
    height: 150,
    marginBottom: theme.spacing.xl,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.titleSmall,
    fontWeight: theme.fontWeights.bold,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.body,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    maxWidth: 300,
  },
  loader: {
    marginTop: theme.spacing.xl,
  },
  errorContainer: {
    width: '100%',
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.small,
    textAlign: 'center',
  },
  actionRow: {
    marginTop: theme.spacing.lg,
    width: '100%',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  primaryButton: {
    flex: 1,
    height: theme.sizes.control,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.bold,
  },
  secondaryButton: {
    flex: 1,
    height: theme.sizes.control,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
});
