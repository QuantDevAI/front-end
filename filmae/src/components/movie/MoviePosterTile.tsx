import type { MovieListItem } from '@/types/movies';
import { theme } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type MoviePosterTileProps = {
  accentColor: string;
  gradientColors: readonly [string, string, string, string];
  height: number;
  movie: MovieListItem;
  onPress: () => void;
  showCompatibility?: boolean;
  width: number;
};

export function MoviePosterTile({
  accentColor,
  gradientColors,
  height,
  movie,
  onPress,
  showCompatibility = false,
  width,
}: MoviePosterTileProps) {
  return (
    <Pressable
      accessibilityLabel={`Abrir detalhes de ${movie.title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.container, { height, width }, pressed && styles.pressed]}
    >
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <View style={[styles.accentGlow, { backgroundColor: accentColor }]} />

        <View style={styles.filmStrip}>
          {Array.from({ length: 7 }, (_, index) => (
            <View key={index} style={styles.filmStripHole} />
          ))}
        </View>

        <View style={styles.content}>
          <Text style={[styles.year, { color: accentColor }]}>{movie.year}</Text>
          <Text numberOfLines={2} style={styles.title}>
            {movie.title}
          </Text>

          {showCompatibility ? (
            <View style={styles.compatibilityContainer}>
              <View style={styles.compatibilityDot} />
              <Text style={styles.compatibilityText}>{movie.compatibilityScore}%</Text>
            </View>
          ) : null}

          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={11} color={theme.colors.rating} />
            <Text style={styles.rating}>{movie.imdb.rating.toFixed(1)}</Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radii.md,
    overflow: 'hidden',
  },
  pressed: {
    opacity: theme.opacity.pressedSoft,
    transform: [{ scale: 0.98 }],
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  accentGlow: {
    position: 'absolute',
    width: 65,
    height: 65,
    borderRadius: theme.radii.round,
    top: 10,
    right: 8,
    opacity: 0.25,
  },
  filmStrip: {
    position: 'absolute',
    left: 2,
    top: 6,
    bottom: 6,
    justifyContent: 'space-around',
    opacity: 0.2,
  },
  filmStripHole: {
    width: 7,
    height: 10,
    borderRadius: 2,
    backgroundColor: theme.colors.text,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  year: {
    fontSize: theme.fontSizes.caption,
    fontWeight: theme.fontWeights.medium,
    marginBottom: 2,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.bold,
    lineHeight: 15,
  },
  compatibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  compatibilityDot: {
    width: 6,
    height: 6,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primary,
  },
  compatibilityText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.caption,
    fontWeight: theme.fontWeights.semiBold,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  rating: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.caption,
    fontWeight: theme.fontWeights.medium,
    opacity: 0.8,
  },
});
