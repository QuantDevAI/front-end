import { AppBottomNav } from '@/components/navigation/AppBottomNav';
import { pipocaiService } from '@/services/pipocai.service';
import { theme } from '@/theme';
import type { PipocaiConversationPayload } from '@/types/pipocai';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

export default function PipocaiScreen() {
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [conversation, setConversation] = useState<PipocaiConversationPayload | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  const loadConversation = useCallback(async () => {
    setLoadErrorMessage(null);
    setActionErrorMessage(null);
    setIsLoading(true);

    try {
      const payload = await pipocaiService.getConversation();
      setConversation(payload);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível carregar o Pipocai.';
      setLoadErrorMessage(message);
      setConversation(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadConversation();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadConversation]);

  useEffect(() => {
    if (!conversation) {
      return;
    }

    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 20);

    return () => {
      clearTimeout(timer);
    };
  }, [conversation]);

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);
  const activeConversation = useMemo(
    () =>
      conversation ?? {
        messages: [],
        suggestedPrompts: [],
      },
    [conversation],
  );

  const sendMessage = useCallback(async (rawText: string) => {
    const text = rawText.trim();

    if (!text) {
      return;
    }

    setActionErrorMessage(null);
    setIsSending(true);
    setInput('');

    try {
      const payload = await pipocaiService.sendMessage({ text });
      setConversation(payload);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível conversar com o Pipocai.';
      setActionErrorMessage(message);
    } finally {
      setIsSending(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerMascot}>
            <MaterialIcons color={theme.colors.text} name="smart-toy" size={20} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Pipocai</Text>
            <Text style={styles.headerStatus}>● Online</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/pipocai-memoria')}
            style={({ pressed }) => [styles.memoryButton, pressed && styles.pressed]}
          >
            <Text style={styles.memoryButtonText}>Memória</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={styles.stateText}>Conectando com Pipocai...</Text>
          </View>
        ) : (
          <View style={styles.chatContainer}>
            {loadErrorMessage ? (
              <View style={styles.warningBanner}>
                <Text accessibilityLiveRegion="polite" style={styles.warningText}>
                  {loadErrorMessage}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void loadConversation()}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
                >
                  <Text style={styles.retryButtonText}>Atualizar</Text>
                </Pressable>
              </View>
            ) : null}

            <ScrollView
              ref={scrollRef}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {activeConversation.messages.map((message) => {
                const recommendation = message.recommendation;

                return (
                  <View
                    key={message.id}
                    style={[
                      styles.messageRow,
                      message.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant,
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          message.role === 'user'
                            ? styles.userMessageText
                            : styles.assistantMessageText,
                        ]}
                      >
                        {message.text}
                      </Text>
                    </View>

                    {message.role === 'assistant' && recommendation ? (
                      <View style={styles.recommendationCard}>
                        <Text style={styles.recommendationTitle}>
                          {recommendation.title} ({recommendation.year})
                        </Text>
                        <Text style={styles.recommendationReason}>{recommendation.reason}</Text>
                        <Text style={styles.recommendationBadge}>
                          {recommendation.compatibilityScore}% compatível
                        </Text>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() =>
                            router.push({
                              pathname: '/filme/[id]',
                              params: { id: recommendation.movieId },
                            })
                          }
                          style={({ pressed }) => [
                            styles.recommendationButton,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Text style={styles.recommendationButtonText}>Ver filme</Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                );
              })}

              {isSending ? (
                <View style={[styles.messageRow, styles.messageRowAssistant]}>
                  <View style={[styles.messageBubble, styles.assistantBubble]}>
                    <Text style={styles.assistantMessageText}>Pipocai está pensando...</Text>
                  </View>
                </View>
              ) : null}

              {!activeConversation.messages.length ? (
                <View style={styles.emptyConversationCard}>
                  <Text style={styles.emptyConversationTitle}>Sem conversa disponível</Text>
                  <Text style={styles.emptyConversationText}>
                    O chat está acessível, mas o servidor não retornou mensagens.
                  </Text>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.suggestionsRow}>
              {activeConversation.suggestedPrompts.slice(0, 4).map((prompt) => (
                <Pressable
                  key={prompt}
                  accessibilityRole="button"
                  disabled={isSending}
                  onPress={() => void sendMessage(prompt)}
                  style={({ pressed }) => [
                    styles.suggestionChip,
                    pressed && styles.pressed,
                    isSending && styles.disabledChip,
                  ]}
                >
                  <Text style={styles.suggestionChipText}>{prompt}</Text>
                </Pressable>
              ))}
            </View>

            {actionErrorMessage ? (
              <Text style={styles.inlineError}>{actionErrorMessage}</Text>
            ) : null}

            <View style={styles.inputRow}>
              <TextInput
                accessibilityLabel="Mensagem para o Pipocai"
                autoCapitalize="sentences"
                autoCorrect
                editable={!isSending}
                onChangeText={setInput}
                onSubmitEditing={() => {
                  if (canSend) {
                    void sendMessage(input);
                  }
                }}
                placeholder="Converse com o Pipocai..."
                placeholderTextColor={theme.colors.placeholder}
                style={styles.input}
                value={input}
              />
              <Pressable
                accessibilityLabel="Enviar mensagem"
                accessibilityRole="button"
                disabled={!canSend}
                onPress={() => void sendMessage(input)}
                style={({ pressed }) => [
                  styles.sendButton,
                  pressed && styles.pressed,
                  !canSend && styles.disabledButton,
                ]}
              >
                <MaterialIcons color={theme.colors.text} name="send" size={18} />
              </Pressable>
            </View>
          </View>
        )}

        <AppBottomNav activeTab="pipocai" />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.warmBorder,
  },
  headerMascot: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.bold,
  },
  headerStatus: {
    marginTop: 2,
    color: '#22C55E',
    fontSize: theme.fontSizes.caption,
  },
  memoryButton: {
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  memoryButtonText: {
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.medium,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  messageRow: {
    width: '100%',
    gap: theme.spacing.xs,
  },
  messageRowUser: {
    alignItems: 'flex-end',
  },
  messageRowAssistant: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: theme.radii.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  userBubble: {
    borderTopRightRadius: theme.radii.sm,
    backgroundColor: theme.colors.primary,
  },
  assistantBubble: {
    borderTopLeftRadius: theme.radii.sm,
    backgroundColor: theme.colors.prototypeSurface,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
  },
  messageText: {
    fontSize: theme.fontSizes.body,
    lineHeight: 20,
  },
  userMessageText: {
    color: theme.colors.text,
  },
  assistantMessageText: {
    color: '#E4E4E7',
  },
  recommendationCard: {
    width: '86%',
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.25)',
    backgroundColor: 'rgba(11, 11, 13, 0.9)',
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  recommendationTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.bold,
  },
  recommendationReason: {
    color: '#E4E4E7',
    fontSize: theme.fontSizes.small,
    lineHeight: 18,
  },
  recommendationBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primaryTransparent,
    color: theme.colors.primaryBright,
    fontSize: theme.fontSizes.caption,
    fontWeight: theme.fontWeights.bold,
  },
  recommendationButton: {
    marginTop: theme.spacing.xs,
    height: 36,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  recommendationButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.semiBold,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.sm,
  },
  suggestionChip: {
    borderRadius: theme.radii.round,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  suggestionChipText: {
    color: '#E4E4E7',
    fontSize: theme.fontSizes.small,
  },
  disabledChip: {
    opacity: 0.4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.warmBorder,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSizes.body,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  disabledButton: {
    opacity: 0.45,
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
  inlineError: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.small,
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.xs,
  },
  retryButton: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    height: 44,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.warmSurface,
  },
  retryButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  warningBanner: {
    marginHorizontal: theme.spacing.xxl,
    marginTop: theme.spacing.md,
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
  emptyConversationCard: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  emptyConversationTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  emptyConversationText: {
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
    lineHeight: 18,
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
});
