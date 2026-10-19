import type { MovieOption } from '@/data/preferences';
import { theme } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type MoviePosterCardProps = {
  height: number;
  movie: MovieOption;
  onPress: () => void;
  selected: boolean;
  width: number;
};

const FILM_STRIP_HOLES = Array.from({ length: 7 }, (_, index) => index);

export function MoviePosterCard({ height, movie, onPress, selected, width }: MoviePosterCardProps) {
  return (
    <Pressable
      accessibilityLabel={`${selected ? 'Remover' : 'Selecionar'} ${movie.title}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.container, { height, width }, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={movie.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.poster}
      >
        {movie.posterSource ? (
          <>
            <Image source={movie.posterSource} resizeMode="cover" style={styles.posterImage} />
            <View style={styles.posterShade} />
          </>
        ) : null}

        <View style={[styles.accentGlow, { backgroundColor: movie.accentColor }]} />

        <View style={styles.filmStrip}>
          {FILM_STRIP_HOLES.map((hole) => (
            <View key={hole} style={styles.filmStripHole} />
          ))}
        </View>

        <View style={styles.content}>
          <Text style={[styles.year, { color: movie.accentColor }]}>{movie.year}</Text>

          <Text numberOfLines={2} style={styles.title}>
            {movie.title}
          </Text>

          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={11} color={theme.colors.rating} />
            <Text style={styles.rating}>{movie.imdb.toFixed(1)}</Text>
          </View>
        </View>

        {selected ? (
          <View style={styles.selectedOverlay}>
            <View style={styles.checkCircle}>
              <MaterialIcons name="check" size={18} color={theme.colors.text} />
            </View>
          </View>
        ) : null}
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
  poster: {
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  posterImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  posterShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: theme.colors.posterShade,
  },
  accentGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: theme.radii.round,
    top: 12,
    right: 8,
    opacity: 0.22,
  },
  filmStrip: {
    position: 'absolute',
    left: 3,
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
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.selectedOverlay,
    borderColor: theme.colors.primary,
    borderRadius: theme.radii.md,
    borderWidth: 2,
  },
  checkCircle: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primary,
  },
});
