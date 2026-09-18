import { theme } from '@/theme';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type BenefitCardProps = {
  description: string;
  emoji: string;
  emojiFontSize: number;
  height: number;
  title: string;
};

export default function OnboardingScreen() {
  const { height, width } = useWindowDimensions();

  const responsive = useMemo(() => {
    const isMobileScreen = width < 375;
    const isSmallScreen = height < 700;

    return {
      benefitCardHeight: isMobileScreen ? 56 : 64,
      benefitEmojiFontSize: isMobileScreen ? 20 : 24,
      loginButtonHeight: isMobileScreen ? 42 : 46,
      mascotSize: Math.min(width * 0.5, 240),
      paddingHorizontal: Math.max(width * 0.07, 20),
      paddingVertical: isSmallScreen ? 10 : 20,
      startButtonHeight: isMobileScreen ? 48 : 52,
      subtitleFontSize: isMobileScreen ? 13 : 15,
      titleFontSize: isMobileScreen ? 26 : 32,
      titleLineHeight: isMobileScreen ? 32 : 40,
    };
  }, [height, width]);

  function handleComecar() {
    router.push('/cadastro');
  }

  function handleLogin() {
    router.push('/login');
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.gradients.onboarding}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <SafeAreaView
          style={[
            styles.safeArea,
            {
              paddingHorizontal: responsive.paddingHorizontal,
              paddingVertical: responsive.paddingVertical,
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            <View style={styles.mascotContainer}>
              <View
                style={[
                  styles.mascotShadow,
                  {
                    width: responsive.mascotSize,
                  },
                ]}
              >
                <Image
                  source={require('../../assets/images/filmae-mascote.png')}
                  style={{
                    width: responsive.mascotSize,
                    height: responsive.mascotSize,
                  }}
                  contentFit="contain"
                />
              </View>
            </View>

            <View style={styles.titleContainer}>
              <Text
                style={[
                  styles.title,
                  {
                    fontSize: responsive.titleFontSize,
                    lineHeight: responsive.titleLineHeight,
                  },
                ]}
              >
                Seu novo parceiro
              </Text>

              <View style={styles.titleHighlight}>
                <Text
                  style={[
                    styles.titleBold,
                    {
                      fontSize: responsive.titleFontSize,
                      lineHeight: responsive.titleLineHeight,
                    },
                  ]}
                >
                  de cinema.
                </Text>
              </View>

              <Text
                style={[
                  styles.subtitle,
                  {
                    fontSize: responsive.subtitleFontSize,
                  },
                ]}
              >
                Você assiste. O Filmaê aprende.
              </Text>
            </View>

            <View style={styles.benefitsContainer}>
              <BenefitCard
                emoji="🎬"
                title="Registrar"
                description="Anote tudo que assistiu"
                height={responsive.benefitCardHeight}
                emojiFontSize={responsive.benefitEmojiFontSize}
              />

              <BenefitCard
                emoji="🤖"
                title="Entender"
                description="A IA aprende seu gosto"
                height={responsive.benefitCardHeight}
                emojiFontSize={responsive.benefitEmojiFontSize}
              />

              <BenefitCard
                emoji="✨"
                title="Descobrir"
                description="Recomendações personalizadas"
                height={responsive.benefitCardHeight}
                emojiFontSize={responsive.benefitEmojiFontSize}
              />
            </View>
          </ScrollView>

          <View style={styles.buttonsContainer}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.startButton,
                {
                  height: responsive.startButtonHeight,
                },
                pressed && styles.startButtonPressed,
              ]}
              onPress={handleComecar}
            >
              <LinearGradient
                colors={theme.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>Começar</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.loginButton,
                {
                  height: responsive.loginButtonHeight,
                },
                pressed && styles.loginButtonPressed,
              ]}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Já tenho uma conta</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

function BenefitCard({ description, emoji, emojiFontSize, height, title }: BenefitCardProps) {
  return (
    <View
      style={[
        styles.benefitCard,
        {
          height,
        },
      ]}
    >
      <LinearGradient
        colors={theme.gradients.benefit}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.benefitCardGradient}
      >
        <Text
          style={[
            styles.emoji,
            {
              fontSize: emojiFontSize,
            },
          ]}
        >
          {emoji}
        </Text>

        <View style={styles.benefitTextContainer}>
          <Text style={styles.benefitTitle}>{title}</Text>
          <Text style={styles.benefitDescription}>{description}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSoft,
  },
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xxl,
  },
  mascotShadow: {
    borderRadius: theme.radii.round,
    overflow: 'hidden',
    backgroundColor: theme.colors.primaryGlow,
    padding: theme.spacing.sm,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.huge,
  },
  title: {
    color: theme.colors.text,
    fontWeight: theme.fontWeights.semiBold,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  titleHighlight: {
    marginTop: theme.spacing.xs,
  },
  titleBold: {
    color: theme.colors.primaryBright,
    fontWeight: theme.fontWeights.extraBold,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
    fontWeight: theme.fontWeights.regular,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  benefitsContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  benefitCard: {
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  benefitCardGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  emoji: {
    width: 40,
    textAlign: 'center',
    marginRight: theme.spacing.md,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    color: theme.colors.benefitTitle,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.bold,
    lineHeight: 16,
  },
  benefitDescription: {
    color: theme.colors.benefitText,
    fontSize: theme.fontSizes.caption,
    marginTop: theme.spacing.xxs,
    lineHeight: 14,
    fontWeight: theme.fontWeights.regular,
  },
  buttonsContainer: {
    gap: 10,
    marginTop: theme.spacing.lg,
  },
  startButton: {
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: theme.colors.primaryBright,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.bold,
    letterSpacing: 0.5,
  },
  startButtonPressed: {
    opacity: theme.opacity.pressedSoft,
  },
  loginButton: {
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  loginButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.bodySmall,
    fontWeight: theme.fontWeights.semiBold,
    letterSpacing: 0.3,
  },
  loginButtonPressed: {
    backgroundColor: theme.colors.surfacePressed,
  },
});