import { VoiceNotePlayer, formatDuration } from '@/components/voice-note/VoiceNotePlayer';
import { theme } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

type VoiceNoteRecorderProps = {
  onChange: (uri: string | null) => void;
  uri: string | null;
};

export function VoiceNoteRecorder({ onChange, uri }: VoiceNoteRecorderProps) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const [isPreparing, setIsPreparing] = useState(false);

  const startRecording = async () => {
    setIsPreparing(true);

    try {
      const permission = await requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Libere o acesso ao microfone nas configurações do aparelho para gravar o comentário.',
          [
            { style: 'cancel', text: 'Agora não' },
            { onPress: () => void Linking.openSettings(), text: 'Abrir configurações' },
          ],
        );
        return;
      }

      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      Alert.alert('Não foi possível gravar', 'Tente novamente em instantes.');
    } finally {
      setIsPreparing(false);
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });

      if (recorder.uri) {
        onChange(recorder.uri);
      }
    } catch {
      Alert.alert('Não foi possível salvar a gravação', 'Tente gravar novamente.');
    }
  };

  if (recorderState.isRecording) {
    return (
      <View style={styles.recordingRow}>
        <View style={styles.recordingDot} />
        <Text style={styles.recordingText}>
          Gravando... {formatDuration(recorderState.durationMillis / 1000)}
        </Text>
        <Pressable
          accessibilityLabel="Parar gravação"
          accessibilityRole="button"
          onPress={() => void stopRecording()}
          style={({ pressed }) => [styles.stopButton, pressed && styles.pressed]}
        >
          <MaterialIcons color={theme.colors.text} name="stop" size={22} />
        </Pressable>
      </View>
    );
  }

  if (uri) {
    return (
      <View>
        <VoiceNotePlayer key={uri} uri={uri} />

        <View style={styles.actionsRow}>
          <Pressable
            accessibilityRole="button"
            disabled={isPreparing}
            onPress={() => void startRecording()}
            style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
          >
            <MaterialIcons color={theme.colors.cream} name="mic" size={18} />
            <Text style={styles.outlineButtonText}>Gravar de novo</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => onChange(null)}
            style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
          >
            <MaterialIcons color={theme.colors.danger} name="delete-outline" size={18} />
            <Text style={styles.removeText}>Remover</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isPreparing}
      onPress={() => void startRecording()}
      style={({ pressed }) => [styles.recordButton, pressed && styles.pressed]}
    >
      <MaterialIcons color={theme.colors.text} name="mic" size={20} />
      <Text style={styles.recordButtonText}>
        {isPreparing ? 'Preparando...' : 'Gravar comentário'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  recordButton: {
    height: 46,
    borderRadius: theme.radii.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
  },
  recordButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.semiBold,
  },
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.danger,
  },
  recordingText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
  },
  stopButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.danger,
  },
  actionsRow: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  outlineButton: {
    flex: 1,
    height: 40,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.warmBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  outlineButtonText: {
    color: theme.colors.cream,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.medium,
  },
  removeText: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.medium,
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
});
