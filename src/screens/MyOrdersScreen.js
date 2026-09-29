import { useMemo } from 'react';
import { Platform, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';
import EmptyState from '../components/EmptyState';
import { formatPrice } from '../utils/format';
import { formatTime } from '../utils/date';
import { radius } from '../theme/colors';

export default function MyOrdersScreen({ navigation }) {
  const { colors } = useTheme();
  const { orders } = useOrders();
  const { user } = useAuth();

  const myOrders = useMemo(() => orders.filter((o) => o.customerId === user?.email), [orders, user]);

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.list}
      data={myOrders}
      keyExtractor={(o) => o.id}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        <EmptyState icon="receipt-outline" title="No orders yet" message="Orders you place will appear here with their live status." />
      }
      renderItem={({ item: order }) => (
        <Pressable
          onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
          accessibilityRole="button"
          accessibilityLabel={`Order ${order.id}, ${order.status}. Open tracking`}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <View style={styles.row}>
            <Text style={[styles.id, { color: colors.text }]}>{order.id}</Text>
            <StatusPill status={order.status} />
          </View>
          <Text style={[styles.summary, { color: colors.muted }]} numberOfLines={2}>
            {order.items.map((l) => `${l.quantity}× ${l.name}`).join(', ')}
          </Text>
          <View style={styles.row}>
            <Text style={[styles.meta, { color: colors.muted }]}>
              {order.type} · {formatTime(order.createdAt)}
            </Text>
            <Text style={[styles.total, { color: colors.text }]}>{formatPrice(order.total)}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 32 },
  separator: { height: 12 },
  card: { padding: 14, borderRadius: radius.lg, borderWidth: 1, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { fontSize: 14, fontWeight: '800', fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }) },
  summary: { fontSize: 14 },
  meta: { fontSize: 13 },
  total: { fontSize: 15, fontWeight: '700' },
});
