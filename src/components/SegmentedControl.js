import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius } from '../theme/colors';

// options: [{ value, label }]
export default function SegmentedControl({ options, value, onChange, style }) {
  const { colors } = useTheme();
  return (
    <View accessibilityRole="tablist" style={[styles.track, { backgroundColor: colors.chip }, style]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, active && { backgroundColor: colors.card }]}
          >
            <Text style={[styles.label, { color: active ? colors.primary : colors.muted }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', padding: 4, borderRadius: radius.md, gap: 4 },
  segment: { flex: 1, minHeight: 44, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  label: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
