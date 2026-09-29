import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { STATUS_FLOW, ORDER_STATUS } from '../constants/orderStatus';

// Four-step progress indicator: Pending → Preparing → Ready → Served.
export default function StepProgress({ status }) {
  const { colors } = useTheme();
  const currentIndex = STATUS_FLOW.indexOf(status);
  const cancelled = status === ORDER_STATUS.CANCELLED;

  return (
    <View style={styles.row} accessibilityLabel={`Order progress: ${status}`}>
      {STATUS_FLOW.map((step, index) => {
        const done = !cancelled && index <= currentIndex;
        const current = index === currentIndex;
        return (
          <View key={step} style={styles.step}>
            <View style={styles.dotRow}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: done ? colors.primary : colors.card,
                    borderColor: done ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.dotText, { color: done ? colors.onPrimary : colors.muted }]}>
                  {done && !current ? '✓' : index + 1}
                </Text>
              </View>
              {index < STATUS_FLOW.length - 1 && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: !cancelled && index < currentIndex ? colors.primary : colors.border },
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                styles.label,
                { color: done ? colors.text : colors.muted, fontWeight: current ? '700' : '500' },
              ]}
            >
              {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  step: { flex: 1, gap: 6 },
  dotRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dotText: { fontSize: 13, fontWeight: '700' },
  line: { flex: 1, height: 3, marginHorizontal: 4, borderRadius: 2 },
  label: { fontSize: 12 },
});
