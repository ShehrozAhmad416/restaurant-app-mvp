import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CART_ACTIONS } from '../reducers/cartReducer';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { resetRoot } from '../navigation/navigationRef';
import { getInitials } from '../utils/format';
import { confirmAction } from '../utils/confirm';

// Question 6: reads the user from AuthContext and the theme from ThemeContext.
export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { dispatch: cartDispatch } = useCart();

  if (!user) return null;

  const handleLogout = () =>
    confirmAction({
      title: 'Log out?',
      message: 'Your cart will be cleared.',
      confirmText: 'Log out',
      cancelText: 'Stay',
      destructive: true,
      onConfirm: () => {
        cartDispatch({ type: CART_ACTIONS.CLEAR_CART });
        logout();
        resetRoot('Login'); // reset the whole navigation stack to Login
      },
    });

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Card style={styles.userCard}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.onPrimary }]}>{getInitials(user.fullName)}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={[styles.name, { color: colors.text }]}>{user.fullName}</Text>
          <Text style={[styles.email, { color: colors.muted }]}>{user.email}</Text>
          <View style={[styles.rolePill, { backgroundColor: colors.successSoft }]}>
            <Text style={[styles.roleText, { color: colors.success }]}>{user.role === 'manager' ? 'Manager' : 'Customer'}</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.settingRow}>
        <View style={styles.flex}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Dark mode</Text>
          <Text style={[styles.email, { color: colors.muted }]}>Changes every screen instantly</Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          accessibilityLabel="Dark mode"
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      </Card>

      <PrimaryButton title="Log out" variant="danger" onPress={handleLogout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14 },
  flex: { flex: 1, gap: 4 },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800' },
  email: { fontSize: 14 },
  rolePill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, marginTop: 2 },
  roleText: { fontSize: 12, fontWeight: '700' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingTitle: { fontSize: 16, fontWeight: '700' },
});
