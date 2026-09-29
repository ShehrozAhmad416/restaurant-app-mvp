import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius } from '../theme/colors';

// Labelled, controlled TextInput with an inline error message.
export default function FormField({ label, error, right, style, inputRef, ...inputProps }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={[styles.label, { color: colors.text }]}>{label}</Text> : null}
      <View
        style={[
          styles.inputRow,
          { backgroundColor: colors.card, borderColor: error ? colors.danger : colors.border },
        ]}
      >
        <TextInput
          ref={inputRef}
          placeholderTextColor={colors.muted}
          accessibilityLabel={label}
          style={[styles.input, { color: colors.text }]}
          {...inputProps}
        />
        {right}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={[styles.error, { color: colors.danger }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600' },
  inputRow: {
    minHeight: 50,
    borderWidth: 1.5,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 6,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 12 },
  error: { fontSize: 13 },
});
