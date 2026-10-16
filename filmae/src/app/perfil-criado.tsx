import { theme } from '@/theme';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PerfilCriadoScreen() {
  function handleContinue() {
    router.replace('/home');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Image
          accessibilityLabel="Pipoca.i celebrando"
          contentFit="contain"
          source={require('../../assets/images/filmae-mascote.png')}
          style={styles.mascot}
        />

        <Text style={styles.title}>Seu perfil cinematográfico está pronto!</Text>
        <Text style={styles.subtitle}>
          Tudo certo por aqui. Agora você já pode entrar para receber recomendações cada vez mais
          personalizadas.
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={handleContinue}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Ir para Home</Text>
        </Pressable>
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
    width: 160,
    height: 160,
    marginBottom: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.titleSmall,
    fontWeight: theme.fontWeights.bold,
    textAlign: 'center',
    lineHeight: 30,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.body,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  button: {
    marginTop: theme.spacing.xl,
    width: '100%',
    maxWidth: 340,
    height: theme.sizes.control,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.bold,
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
});
