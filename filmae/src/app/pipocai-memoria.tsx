import { AppBottomNav } from '@/components/navigation/AppBottomNav';
import { pipocaiService } from '@/services/pipocai.service';
import { theme } from '@/theme';
import type { PipocaiMemoryEntry } from '@/types/pipocai';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

export default function PipocaiMemoryScreen() {
  const [draftMemory, setDraftMemory] = useState('');
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [memories, setMemories] = useState<PipocaiMemoryEntry[]>([]);

  const loadMemories = useCallback(async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const payload = await pipocaiService.getMemories();
      setMemories(payload);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível carregar as memórias.';
      setErrorMessage(message);
      setMemories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadMemories();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadMemories]);

  const hasPendingInput = useMemo(
    () => draftMemory.trim().length > 0 && !isMutating,
    [draftMemory, isMutating],
  );

  const addMemory = useCallback(async () => {
    const text = draftMemory.trim();

    if (!text) {
      return;
    }

    setErrorMessage(null);
    setIsMutating(true);

    try {
      const payload = await pipocaiService.addMemory({ text });
      setMemories(payload);
      setDraftMemory('');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível adicionar a memória.';
      setErrorMessage(message);
    } finally {
      setIsMutating(false);
    }
  }, [draftMemory]);

  const removeMemory = useCallback(async (memoryId: string) => {
    setErrorMessage(null);
    setIsMutating(true);

    try {
      const payload = await pipocaiService.deleteMemory(memoryId);
      setMemories(payload);
      setEditingMemoryId((currentId) => (currentId === memoryId ? null : currentId));
      setEditingText('');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível remover esta memória.';
      setErrorMessage(message);
    } finally {
      setIsMutating(false);
    }
  }, []);

  const startEditingMemory = useCallback((memory: PipocaiMemoryEntry) => {
    setEditingMemoryId(memory.id);
    setEditingText(memory.text);
  }, []);

  const saveMemoryEdition = useCallback(async () => {
    if (!editingMemoryId) {
      return;
    }

    setErrorMessage(null);
    setIsMutating(true);

    try {
      const payload = await pipocaiService.updateMemory(editingMemoryId, { text: editingText });
      setMemories(payload);
      setEditingMemoryId(null);
      setEditingText('');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível atualizar esta memória.';
      setErrorMessage(message);
    } finally {
      setIsMutating(false);
    }
  }, [editingMemoryId, editingText]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Voltar para Pipocai"
            accessibilityRole="button"
            onPress={() => router.replace('/pipocai')}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <MaterialIcons color={theme.colors.creamMuted} name="arrow-back" size={20} />
          </Pressable>

          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle}>Memória do Pipocai</Text>
            <Text style={styles.headerSubtitle}>
              O contexto que melhora as recomendações para você
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={styles.stateText}>Carregando memórias...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {errorMessage ? (
              <View style={styles.warningBanner}>
                <Text accessibilityLiveRegion="polite" style={styles.warningText}>
                  {errorMessage}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void loadMemories()}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
                >
                  <Text style={styles.retryButtonText}>Atualizar</Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.infoCard}>
              <MaterialIcons color={theme.colors.primary} name="psychology" size={18} />
              <Text style={styles.infoText}>
                Você pode editar ou remover qualquer memória. Isso ajuda o Pipocai a recomendar com
                mais contexto.
              </Text>
            </View>

            {memories.map((memory) => {
              const isEditing = editingMemoryId === memory.id;

              return (
                <View key={memory.id} style={styles.memoryCard}>
                  {isEditing ? (
                    <View style={styles.editingArea}>
                      <TextInput
                        accessibilityLabel="Editar memória"
                        autoCapitalize="sentences"
                        autoCorrect
                        editable={!isMutating}
                        multiline
                        onChangeText={setEditingText}
                        style={styles.editInput}
                        value={editingText}
                      />
                      <View style={styles.editActions}>
                        <Pressable
                          accessibilityRole="button"
                          disabled={isMutating}
                          onPress={() => void saveMemoryEdition()}
                          style={({ pressed }) => [
                            styles.primaryInlineButton,
                            pressed && styles.pressed,
                            isMutating && styles.disabledAction,
                          ]}
                        >
                          <Text style={styles.primaryInlineButtonText}>Salvar</Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          disabled={isMutating}
                          onPress={() => {
                            setEditingMemoryId(null);
                            setEditingText('');
                          }}
                          style={({ pressed }) => [
                            styles.secondaryInlineButton,
                            pressed && styles.pressed,
                            isMutating && styles.disabledAction,
                          ]}
                        >
                          <Text style={styles.secondaryInlineButtonText}>Cancelar</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.memoryContent}>
                      <View style={styles.memoryTextContainer}>
                        <Text style={styles.memoryText}>{memory.text}</Text>
                        <Text style={styles.memoryDate}>
                          Atualizada em{' '}
                          {new Date(memory.updatedAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                      <View style={styles.memoryActions}>
                        <Pressable
                          accessibilityLabel="Editar memória"
                          accessibilityRole="button"
                          disabled={isMutating}
                          onPress={() => startEditingMemory(memory)}
                          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                        >
                          <MaterialIcons color={theme.colors.creamMuted} name="edit" size={18} />
                        </Pressable>
                        <Pressable
                          accessibilityLabel="Remover memória"
                          accessibilityRole="button"
                          disabled={isMutating}
                          onPress={() => void removeMemory(memory.id)}
                          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                        >
                          <MaterialIcons
                            color={theme.colors.danger}
                            name="delete-outline"
                            size={19}
                          />
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}

            <View style={styles.memoryCard}>
              <Text style={styles.addTitle}>Adicionar memória</Text>
              <TextInput
                accessibilityLabel="Nova memória para o Pipocai"
                autoCapitalize="sentences"
                autoCorrect
                editable={!isMutating}
                multiline
                onChangeText={setDraftMemory}
                placeholder="Conte algo sobre seu gosto..."
                placeholderTextColor={theme.colors.placeholder}
                style={styles.addInput}
                value={draftMemory}
              />
              <Pressable
                accessibilityRole="button"
                disabled={!hasPendingInput}
                onPress={() => void addMemory()}
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.pressed,
                  !hasPendingInput && styles.disabledAction,
                ]}
              >
                <Text style={styles.addButtonText}>Adicionar memória</Text>
              </Pressable>
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          </ScrollView>
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
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: theme.fontWeights.bold,
  },
  headerSubtitle: {
    marginTop: 2,
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.small,
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
    fontSize: theme.fontSizes.bodySmall,
    textAlign: 'center',
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
  scrollContent: {
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  infoCard: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.24)',
    backgroundColor: 'rgba(229, 9, 20, 0.08)',
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    color: '#E4E4E7',
    fontSize: theme.fontSizes.small,
    lineHeight: 18,
  },
  memoryCard: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.warmSurface,
    padding: theme.spacing.md,
  },
  memoryContent: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  memoryTextContainer: {
    flex: 1,
  },
  memoryText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    lineHeight: 20,
  },
  memoryDate: {
    marginTop: theme.spacing.xs,
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.caption,
  },
  memoryActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.prototypeSurface,
  },
  editingArea: {
    gap: theme.spacing.sm,
  },
  editInput: {
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
    color: theme.colors.text,
    minHeight: 96,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSizes.body,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  primaryInlineButton: {
    flex: 1,
    height: 40,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  primaryInlineButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.bodySmall,
    fontWeight: theme.fontWeights.semiBold,
  },
  secondaryInlineButton: {
    flex: 1,
    height: 40,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    backgroundColor: theme.colors.prototypeSurface,
  },
  secondaryInlineButtonText: {
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.bodySmall,
    fontWeight: theme.fontWeights.medium,
  },
  addTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  addInput: {
    marginTop: theme.spacing.sm,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
    backgroundColor: theme.colors.prototypeSurface,
    color: theme.colors.text,
    minHeight: 96,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSizes.body,
    textAlignVertical: 'top',
  },
  addButton: {
    marginTop: theme.spacing.sm,
    height: 44,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  addButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  disabledAction: {
    opacity: 0.45,
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
});
