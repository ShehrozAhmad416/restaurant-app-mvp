import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Shown until AsyncStorage data has loaded, so the app never flashes empty data.
export default function LoadingScreen({ message = 'Loading your data…' }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.brand, { color: colors.primary }]}>Saffron Table</Text>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  brand: { fontSize: 26, fontWeight: '800' },
  message: { fontSize: 15 },
});
