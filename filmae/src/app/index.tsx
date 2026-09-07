import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();

  // Valores responsivos baseados no tamanho da tela
  const dynamicStyles = useMemo(() => {
    const isSmallScreen = height < 700;
    const isMobileScreen = width < 375;

    return {
      mascotSize: Math.min(width * 0.5, 240),
      paddingHorizontal: Math.max(width * 0.07, 20),
      paddingVertical: isSmallScreen ? 10 : 20,
      titleFontSize: isMobileScreen ? 26 : 32,
      subtitleFontSize: isMobileScreen ? 13 : 15,
      benefitCardHeight: isMobileScreen ? 56 : 64,
      benefitEmojiFontSize: isMobileScreen ? 20 : 24,
      startButtonHeight: isMobileScreen ? 48 : 52,
      loginButtonHeight: isMobileScreen ? 42 : 46,
    };
  }, [width, height]);

  function handleComecar() {
    router.push('/cadastro');
  }

  function handleLogin() {
    router.push('/login');
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#1A0A0A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <SafeAreaView
          style={[
            styles.safeArea,
            {
              paddingHorizontal: dynamicStyles.paddingHorizontal,
              paddingVertical: dynamicStyles.paddingVertical,
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {/* Mascote com efeito de sombra */}
            <View style={styles.mascotContainer}>
              <View style={[styles.mascotShadow, { width: dynamicStyles.mascotSize }]}>
                <Image
                  source={require('../../assets/images/filmae-mascote.png')}
                  style={{
                    width: dynamicStyles.mascotSize,
                    height: dynamicStyles.mascotSize,
                  }}
                  contentFit="contain"
                />
              </View>
            </View>

            {/* Título e Subtítulo */}
            <View style={styles.titleContainer}>
              <Text
                style={[
                  styles.title,
                  { fontSize: dynamicStyles.titleFontSize },
                ]}
              >
                Seu novo parceiro
              </Text>

              <View style={styles.titleHighlight}>
                <Text
                  style={[
                    styles.titleBold,
                    { fontSize: dynamicStyles.titleFontSize },
                  ]}
                >
                  de cinema.
                </Text>
              </View>

              <Text
                style={[
                  styles.subtitle,
                  { fontSize: dynamicStyles.subtitleFontSize },
                ]}
              >
                Você assiste. O Filmaê aprende.
              </Text>
            </View>

            {/* Benefícios */}
            <View style={styles.benefitsContainer}>
              <BenefitCard
                emoji="🎬"
                title="Registrar"
                description="Anote tudo que assistiu"
                height={dynamicStyles.benefitCardHeight}
                emojiFontSize={dynamicStyles.benefitEmojiFontSize}
              />

              <BenefitCard
                emoji="🤖"
                title="Entender"
                description="A IA aprende seu gosto"
                height={dynamicStyles.benefitCardHeight}
                emojiFontSize={dynamicStyles.benefitEmojiFontSize}
              />

              <BenefitCard
                emoji="✨"
                title="Descobrir"
                description="Recomendações personalizadas"
                height={dynamicStyles.benefitCardHeight}
                emojiFontSize={dynamicStyles.benefitEmojiFontSize}
              />
            </View>
          </ScrollView>

          {/* Botões */}
          <View style={styles.buttonsContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.startButton,
                { height: dynamicStyles.startButtonHeight },
                pressed && styles.startButtonPressed,
              ]}
              onPress={handleComecar}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF0000', '#CC0000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>Começar</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                { height: dynamicStyles.loginButtonHeight },
                pressed && styles.loginButtonPressed,
              ]}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Já tenho uma conta</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

function BenefitCard({ emoji, title, description, height, emojiFontSize }) {
  return (
    <Pressable style={[styles.benefitCard, { height }]} activeOpacity={0.7}>
      <LinearGradient
        colors={['#FFF5E1', '#FFF0D2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.benefitCardGradient}
      >
        <Text style={[styles.emoji, { fontSize: emojiFontSize }]}>
          {emoji}
        </Text>

        <View style={styles.benefitTextContainer}>
          <Text style={styles.benefitTitle}>{title}</Text>
          <Text style={styles.benefitDescription}>{description}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
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
    marginTop: 8,
    marginBottom: 24,
  },

  mascotShadow: {
    borderRadius: 150,
    overflow: 'hidden',
    backgroundColor: 'rgba(240, 0, 15, 0.05)',
    padding: 8,
  },

  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },

  title: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
  },

  titleHighlight: {
    marginTop: 4,
  },

  titleBold: {
    color: '#FF0000',
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
  },

  subtitle: {
    color: '#999999',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.3,
  },

  benefitsContainer: {
    gap: 12,
    marginBottom: 24,
  },

  benefitCard: {
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  benefitCardGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  emoji: {
    width: 40,
    textAlign: 'center',
    marginRight: 12,
  },

  benefitTextContainer: {
    flex: 1,
  },

  benefitTitle: {
    color: '#1A1A1A',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },

  benefitDescription: {
    color: '#555555',
    fontSize: 10,
    marginTop: 3,
    lineHeight: 14,
    fontWeight: '400',
  },

  buttonsContainer: {
    gap: 10,
    marginTop: 16,
  },

  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  startButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  startButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  startButtonPressed: {
    opacity: 0.85,
  },

  loginButton: {
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 1.5,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  loginButtonPressed: {
    backgroundColor: '#252525',
  },
});