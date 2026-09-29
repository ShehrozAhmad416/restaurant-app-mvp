import { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import useForm from '../hooks/useForm';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import SegmentedControl from '../components/SegmentedControl';
import { ROLES } from '../data/users';
import { validateAuthForm } from '../utils/validation';
import { resetRoot } from '../navigation/navigationRef';
import { radius } from '../theme/colors';
import { showMessage } from '../utils/confirm';

const MODE = { LOGIN: 'login', SIGNUP: 'signup' };
const INITIAL_VALUES = { fullName: '', email: '', password: '', confirmPassword: '', role: ROLES.CUSTOMER };
const NETWORK_DELAY_MS = 1000;

/**
 * Question 3 (useState): mode, showPassword and isSubmitting are separate state.
 * Question 6 (useContext): a successful login stores the user in AuthContext.
 * Question 9 (custom hooks): form values and errors come from useForm.
 */
export default function LoginScreen() {
  const { colors } = useTheme();
  const { users, login, registerUser } = useAuth();

  const [mode, setMode] = useState(MODE.LOGIN);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback((values) => validateAuthForm(values, mode), [mode]);
  const { values, errors, handleChange, handleSubmit, setFieldValue, reset, setErrors } = useForm(INITIAL_VALUES, validate);

  // Clear the fake network timer if the screen unmounts mid-request.
  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrors({});
  };

  const goToHome = (account) => {
    login(account);
    // Customer -> Menu, Manager -> Dashboard. reset() clears the Login screen from history.
    resetRoot('Main', { screen: account.role === ROLES.MANAGER ? 'DashboardTab' : 'MenuTab' });
  };

  const onValid = (formValues) => {
    setIsSubmitting(true);
    timerRef.current = setTimeout(() => {
      const email = formValues.email.trim().toLowerCase();
      if (mode === MODE.LOGIN) {
        const account = users.find((u) => u.email.toLowerCase() === email && u.password === formValues.password);
        setIsSubmitting(false);
        if (!account) {
          showMessage('Login failed', 'That email and password don’t match any account. Check them and try again.');
          return;
        }
        reset();
        goToHome(account);
      } else {
        setIsSubmitting(false);
        if (users.some((u) => u.email.toLowerCase() === email)) {
          showMessage('Signup failed', 'An account with this email already exists. Log in instead.');
          return;
        }
        const account = {
          id: `u${Date.now()}`,
          fullName: formValues.fullName.trim(),
          email,
          password: formValues.password,
          role: formValues.role,
        };
        registerUser(account);
        reset();
        goToHome(account);
      }
    }, NETWORK_DELAY_MS);
  };

  const fillDemo = (email, password) => {
    switchMode(MODE.LOGIN);
    reset({ ...INITIAL_VALUES, email, password });
  };

  const isSignup = mode === MODE.SIGNUP;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.brand, { color: colors.primary }]}>SAFFRON TABLE</Text>
            <Text style={[styles.title, { color: colors.text }]}>{isSignup ? 'Create your account' : 'Welcome back'}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {isSignup
                ? 'Order ahead and reserve tables in a few taps.'
                : 'Skip the queue: browse the menu, book a table and order from your phone.'}
            </Text>
          </View>

          <SegmentedControl
            options={[
              { value: MODE.LOGIN, label: 'Log in' },
              { value: MODE.SIGNUP, label: 'Sign up' },
            ]}
            value={mode}
            onChange={switchMode}
          />

          {isSignup && (
            <FormField
              label="Full name"
              value={values.fullName}
              onChangeText={handleChange('fullName')}
              placeholder="Ayesha Khan"
              autoCapitalize="words"
              error={errors.fullName}
            />
          )}
          <FormField
            label="Email"
            value={values.email}
            onChangeText={handleChange('email')}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
          />
          <FormField
            label="Password"
            value={values.password}
            onChangeText={handleChange('password')}
            placeholder="8+ characters, 1 digit"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            error={errors.password}
            right={
              <Pressable
                onPress={() => setShowPassword((prev) => !prev)}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                style={[styles.showButton, { backgroundColor: colors.chip }]}
              >
                <Text style={[styles.showText, { color: colors.text }]}>{showPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            }
          />
          {isSignup && (
            <>
              <FormField
                label="Confirm password"
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                placeholder="Repeat password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                error={errors.confirmPassword}
              />
              <View style={styles.roleBlock}>
                <Text style={[styles.label, { color: colors.text }]}>I am a</Text>
                <SegmentedControl
                  options={[
                    { value: ROLES.CUSTOMER, label: 'Customer' },
                    { value: ROLES.MANAGER, label: 'Manager' },
                  ]}
                  value={values.role}
                  onChange={(role) => setFieldValue('role', role)}
                />
              </View>
            </>
          )}

          <PrimaryButton
            title={isSubmitting ? (isSignup ? 'Creating account…' : 'Logging in…') : isSignup ? 'Create account' : 'Log in'}
            onPress={handleSubmit(onValid)}
            loading={isSubmitting}
            disabled={isSubmitting}
          />

          <View style={[styles.demoBox, { borderColor: colors.border, backgroundColor: colors.successSoft }]}>
            <Text style={[styles.demoTitle, { color: colors.text }]}>Demo accounts (src/data/users.js)</Text>
            <View style={styles.demoRow}>
              <PrimaryButton title="Customer" variant="secondary" style={styles.flex} onPress={() => fillDemo('customer@demo.pk', 'customer1')} />
              <PrimaryButton title="Manager" variant="secondary" style={styles.flex} onPress={() => fillDemo('manager@demo.pk', 'manager1')} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: 24, gap: 16, maxWidth: 520, width: '100%', alignSelf: 'center' },
  header: { gap: 6, marginTop: 16, marginBottom: 4 },
  brand: { fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  title: { fontSize: 30, fontWeight: '800' },
  subtitle: { fontSize: 15, lineHeight: 21 },
  label: { fontSize: 13, fontWeight: '600' },
  roleBlock: { gap: 6 },
  showButton: { minHeight: 38, paddingHorizontal: 12, borderRadius: 8, justifyContent: 'center' },
  showText: { fontSize: 13, fontWeight: '700' },
  demoBox: { padding: 14, borderRadius: radius.lg, borderWidth: 1, gap: 10, marginTop: 4 },
  demoTitle: { fontSize: 13, fontWeight: '600' },
  demoRow: { flexDirection: 'row', gap: 10 },
});
