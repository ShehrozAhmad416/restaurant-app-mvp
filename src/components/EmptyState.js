import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius } from '../theme/colors';

export default function EmptyState({ icon = 'restaurant-outline', title, message, children }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.box, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.successSoft }]}>
        <Ionicons name={icon} size={28} color={colors.success} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {message ? <Text style={[styles.message, { color: colors.muted }]}>{message}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 28, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center', gap: 8 },
  iconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  message: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
