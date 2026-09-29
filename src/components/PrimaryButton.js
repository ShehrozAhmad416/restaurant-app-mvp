import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius } from '../theme/colors';

// variant: 'primary' | 'secondary' | 'danger' | 'ghost'
export default function PrimaryButton({ title, onPress, variant = 'primary', disabled = false, loading = false, style, accessibilityLabel }) {
  const { colors } = useTheme();
  const palette = {
    primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
    secondary: { bg: 'transparent', fg: colors.text, border: colors.border },
    danger: { bg: 'transparent', fg: colors.danger, border: colors.danger },
    success: { bg: colors.success, fg: colors.onSuccess, border: colors.success },
    ghost: { bg: 'transparent', fg: colors.muted, border: 'transparent' },
  }[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg, borderColor: palette.border, opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading && <ActivityIndicator color={palette.fg} style={styles.spinner} />}
      <Text style={[styles.label, { color: palette.fg }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 16, fontWeight: '700' },
  spinner: { marginRight: 10 },
});
