import { setPendingAuthLoadingTask } from '@/services/auth-loading.service';
import { authService } from '@/services/auth.service';
import { useRegistration } from '@/context/RegistrationContext';
import { Image } from 'expo-image';
import { theme } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const googleButtonImage = Platform.select({
  ios: require('../../assets/images/google-signin-ios.png'),
  default: require('../../assets/images/google-signin-android-web.png'),
});

export default function CadastroScreen() {
  const { width } = useWindowDimensions();
  const { saveAccount } = useRegistration();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const responsive = useMemo(() => {
    const isSmallScreen = width < 375;

    return {
      contentPaddingHorizontal: Math.max(width * 0.05, 15),
      subtitleFontSize: isSmallScreen ? 11 : theme.fontSizes.bodySmall,
      titleFontSize: isSmallScreen ? theme.fontSizes.titleSmall : theme.fontSizes.title,
    };
  }, [width]);

  function handleVoltar() {
    router.back();
  }

  function handleCadastro() {
    if (isSubmitting) {
      return;
    }

    const normalizedName = nome.trim();
    const normalizedEmail = email.trim().toLocaleLowerCase('pt-BR');

    if (!normalizedName || !normalizedEmail || !senha || !confirmarSenha) {
      setErrorMessage('Preencha todos os campos para continuar.');
      return;
    }

    if (!normalizedEmail.includes('@')) {
      setErrorMessage('Digite um e-mail válido.');
      return;
    }

    const senhaForte =
      senha.length >= 8 &&
      /[A-Z]/.test(senha) &&
      /[a-z]/.test(senha) &&
      /[0-9]/.test(senha) &&
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(senha);

    if (!senhaForte) {
      setErrorMessage(
        'A senha precisa ter 8+ caracteres, com maiúscula, minúscula, número e símbolo.',
      );
      return;
    }

    if (senha !== confirmarSenha) {
      setErrorMessage('As senhas informadas não coincidem.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    saveAccount({
      email: normalizedEmail,
      name: normalizedName,
      password: senha,
    });

    setPendingAuthLoadingTask({
      mode: 'register',
      run: async () => {
        await authService.register({
          email: normalizedEmail,
          name: normalizedName,
          password: senha,
        });

        return '/preferencias-generos';
      },
    });

    router.replace('/auth-loading');
  }

  function handleGoogle() {
    if (isSubmitting) {
      return;
    }

    setErrorMessage('Login com Google ainda não está disponível nesta versão. Use e-mail e senha.');
  }

  function handleLogin() {
    router.push('/login');
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
              contentContainerStyle={[
                styles.scrollContent,
                {
                  paddingHorizontal: responsive.contentPaddingHorizontal,
                },
              ]}
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
                <Text
                  style={[
                    styles.title,
                    {
                      fontSize: responsive.titleFontSize,
                    },
                  ]}
                >
                  Criar conta
                </Text>

                <Text
                  style={[
                    styles.subtitle,
                    {
                      fontSize: responsive.subtitleFontSize,
                    },
                  ]}
                >
                  Comece sua jornada cinematográfica
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome</Text>

                <TextInput
                  accessibilityLabel="Nome"
                  style={styles.input}
                  placeholder="Seu nome"
                  placeholderTextColor={theme.colors.placeholder}
                  value={nome}
                  onChangeText={setNome}
                  autoCapitalize="words"
                  autoComplete="name"
                  autoCorrect={false}
                  returnKeyType="next"
                  textContentType="name"
                />
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
                    autoComplete="new-password"
                    autoCorrect={false}
                    returnKeyType="next"
                    textContentType="newPassword"
                  />

                  <Pressable
                    accessibilityLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    accessibilityRole="button"
                    style={styles.eyeButton}
                    disabled={isSubmitting}
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar senha</Text>

                <View style={styles.passwordContainer}>
                  <TextInput
                    accessibilityLabel="Confirmar senha"
                    style={styles.passwordInput}
                    placeholder="••••••••"
                    placeholderTextColor={theme.colors.placeholder}
                    value={confirmarSenha}
                    onChangeText={setConfirmarSenha}
                    secureTextEntry={!mostrarConfirmarSenha}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    autoCorrect={false}
                    returnKeyType="done"
                    textContentType="newPassword"
                    onSubmitEditing={handleCadastro}
                  />

                  <Pressable
                    accessibilityLabel={
                      mostrarConfirmarSenha
                        ? 'Ocultar confirmação de senha'
                        : 'Mostrar confirmação de senha'
                    }
                    accessibilityRole="button"
                    style={styles.eyeButton}
                    disabled={isSubmitting}
                    onPress={() => setMostrarConfirmarSenha((valorAtual) => !valorAtual)}
                  >
                    <MaterialIcons
                      name={mostrarConfirmarSenha ? 'visibility' : 'visibility-off'}
                      size={theme.fontSizes.icon}
                      color={theme.colors.iconMuted}
                    />
                  </Pressable>
                </View>
              </View>

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
                style={({ pressed }) => [
                  styles.createButton,
                  isSubmitting && styles.createButtonDisabled,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleCadastro}
              >
                <Text style={styles.createButtonText}>
                  {isSubmitting ? 'Criando conta...' : 'Criar conta'}
                </Text>
              </Pressable>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.divider} />
              </View>

              <Pressable
                accessibilityLabel="Fazer login com Google"
                accessibilityRole="button"
                accessibilityState={{
                  busy: isSubmitting,
                  disabled: isSubmitting,
                }}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.googleButton,
                  isSubmitting && styles.googleButtonDisabled,
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

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Já tem conta?</Text>

                <Pressable accessibilityRole="link" onPress={handleLogin}>
                  <Text style={styles.loginLink}>Entrar</Text>
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
    fontWeight: theme.fontWeights.bold,
    marginBottom: 6,
  },
  subtitle: {
    color: theme.colors.textSecondary,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
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
  createButton: {
    height: theme.sizes.control,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  createButtonDisabled: {
    opacity: theme.opacity.pressedSoft,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.small,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  createButtonText: {
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
  googleButtonDisabled: {
    opacity: theme.opacity.pressedSoft,
  },
  googleButtonImage: {
    width: 225,
    height: 50,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 26,
  },
  loginText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.small,
  },
  loginLink: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.semiBold,
    marginLeft: theme.spacing.xs,
  },
  buttonPressed: {
    opacity: theme.opacity.pressed,
  },
});
