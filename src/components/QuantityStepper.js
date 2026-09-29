import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius } from '../theme/colors';

export default function QuantityStepper({ value, onDecrement, onIncrement, label = 'Quantity', min, max }) {
  const { colors } = useTheme();
  const button = (symbol, onPress, a11y, disabled) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={[styles.button, { backgroundColor: colors.chip, opacity: disabled ? 0.4 : 1 }]}
    >
      <Text style={[styles.symbol, { color: colors.text }]}>{symbol}</Text>
    </Pressable>
  );
  return (
    <View accessibilityLabel={`${label}: ${value}`} style={[styles.row, { borderColor: colors.border }]}>
      {button('−', onDecrement, `Decrease ${label.toLowerCase()}`, min !== undefined && value <= min)}
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      {button('+', onIncrement, `Increase ${label.toLowerCase()}`, max !== undefined && value >= max)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  button: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  symbol: { fontSize: 22, fontWeight: '600' },
  value: { minWidth: 40, textAlign: 'center', fontSize: 16, fontWeight: '700' },
});
