import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useOrders } from '../context/OrdersContext';
import { ORDER_ACTIONS } from '../reducers/ordersReducer';
import { ALLOWED_TRANSITIONS, ORDER_STATUS, STATUS_FLOW, getAutoStatus, isTerminalStatus } from '../constants/orderStatus';
import Card from '../components/Card';
import StepProgress from '../components/StepProgress';
import StatusPill from '../components/StatusPill';
import EmptyState from '../components/EmptyState';
import { formatElapsed, formatPrice } from '../utils/format';
import { formatTime } from '../utils/date';

const STATUS_HINTS = {
  [ORDER_STATUS.PENDING]: 'The kitchen has received your order.',
  [ORDER_STATUS.PREPARING]: 'Your food is being cooked.',
  [ORDER_STATUS.READY]: 'Ready! Collect it at the counter or wait at your table.',
  [ORDER_STATUS.SERVED]: 'Enjoy your meal.',
  [ORDER_STATUS.CANCELLED]: 'This order was cancelled by the restaurant.',
};

// Question 10: timers with useEffect + setInterval, always cleared on cleanup.
export default function OrderTrackingScreen({ route }) {
  const { colors } = useTheme();
  const { orders, dispatch } = useOrders();
  const order = orders.find((o) => o.id === route.params?.orderId);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Running elapsed-time counter, updated every second.
  useEffect(() => {
    if (!order) return undefined;
    const tick = () => setElapsedSeconds(Math.floor((Date.now() - order.createdAt) / 1000));
    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [order?.createdAt]); // eslint-disable-line react-hooks/exhaustive-deps

  // Automatic status: Pending -> Preparing (10 s) -> Ready (20 s) -> Served (30 s).
  // Moves one step at a time so every change is a legal state-machine transition.
  // Stops once a manager has changed the status by hand, or the order is finished.
  useEffect(() => {
    if (!order || order.manualOverride || isTerminalStatus(order.status)) return undefined;
    const intervalId = setInterval(() => {
      const seconds = Math.floor((Date.now() - order.createdAt) / 1000);
      const target = getAutoStatus(seconds);
      if (STATUS_FLOW.indexOf(target) > STATUS_FLOW.indexOf(order.status)) {
        const next = ALLOWED_TRANSITIONS[order.status][0];
        dispatch({ type: ORDER_ACTIONS.UPDATE_STATUS, payload: { id: order.id, status: next, at: Date.now() } });
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [order?.id, order?.status, order?.manualOverride]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!order) {
    return (
      <View style={[styles.emptyWrap, { backgroundColor: colors.background }]}>
        <EmptyState icon="receipt-outline" title="Order not found" message="It may have been removed." />
      </View>
    );
  }

  const where = order.type === 'Dine-in' ? `Dine-in · Table ${order.tableId}` : `Takeaway · Pickup ${order.pickupTime.toLowerCase()}`;
  const statusColor =
    order.status === ORDER_STATUS.CANCELLED ? colors.danger : order.status === ORDER_STATUS.SERVED ? colors.success : colors.primary;

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Card style={styles.hero}>
        <View style={styles.row}>
          <Text style={[styles.orderId, { color: colors.muted }]}>{order.id}</Text>
          <StatusPill status={order.status} />
        </View>
        <Text style={[styles.muted, { color: colors.muted }]}>{where}</Text>
        <Text style={[styles.status, { color: statusColor }]}>{order.status}</Text>
        <Text style={[styles.muted, { color: colors.muted }]}>{STATUS_HINTS[order.status]}</Text>
        <StepProgress status={order.status} />
        <View style={[styles.timer, { backgroundColor: colors.successSoft }]}>
          <Text style={[styles.timerLabel, { color: colors.success }]}>Time since order</Text>
          <Text style={[styles.timerValue, { color: colors.success }]}>{formatElapsed(elapsedSeconds)}</Text>
        </View>
      </Card>

      <Card>
        {order.items.map((line) => (
          <View key={line.id} style={styles.row}>
            <Text style={[styles.line, { color: colors.text }]}>
              {line.quantity} × {line.name}
            </Text>
            <Text style={[styles.line, { color: colors.text }]}>{formatPrice(line.price * line.quantity)}</Text>
          </View>
        ))}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
          <Text style={[styles.totalLabel, { color: colors.text }]}>{formatPrice(order.total)}</Text>
        </View>
        <Text style={[styles.small, { color: colors.muted }]}>Placed at {formatTime(order.createdAt)}</Text>
      </Card>

      <Text style={[styles.small, styles.center, { color: colors.muted }]}>
        Demo timings: Preparing at 10 s, Ready at 20 s, Served at 30 s.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emptyWrap: { flex: 1, padding: 16, justifyContent: 'center' },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  hero: { gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  orderId: { fontSize: 13, fontWeight: '700', fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }) },
  muted: { fontSize: 14 },
  status: { fontSize: 32, fontWeight: '800' },
  timer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12 },
  timerLabel: { fontSize: 14, fontWeight: '600' },
  timerValue: { fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  line: { fontSize: 14 },
  divider: { height: 1 },
  totalLabel: { fontSize: 15, fontWeight: '700' },
  small: { fontSize: 12 },
  center: { textAlign: 'center' },
});
