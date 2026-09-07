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
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);

    function handleVoltar() {
        router.back();
    }

    function handleLogin() {
        console.log('E-mail:', email);
        console.log('Senha:', senha);

        // Depois vamos conectar com a API.
    }

    function handleEsqueciSenha() {
        console.log('Esqueci minha senha');

        // Depois vamos criar a tela de recuperação de senha.
    }

    function handleGoogle() {
        console.log('Login com Google');

        // Depois vamos implementar a autenticação com Google.
    }

    function handleCadastro() {
        router.push('/cadastro');
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#160A0A', '#090909']}
                style={styles.background}
            >
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
                            {/* Botão voltar */}
                            <Pressable
                                style={styles.backButton}
                                onPress={handleVoltar}
                            >
                                <MaterialIcons
                                    name="arrow-back-ios"
                                    size={18}
                                    color="#777777"
                                />
                            </Pressable>

                            {/* Título */}
                            <View style={styles.header}>
                                <Text style={styles.title}>
                                    Bem-vindo de volta
                                </Text>

                                <Text style={styles.subtitle}>
                                    Entre na sua conta Filmaê
                                </Text>
                            </View>

                            {/* E-mail */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    E-mail
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="seu@email.com"
                                    placeholderTextColor="#5C5C66"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            {/* Senha */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Senha
                                </Text>

                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="••••••••"
                                        placeholderTextColor="#5C5C66"
                                        value={senha}
                                        onChangeText={setSenha}
                                        secureTextEntry={!mostrarSenha}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />

                                    <Pressable
                                        style={styles.eyeButton}
                                        onPress={() =>
                                            setMostrarSenha(!mostrarSenha)
                                        }
                                    >
                                        <MaterialIcons
                                            name={
                                                mostrarSenha
                                                    ? 'visibility'
                                                    : 'visibility-off'
                                            }
                                            size={18}
                                            color="#66666F"
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            {/* Esqueci minha senha */}
                            <Pressable
                                style={styles.forgotButton}
                                onPress={handleEsqueciSenha}
                            >
                                <Text style={styles.forgotText}>
                                    Esqueci minha senha
                                </Text>
                            </Pressable>

                            {/* Botão entrar */}
                            <Pressable
                                style={({ pressed }) => [
                                    styles.loginButton,
                                    pressed && styles.buttonPressed,
                                ]}
                                onPress={handleLogin}
                            >
                                <Text style={styles.loginButtonText}>
                                    Entrar
                                </Text>
                            </Pressable>

                            {/* Divisor */}
                            <View style={styles.dividerContainer}>
                                <View style={styles.divider} />

                                <Text style={styles.dividerText}>
                                    ou
                                </Text>

                                <View style={styles.divider} />
                            </View>

                            {/* Google */}
                            <Pressable
                                style={({ pressed }) => [
                                    styles.googleButton,
                                    pressed && styles.buttonPressed,
                                ]}
                                onPress={handleGoogle}
                            >
                                <Text style={styles.googleLogo}>
                                    G
                                </Text>

                                <Text style={styles.googleText}>
                                    Continuar com Google
                                </Text>
                            </Pressable>

                            {/* Cadastro */}
                            <View style={styles.registerContainer}>
                                <Text style={styles.registerText}>
                                    Não tem conta?
                                </Text>

                                <Pressable onPress={handleCadastro}>
                                    <Text style={styles.registerLink}>
                                        Criar conta
                                    </Text>
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
        backgroundColor: '#090909',
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
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 30,
    },

    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginBottom: 8,
    },

    header: {
        marginBottom: 28,
    },

    title: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: '700',
        marginBottom: 6,
    },

    subtitle: {
        color: '#777777',
        fontSize: 13,
    },

    inputGroup: {
        marginBottom: 18,
    },

    label: {
        color: '#85858D',
        fontSize: 12,
        marginBottom: 8,
    },

    input: {
        height: 50,
        backgroundColor: '#19191D',
        borderWidth: 1,
        borderColor: '#33333A',
        borderRadius: 9,
        paddingHorizontal: 14,
        color: '#FFFFFF',
        fontSize: 15,
    },

    passwordContainer: {
        height: 50,
        backgroundColor: '#19191D',
        borderWidth: 1,
        borderColor: '#33333A',
        borderRadius: 9,
        flexDirection: 'row',
        alignItems: 'center',
    },

    passwordInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 14,
        color: '#FFFFFF',
        fontSize: 15,
    },

    eyeButton: {
        width: 48,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    forgotButton: {
        alignSelf: 'flex-start',
        marginTop: -4,
        marginBottom: 20,
    },

    forgotText: {
        color: '#F0000F',
        fontSize: 12,
        fontWeight: '600',
    },

    loginButton: {
        height: 50,
        borderRadius: 9,
        backgroundColor: '#F0000F',
        justifyContent: 'center',
        alignItems: 'center',
    },

    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },

    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 18,
    },

    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#2D2D31',
    },

    dividerText: {
        color: '#777777',
        fontSize: 12,
        marginHorizontal: 14,
    },

    googleButton: {
        height: 50,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: '#36363C',
        backgroundColor: '#19191D',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    googleLogo: {
        color: '#4285F4',
        fontSize: 18,
        fontWeight: '700',
        marginRight: 9,
    },

    googleText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 26,
    },

    registerText: {
        color: '#777777',
        fontSize: 12,
    },

    registerLink: {
        color: '#F0000F',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },

    buttonPressed: {
        opacity: 0.7,
    },
});