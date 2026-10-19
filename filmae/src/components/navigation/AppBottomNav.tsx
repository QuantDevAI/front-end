import { theme } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type BottomNavTab = 'add-movie' | 'collection' | 'discover' | 'home' | 'pipocai' | 'profile';

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
          accessibilityLabel="Adicionar filme assistido"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'add-movie' }}
          onPress={() => router.replace('/adicionar-filme')}
          style={({ pressed }) => [
            styles.centerButton,
            activeTab === 'add-movie' && styles.centerButtonActive,
            pressed && styles.pressed,
          ]}
        >
          <MaterialIcons color={theme.colors.text} name="add" size={22} />
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'pipocai' }}
          onPress={() => router.replace('/pipocai')}
          style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
        >
          <MaterialIcons
            color={activeTab === 'pipocai' ? theme.colors.cream : theme.colors.creamMuted}
            name="smart-toy"
            size={20}
          />
          <Text style={[styles.tabLabel, activeTab === 'pipocai' && styles.tabLabelActive]}>
            Pipoca.i
          </Text>
        </Pressable>

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
  centerButtonActive: {
    transform: [{ scale: 1.04 }],
  },
  pressed: {
    opacity: theme.opacity.pressed,
  },
});
