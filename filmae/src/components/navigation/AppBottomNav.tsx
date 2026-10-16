import { theme } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type BottomNavTab = 'collection' | 'discover' | 'home' | 'profile';

type AppBottomNavProps = {
  activeTab: BottomNavTab;
};

export function AppBottomNav({ activeTab }: AppBottomNavProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'home' }}
          onPress={() => router.replace('/home')}
          style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
        >
          <MaterialIcons
            color={activeTab === 'home' ? theme.colors.cream : theme.colors.creamMuted}
            name="home-filled"
            size={20}
          />
          <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>
            Início
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'discover' }}
          onPress={() => router.replace('/descobrir')}
          style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
        >
          <MaterialIcons
            color={activeTab === 'discover' ? theme.colors.cream : theme.colors.creamMuted}
            name="search"
            size={20}
          />
          <Text style={[styles.tabLabel, activeTab === 'discover' && styles.tabLabelActive]}>
            Descobrir
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'collection' }}
          onPress={() => router.replace('/colecao')}
          style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
        >
          <MaterialIcons
            color={activeTab === 'collection' ? theme.colors.cream : theme.colors.creamMuted}
            name="video-library"
            size={20}
          />
          <Text style={[styles.tabLabel, activeTab === 'collection' && styles.tabLabelActive]}>
            Coleção
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/filme-do-dia')}
          style={({ pressed }) => [styles.centerButton, pressed && styles.pressed]}
        >
          <MaterialIcons color={theme.colors.text} name="add" size={22} />
        </Pressable>

        <View style={styles.tabButton}>
          <MaterialIcons color={theme.colors.creamMuted} name="smart-toy" size={20} />
          <Text style={styles.tabLabel}>Pipoca.i</Text>
        </View>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'profile' }}
          onPress={() => router.replace('/perfil')}
          style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
        >
          <MaterialIcons
            color={activeTab === 'profile' ? theme.colors.cream : theme.colors.creamMuted}
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={20}
          />
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>
            Perfil
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopColor: theme.colors.warmBorder,
    borderTopWidth: 1,
    backgroundColor: theme.colors.warmBackground,
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    justifyContent: 'center',
    minHeight: 42,
  },
  tabLabel: {
    color: theme.colors.creamMuted,
    fontSize: 10,
    fontWeight: theme.fontWeights.medium,
  },
  tabLabelActive: {
    color: theme.colors.cream,
  },
  centerButton: {
    width: 42,
    height: 42,
    borderRadius: theme.radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    marginHorizontal: theme.spacing.xs,
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
});
