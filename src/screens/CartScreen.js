import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { CART_ACTIONS, isValidPromoCode } from '../reducers/cartReducer';
import CartItemRow from '../components/CartItemRow';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';
import { formatPrice } from '../utils/format';
import { confirmAction } from '../utils/confirm';
import { radius } from '../theme/colors';

// Question 7: every change goes through dispatch(action) -> cartReducer.
export default function CartScreen({ navigation }) {
  const { colors } = useTheme();
  const { state, dispatch, itemCount } = useCart();
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  const increment = useCallback((id) => dispatch({ type: CART_ACTIONS.INCREMENT, payload: { id } }), [dispatch]);
  const decrement = useCallback((id) => dispatch({ type: CART_ACTIONS.DECREMENT, payload: { id } }), [dispatch]);
  const remove = useCallback((id) => dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: { id } }), [dispatch]);
  const updateNote = useCallback(
    (id, note) => dispatch({ type: CART_ACTIONS.UPDATE_NOTE, payload: { id, note } }),
    [dispatch],
  );

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoError('Enter a promo code first.');
      return;
    }
    if (!isValidPromoCode(code)) {
      setPromoError(`“${code}” isn’t a valid code. Try WELCOME10 or FEAST20.`);
      return;
    }
    dispatch({ type: CART_ACTIONS.APPLY_PROMO, payload: { code } });
    setPromoError('');
    setPromoInput('');
  };

  const confirmClear = () =>
    confirmAction({
      title: 'Clear cart?',
      message: 'This removes every item from your cart.',
      confirmText: 'Clear',
      cancelText: 'Keep items',
      destructive: true,
      onConfirm: () => dispatch({ type: CART_ACTIONS.CLEAR_CART }),
    });

  if (state.items.length === 0) {
    return (
      <View style={[styles.emptyWrap, { backgroundColor: colors.background }]}>
        <EmptyState icon="bag-handle-outline" title="Your cart is empty" message="Add a few dishes from the menu to get started.">
          <PrimaryButton title="Browse the menu" onPress={() => navigation.navigate('MenuTab')} style={styles.stretch} />
        </EmptyState>
      </View>
    );
  }

  const subtotal = state.items.reduce((sum, line) => sum + line.price * line.quantity, 0);

  const footer = (
    <View style={styles.footer}>
      <Card>
        <Text style={[styles.label, { color: colors.text }]}>Promo code</Text>
        {state.promoCode ? (
          <View style={[styles.appliedRow, { backgroundColor: colors.successSoft }]}>
            <Text style={[styles.appliedText, { color: colors.success }]}>
              {state.promoCode} applied · {state.discountPercent}% off
            </Text>
            <Pressable onPress={() => dispatch({ type: CART_ACTIONS.REMOVE_PROMO })} accessibilityRole="button" style={styles.link}>
              <Text style={[styles.linkText, { color: colors.success }]}>Remove</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.promoRow}>
            <TextInput
              value={promoInput}
              onChangeText={(text) => {
                setPromoInput(text);
                setPromoError('');
              }}
              placeholder="WELCOME10 or FEAST20"
              placeholderTextColor={colors.muted}
              autoCapitalize="characters"
              accessibilityLabel="Promo code"
              style={[
                styles.promoInput,
                { color: colors.text, borderColor: promoError ? colors.danger : colors.border, backgroundColor: colors.background },
              ]}
            />
            <PrimaryButton title="Apply" onPress={applyPromo} style={styles.applyButton} />
          </View>
        )}
        {promoError ? <Text style={[styles.error, { color: colors.danger }]}>{promoError}</Text> : null}
      </Card>

      <View style={styles.subtotalRow}>
        <Text style={[styles.muted, { color: colors.muted }]}>Subtotal ({itemCount} items)</Text>
        <Text style={[styles.subtotal, { color: colors.text }]}>{formatPrice(subtotal)}</Text>
      </View>
      <PrimaryButton title="Review order" onPress={() => navigation.navigate('OrderSummary')} />
      <PrimaryButton title="Clear cart" variant="ghost" onPress={confirmClear} />
    </View>
  );

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.list}
      data={state.items}
      keyExtractor={(line) => line.id}
      renderItem={({ item }) => (
        <CartItemRow line={item} onIncrement={increment} onDecrement={decrement} onRemove={remove} onChangeNote={updateNote} />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListFooterComponent={footer}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  emptyWrap: { flex: 1, padding: 16, justifyContent: 'center' },
  stretch: { alignSelf: 'stretch', marginTop: 8 },
  list: { padding: 16, paddingBottom: 32 },
  separator: { height: 12 },
  footer: { gap: 12, marginTop: 12 },
  label: { fontSize: 14, fontWeight: '700' },
  appliedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 12, borderRadius: 10 },
  appliedText: { fontSize: 14, fontWeight: '700' },
  link: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  linkText: { fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
  promoRow: { flexDirection: 'row', gap: 8 },
  promoInput: { flex: 1, minHeight: 48, borderWidth: 1.5, borderRadius: radius.md, paddingHorizontal: 12, fontSize: 15 },
  applyButton: { minHeight: 48 },
  error: { fontSize: 13 },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  muted: { fontSize: 15 },
  subtotal: { fontSize: 16, fontWeight: '700' },
});
