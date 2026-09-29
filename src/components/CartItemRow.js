import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import QuantityStepper from './QuantityStepper';
import { formatPrice } from '../utils/format';
import { radius } from '../theme/colors';

export default function CartItemRow({ line, onIncrement, onDecrement, onRemove, onChangeNote }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.top}>
        <View style={styles.flex}>
          <Text style={[styles.name, { color: colors.text }]}>{line.name}</Text>
          <Text style={[styles.unit, { color: colors.muted }]}>{formatPrice(line.price)} each</Text>
        </View>
        <Text style={[styles.total, { color: colors.text }]}>{formatPrice(line.price * line.quantity)}</Text>
      </View>
      <View style={styles.controls}>
        <QuantityStepper value={line.quantity} onDecrement={() => onDecrement(line.id)} onIncrement={() => onIncrement(line.id)} />
        <Pressable onPress={() => onRemove(line.id)} accessibilityRole="button" accessibilityLabel={`Remove ${line.name}`} style={styles.remove}>
          <Text style={[styles.removeText, { color: colors.danger }]}>Remove</Text>
        </Pressable>
      </View>
      <TextInput
        value={line.note}
        onChangeText={(text) => onChangeNote(line.id, text)}
        placeholder="Special instructions, e.g. no onions"
        placeholderTextColor={colors.muted}
        accessibilityLabel={`Special instructions for ${line.name}`}
        style={[styles.note, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: radius.lg, borderWidth: 1, gap: 10 },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  flex: { flex: 1, gap: 2 },
  name: { fontSize: 15, fontWeight: '700' },
  unit: { fontSize: 13 },
  total: { fontSize: 15, fontWeight: '700' },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  remove: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  removeText: { fontSize: 14, fontWeight: '700' },
  note: { minHeight: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
});
