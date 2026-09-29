import { StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius } from '../theme/colors';

export default function Card({ children, style }) {
  const { colors } = useTheme();
  return <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: radius.lg, borderWidth: 1, gap: 10 },
});
