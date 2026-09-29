import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StackActions } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { CART_ACTIONS } from '../reducers/cartReducer';
import { ORDER_ACTIONS } from '../reducers/ordersReducer';
import { ORDER_STATUS } from '../constants/orderStatus';
import { SALES_TAX_RATE, SERVICE_CHARGE_RATE } from '../constants/pricing';
import { mockTables } from '../data/tables';
import Card from '../components/Card';
import Chip from '../components/Chip';
import SegmentedControl from '../components/SegmentedControl';
import PrimaryButton from '../components/PrimaryButton';
import EmptyState from '../components/EmptyState';
import { calculateTotals } from '../utils/pricing';
import { formatPrice, generateId } from '../utils/format';
import { showMessage } from '../utils/confirm';

const ORDER_TYPES = { DINE_IN: 'Dine-in', TAKEAWAY: 'Takeaway' };
const PICKUP_OPTIONS = ['In 20 min', 'In 40 min', 'In 1 hour', 'In 90 min'];

// Questions 8 and 10: totals with useMemo, then the place-order flow.
export default function OrderSummaryScreen({ navigation }) {
  const { colors } = useTheme();
  const { state: cart, dispatch: cartDispatch } = useCart();
  const { dispatch: ordersDispatch } = useOrders();
  const { user } = useAuth();

  const [orderType, setOrderType] = useState(ORDER_TYPES.DINE_IN);
  const [tableId, setTableId] = useState(null);
  const [pickupTime, setPickupTime] = useState(null);

  // Recomputed only when the cart items or the discount change.
  const totals = useMemo(
    () => calculateTotals(cart.items, cart.discountPercent),
    [cart.items, cart.discountPercent],
  );

  if (cart.items.length === 0) {
    return (
      <View style={[styles.emptyWrap, { backgroundColor: colors.background }]}>
        <EmptyState icon="receipt-outline" title="Nothing to summarise" message="Your cart is empty." />
      </View>
    );
  }

  const placeOrder = () => {
    if (orderType === ORDER_TYPES.DINE_IN && !tableId) {
      showMessage('Choose a table', 'Pick the table you are sitting at, or switch to Takeaway.');
      return;
    }
    if (orderType === ORDER_TYPES.TAKEAWAY && !pickupTime) {
      showMessage('Choose a pickup time', 'Tell the kitchen when you will collect your order.');
      return;
    }
    const now = Date.now();
    const order = {
      id: generateId('ORD'),
      customerId: user.email,
      customerName: user.fullName,
      items: cart.items.map(({ id, name, price, quantity, note }) => ({ id, name, price, quantity, note })),
      promoCode: cart.promoCode,
      ...totals,
      total: totals.grandTotal,
      type: orderType,
      tableId: orderType === ORDER_TYPES.DINE_IN ? tableId : null,
      pickupTime: orderType === ORDER_TYPES.TAKEAWAY ? pickupTime : null,
      status: ORDER_STATUS.PENDING,
      manualOverride: false,
      createdAt: now,
      statusHistory: [{ status: ORDER_STATUS.PENDING, at: now }],
    };
    ordersDispatch({ type: ORDER_ACTIONS.PLACE_ORDER, payload: order });
    cartDispatch({ type: CART_ACTIONS.CLEAR_CART });

    // Open tracking in the Orders tab, then leave the Cart stack at its first screen.
    navigation.getParent()?.navigate('OrdersTab', {
      screen: 'OrderTracking',
      params: { orderId: order.id },
      initial: false,
    });
    navigation.dispatch(StackActions.popToTop());
  };

  const row = (label, value, color = colors.text) => (
    <View style={styles.row} key={label}>
      <Text style={[styles.rowText, { color }]}>{label}</Text>
      <Text style={[styles.rowText, { color }]}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Card>
        {cart.items.map((line) => (
          <View key={line.id} style={styles.row}>
            <View style={styles.flex}>
              <Text style={[styles.rowText, { color: colors.text }]}>
                {line.quantity} × {line.name}
              </Text>
              {line.note ? <Text style={[styles.note, { color: colors.muted }]}>“{line.note}”</Text> : null}
            </View>
            <Text style={[styles.rowText, { color: colors.text }]}>{formatPrice(line.price * line.quantity)}</Text>
          </View>
        ))}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        {row('Subtotal', formatPrice(totals.subtotal))}
        {row(`Service charge (${SERVICE_CHARGE_RATE * 100}%)`, formatPrice(totals.serviceCharge))}
        {row(`Sales tax (${SALES_TAX_RATE * 100}%)`, formatPrice(totals.salesTax))}
        {cart.discountPercent > 0 &&
          row(`Promo ${cart.promoCode} (−${cart.discountPercent}%)`, `−${formatPrice(totals.discount)}`, colors.success)}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Grand total</Text>
          <Text style={[styles.total, { color: colors.primary }]}>{formatPrice(totals.grandTotal)}</Text>
        </View>
      </Card>

      <Text style={[styles.section, { color: colors.muted }]}>HOW WOULD YOU LIKE IT?</Text>
      <SegmentedControl
        options={[
          { value: ORDER_TYPES.DINE_IN, label: 'Dine-in' },
          { value: ORDER_TYPES.TAKEAWAY, label: 'Takeaway' },
        ]}
        value={orderType}
        onChange={setOrderType}
      />

      {orderType === ORDER_TYPES.DINE_IN ? (
        <View style={styles.grid}>
          {mockTables.map((table) => (
            <Chip
              key={table.id}
              label={`${table.id} · ${table.seats} seats`}
              selected={tableId === table.id}
              onPress={() => setTableId(table.id)}
              style={styles.gridChip}
            />
          ))}
        </View>
      ) : (
        <View style={styles.grid}>
          {PICKUP_OPTIONS.map((option) => (
            <Chip key={option} label={option} selected={pickupTime === option} onPress={() => setPickupTime(option)} style={styles.gridChip} />
          ))}
        </View>
      )}

      <PrimaryButton title={`Place order · ${formatPrice(totals.grandTotal)}`} onPress={placeOrder} />
      <Text style={[styles.disclaimer, { color: colors.muted }]}>Demo only: no real payment is taken.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emptyWrap: { flex: 1, padding: 16, justifyContent: 'center' },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  flex: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  rowText: { fontSize: 14 },
  note: { fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  divider: { height: 1, marginVertical: 2 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  total: { fontSize: 22, fontWeight: '800' },
  section: { fontSize: 13, fontWeight: '700', letterSpacing: 1, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridChip: { flexGrow: 1, flexBasis: '30%' },
  disclaimer: { fontSize: 12, textAlign: 'center' },
});
