import { theme } from '@/theme';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
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

const googleButtonImage = Platform.select({
  ios: require('../../assets/images/google-signin-ios.png'),
  default: require('../../assets/images/google-signin-android-web.png'),
});

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function handleVoltar() {
    router.back();
  }

  function handleLogin() {
    // A integração será adicionada quando o endpoint real for informado.
    console.warn('Autenticação por e-mail ainda não implementada.', {
      emailPreenchido: Boolean(email),
    });
  }

  function handleEsqueciSenha() {
    console.warn('Recuperação de senha ainda não implementada.');
  }

  function handleGoogle() {
    console.warn('Autenticação com Google ainda não implementada.');
  }

  function handleCadastro() {
    router.push('/cadastro');
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.auth} style={styles.background}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={styles.keyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Pressable
                accessibilityLabel="Voltar"
                accessibilityRole="button"
                style={styles.backButton}
                onPress={handleVoltar}
              >
                <MaterialIcons
                  name="arrow-back-ios"
                  size={theme.fontSizes.icon}
                  color={theme.colors.textSecondary}
                />
              </Pressable>

              <View style={styles.header}>
                <Text style={styles.title}>Bem-vindo de volta</Text>
                <Text style={styles.subtitle}>Entre na sua conta Filmaê</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail</Text>

                <TextInput
                  accessibilityLabel="E-mail"
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor={theme.colors.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  returnKeyType="next"
                  textContentType="emailAddress"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha</Text>

                <View style={styles.passwordContainer}>
                  <TextInput
                    accessibilityLabel="Senha"
                    style={styles.passwordInput}
                    placeholder="••••••••"
                    placeholderTextColor={theme.colors.placeholder}
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry={!mostrarSenha}
                    autoCapitalize="none"
                    autoComplete="current-password"
                    autoCorrect={false}
                    returnKeyType="done"
                    textContentType="password"
                    onSubmitEditing={handleLogin}
                  />

                  <Pressable
                    accessibilityLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    accessibilityRole="button"
                    style={styles.eyeButton}
                    onPress={() => setMostrarSenha((valorAtual) => !valorAtual)}
                  >
                    <MaterialIcons
                      name={mostrarSenha ? 'visibility' : 'visibility-off'}
                      size={theme.fontSizes.icon}
                      color={theme.colors.iconMuted}
                    />
                  </Pressable>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                style={styles.forgotButton}
                onPress={handleEsqueciSenha}
              >
                <Text style={styles.forgotText}>Esqueci minha senha</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.loginButton, pressed && styles.buttonPressed]}
                onPress={handleLogin}
              >
                <Text style={styles.loginButtonText}>Entrar</Text>
              </Pressable>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.divider} />
              </View>

              <Pressable
                accessibilityLabel="Fazer login com Google"
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.googleButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleGoogle}
              >
                <Image
                  source={googleButtonImage}
                  style={styles.googleButtonImage}
                  contentFit="contain"
                />
              </Pressable>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Não tem conta?</Text>

                <Pressable accessibilityRole="link" onPress={handleCadastro}>
                  <Text style={styles.registerLink}>Criar conta</Text>
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: 30,
  },
  backButton: {
    width: theme.sizes.iconButton,
    height: theme.sizes.iconButton,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  header: {
    marginBottom: theme.spacing.xxxl,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.title,
    fontWeight: theme.fontWeights.bold,
    marginBottom: 6,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.bodySmall,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.small,
    marginBottom: theme.spacing.sm,
  },
  input: {
    height: theme.sizes.control,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.input,
    color: theme.colors.text,
    fontSize: theme.fontSizes.input,
  },
  passwordContainer: {
    height: theme.sizes.control,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: theme.spacing.input,
    color: theme.colors.text,
    fontSize: theme.fontSizes.input,
  },
  eyeButton: {
    width: theme.sizes.passwordAction,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotButton: {
    alignSelf: 'flex-start',
    marginTop: -theme.spacing.xs,
    marginBottom: theme.spacing.xl,
  },
  forgotText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.semiBold,
  },
  loginButton: {
    height: theme.sizes.control,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.bold,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.divider,
  },
  dividerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.small,
    marginHorizontal: theme.fontSizes.body,
  },
  googleButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonImage: {
    width: 225,
    height: 50,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 26,
  },
  registerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.small,
  },
  registerLink: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.semiBold,
    marginLeft: theme.spacing.xs,
  },
  buttonPressed: {
    opacity: theme.opacity.pressed,
  },
});
