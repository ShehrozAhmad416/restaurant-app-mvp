import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius } from '../theme/colors';

export default function Chip({ label, selected = false, disabled = false, onPress, style, textStyle, strikeThrough = false }) {
  const { colors } = useTheme();
  const bg = selected ? colors.primary : disabled ? colors.chip : colors.card;
  const fg = selected ? colors.onPrimary : disabled ? colors.muted : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: bg, borderColor: selected ? colors.primary : colors.border, opacity: pressed ? 0.8 : 1 },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: fg, textDecorationLine: strikeThrough ? 'line-through' : 'none' },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 14, fontWeight: '600' },
});
