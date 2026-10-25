import { theme } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function formatDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

type VoiceNotePlayerProps = {
  uri: string;
};

export function VoiceNotePlayer({ uri }: VoiceNotePlayerProps) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  const progress = status.duration > 0 ? Math.min(status.currentTime / status.duration, 1) : 0;

  const togglePlayback = async () => {
    if (status.playing) {
      player.pause();
      return;
    }

    try {
      // No iPhone, sem isso o áudio não toca com o aparelho no modo silencioso.
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });

      if (status.duration > 0 && status.currentTime >= status.duration - 0.1) {
        await player.seekTo(0);
      }

      player.play();
    } catch {
      // Se não conseguir tocar, o botão simplesmente não muda de estado.
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel={
          status.playing ? 'Pausar comentário em áudio' : 'Ouvir comentário em áudio'
        }
        accessibilityRole="button"
        onPress={() => void togglePlayback()}
        style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}
      >
        <MaterialIcons
          color={theme.colors.text}
          name={status.playing ? 'pause' : 'play-arrow'}
          size={24}
        />
      </Pressable>

      <View style={styles.progressArea}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.timeText}>
          {formatDuration(status.currentTime)} / {formatDuration(status.duration)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  progressArea: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  track: {
    height: 6,
    borderRadius: theme.radii.round,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  fill: {
    height: '100%',
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primary,
  },
  timeText: {
    color: theme.colors.creamMuted,
    fontSize: theme.fontSizes.caption,
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
});
