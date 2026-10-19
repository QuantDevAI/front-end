import { useRegistration } from '@/context/RegistrationContext';
import { GENRES } from '@/data/preferences';
import { theme } from '@/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MINIMUM_GENRES = 3;

export default function GenrePreferencesScreen() {
  const { genreIds, saveGenres } = useRegistration();
  const [selectedIds, setSelectedIds] = useState(() => new Set(genreIds));

  function toggleGenre(genreId: string) {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(genreId)) {
        nextIds.delete(genreId);
      } else {
        nextIds.add(genreId);
      }

      return nextIds;
    });
  }

  function handleBack() {
    saveGenres(Array.from(selectedIds));
    router.back();
  }

  function handleSkip() {
    saveGenres([]);
    router.push('/filmes-favoritos');
  }

  function handleContinue() {
    if (selectedIds.size < MINIMUM_GENRES) {
      return;
    }

    saveGenres(Array.from(selectedIds));
    router.push('/filmes-favoritos');
  }

  const selectedLabel = `${selectedIds.size} gênero${selectedIds.size === 1 ? '' : 's'} selecionado${
    selectedIds.size === 1 ? '' : 's'
  }`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.navigationRow}>
          <Pressable
            accessibilityLabel="Voltar para o cadastro"
            accessibilityRole="button"
            onPress={handleBack}
            hitSlop={10}
          >
            <Text style={styles.navigationText}>← Voltar</Text>
          </Pressable>

          <Pressable accessibilityRole="button" onPress={handleSkip} hitSlop={10}>
            <Text style={styles.navigationText}>Deixar para depois</Text>
          </Pressable>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, styles.progressBarActive]} />
          <View style={styles.progressBar} />
          <View style={styles.progressBar} />
        </View>

        <Text style={styles.step}>Passo 1 de 3</Text>

        <Text style={styles.title}>
          Que tipo de filme{`\n`}
          faz seu estilo?
        </Text>

        <Text style={styles.subtitle}>Selecione pelo menos 3 gêneros</Text>
      </View>

      <ScrollView contentContainerStyle={styles.genreContent} showsVerticalScrollIndicator={false}>
        <View style={styles.genreList}>
          {GENRES.map((genre) => {
            const selected = selectedIds.has(genre.id);

            return (
              <Pressable
                key={genre.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => toggleGenre(genre.id)}
                style={({ pressed }) => [
                  styles.genreChip,
                  selected && styles.genreChipSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.genreText, selected && styles.genreTextSelected]}>
                  {genre.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text accessibilityLiveRegion="polite" style={styles.counter}>
          {selectedLabel}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{
            disabled: selectedIds.size < MINIMUM_GENRES,
          }}
          disabled={selectedIds.size < MINIMUM_GENRES}
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.continueButton,
            selectedIds.size < MINIMUM_GENRES && styles.continueButtonDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
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
  header: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  navigationText: {
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.medium,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xxl,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.prototypeBorder,
  },
  progressBarActive: {
    backgroundColor: theme.colors.primary,
  },
  step: {
    color: theme.colors.prototypeMuted,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.medium,
    marginBottom: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: theme.fontWeights.bold,
    lineHeight: 30,
  },
  subtitle: {
    color: theme.colors.prototypeMuted,
    fontSize: theme.fontSizes.body,
    marginTop: theme.spacing.sm,
  },
  genreContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.lg,
  },
  genreList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genreChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.prototypeSurface,
    borderWidth: 1,
    borderColor: theme.colors.prototypeBorder,
  },
  genreChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  genreText: {
    color: theme.colors.prototypeMuted,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.medium,
  },
  genreTextSelected: {
    color: theme.colors.text,
  },
  footer: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  counter: {
    color: theme.colors.prototypeMuted,
    fontSize: theme.fontSizes.small,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  continueButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.primary,
  },
  continueButtonDisabled: {
    opacity: 0.4,
  },
  continueButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.input,
    fontWeight: theme.fontWeights.semiBold,
  },
  pressed: {
    opacity: theme.opacity.pressed,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },
});
