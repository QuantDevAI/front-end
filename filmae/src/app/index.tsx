import { appBootstrapService } from '@/services/app-bootstrap.service';
import { theme } from '@/theme';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MINIMUM_SPLASH_TIME_MS = 1800;

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export default function SplashScreen() {
  const { height, width } = useWindowDimensions();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logoAnimation] = useState(() => new Animated.Value(0));
  const [dotAnimation] = useState(() => new Animated.Value(0));
  const mountedRef = useRef(true);
  const runningRef = useRef(false);

  const responsive = useMemo(
    () => ({
      frameBottom: Math.max(height * 0.11, 70),
      frameTop: Math.max(height * 0.11, 70),
      imageSize: Math.min(width * 0.68, 270),
    }),
    [height, width],
  );

  const initializeApp = useCallback(async () => {
    if (runningRef.current) {
      return;
    }

    runningRef.current = true;
    setErrorMessage(null);

    try {
      const [result] = await Promise.all([
        appBootstrapService.initialize(),
        wait(MINIMUM_SPLASH_TIME_MS),
      ]);

      if (mountedRef.current) {
        router.replace(result.initialRoute);
      }
    } catch (error: unknown) {
      if (mountedRef.current) {
        const message =
          error instanceof Error ? error.message : 'Não foi possível iniciar o aplicativo.';

        setErrorMessage(message);
        runningRef.current = false;
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const logoEntry = Animated.timing(logoAnimation, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    });

    const dotsLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnimation, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnimation, {
          toValue: 0,
          duration: 550,
          useNativeDriver: true,
        }),
      ]),
    );

    logoEntry.start();
    dotsLoop.start();
    void initializeApp();

    return () => {
      mountedRef.current = false;
      logoEntry.stop();
      dotsLoop.stop();
    };
  }, [dotAnimation, initializeApp, logoAnimation]);

  const logoStyle = {
    opacity: logoAnimation,
    transform: [
      {
        translateY: logoAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [28, 0],
        }),
      },
    ],
  };

  return (
    <LinearGradient
      colors={theme.gradients.splash}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.topGlow} />
      <View style={styles.bottomShadow} />

      <View
        style={[
          styles.frame,
          {
            bottom: responsive.frameBottom,
            top: responsive.frameTop,
          },
        ]}
      />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, logoStyle]}>
          <Image
            accessibilityLabel="Filmaê"
            source={require('../../assets/images/logo.png')}
            style={{
              height: responsive.imageSize,
              width: responsive.imageSize,
            }}
            contentFit="contain"
          />

          <Text style={styles.tagline}>SEU CINEMA. DO SEU JEITO.</Text>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                {errorMessage}
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={() => void initializeApp()}
                style={({ pressed }) => [styles.retryButton, pressed && styles.retryPressed]}
              >
                <Text style={styles.retryText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : (
            <View accessibilityLabel="Carregando aplicativo" style={styles.dotsContainer}>
              {[0, 1, 2].map((dot) => {
                const opacity = dotAnimation.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange:
                    dot === 1
                      ? [0.55, 1, 0.55]
                      : dot === 0
                        ? [1, 0.55, 1]
                        : [0.55, 0.7, 0.55],
                });

                return <Animated.View key={dot} style={[styles.dot, { opacity }]} />;
              })}
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topGlow: {
    position: 'absolute',
    width: 290,
    height: 290,
    borderRadius: theme.radii.round,
    right: -96,
    top: -80,
    backgroundColor: theme.colors.creamTransparent,
  },
  bottomShadow: {
    position: 'absolute',
    width: 290,
    height: 290,
    borderRadius: theme.radii.round,
    left: -96,
    bottom: -96,
    backgroundColor: theme.colors.darkTransparent,
  },
  frame: {
    position: 'absolute',
    left: 28,
    right: 28,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    borderRadius: 42,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xxl,
  },
  tagline: {
    color: theme.colors.cream,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.semiBold,
    letterSpacing: 2,
    marginTop: theme.spacing.xxl,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.cream,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
  },
  errorText: {
    color: theme.colors.cream,
    fontSize: theme.fontSizes.small,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.cream,
  },
  retryPressed: {
    opacity: theme.opacity.pressed,
  },
  retryText: {
    color: theme.colors.cream,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
});