import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: safeAreaInsets.top + 24, paddingBottom: safeAreaInsets.bottom + 24 },
      ]}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>
            Organize your tasks and stay on top of your daily goals.
          </Text>

          <Pressable
            style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
            onPress={() => Linking.openURL('https://docs.expo.dev')}>
            <Text style={styles.linkText}>Expo Documentation</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F7F1F2',
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  container: {
    flex: 1,
  },
  titleContainer: {
    gap: 12,
    alignItems: 'center',
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#24171B',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 15,
    color: '#9A858A',
  },
  pressed: {
    opacity: 0.7,
  },
  linkButton: {
    marginTop: 12,
    backgroundColor: '#6B1D2F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  linkText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});