import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius } from '../theme/colors';

// Works for both order and reservation statuses.
export default function StatusPill({ status }) {
  const { colors } = useTheme();
  const map = {
    Pending: [colors.warningSoft, colors.warning],
    Preparing: [colors.primarySoft, colors.primary],
    Ready: [colors.successSoft, colors.success],
    Served: [colors.chip, colors.muted],
    Accepted: [colors.successSoft, colors.success],
    Declined: [colors.dangerSoft, colors.danger],
    Cancelled: [colors.dangerSoft, colors.danger],
  };
  const [bg, fg] = map[status] || [colors.chip, colors.muted];
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '700' },
});
