import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useOrders } from '../context/OrdersContext';
import { useReservations } from '../context/ReservationsContext';
import { useMenu } from '../context/MenuContext';
import { ORDER_ACTIONS } from '../reducers/ordersReducer';
import { RESERVATION_ACTIONS } from '../reducers/reservationsReducer';
import { MENU_ACTIONS } from '../reducers/menuReducer';
import { ALLOWED_TRANSITIONS, ORDER_STATUS, RESERVATION_STATUS } from '../constants/orderStatus';
import { categories } from '../data/categories';
import useForm from '../hooks/useForm';
import Card from '../components/Card';
import Chip from '../components/Chip';
import EmptyState from '../components/EmptyState';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import SegmentedControl from '../components/SegmentedControl';
import StatusPill from '../components/StatusPill';
import { formatPrice, generateId } from '../utils/format';
import { formatDateLabel, formatTime } from '../utils/date';

const TABS = { ORDERS: 'orders', RESERVATIONS: 'reservations', MENU: 'menu' };
const NEW_ITEM = { name: '', price: '', description: '', category: 'Mains' };

const validateNewItem = (values) => {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Give the item a name.';
  const price = Number(values.price);
  if (!Number.isFinite(price) || price <= 0) errors.price = 'Enter a price above zero.';
  return errors;
};

// ---------- Incoming Orders ----------
function OrderRow({ order, onChangeStatus }) {
  const { colors } = useTheme();
  const nextStatuses = ALLOWED_TRANSITIONS[order.status];
  return (
    <Card>
      <View style={styles.rowBetween}>
        <Text style={[styles.bold, { color: colors.text }]}>{order.id}</Text>
        <StatusPill status={order.status} />
      </View>
      <Text style={[styles.body, { color: colors.text }]}>
        {order.customerName} · {order.type === 'Dine-in' ? `Table ${order.tableId}` : `Pickup ${order.pickupTime}`}
      </Text>
      <Text style={[styles.small, { color: colors.muted }]}>
        {order.items.map((l) => `${l.quantity}× ${l.name}${l.note ? ` (${l.note})` : ''}`).join(', ')}
      </Text>
      <View style={styles.rowBetween}>
        <Text style={[styles.small, { color: colors.muted }]}>Placed {formatTime(order.createdAt)}</Text>
        <Text style={[styles.bold, { color: colors.text }]}>{formatPrice(order.total)}</Text>
      </View>
      {nextStatuses.length > 0 && (
        <View style={styles.actions}>
          {nextStatuses.map((status) => (
            <PrimaryButton
              key={status}
              title={status === ORDER_STATUS.CANCELLED ? 'Cancel' : `Mark ${status}`}
              variant={status === ORDER_STATUS.CANCELLED ? 'danger' : 'primary'}
              style={styles.flex}
              onPress={() => onChangeStatus(order.id, status)}
            />
          ))}
        </View>
      )}
    </Card>
  );
}

// ---------- Menu Management row with inline price editing ----------
function MenuRow({ item, onSavePrice, onToggle }) {
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(item.price));
  const save = () => {
    const price = Number(draft);
    if (Number.isFinite(price) && price > 0) {
      onSavePrice(item.id, Math.round(price));
      setEditing(false);
    }
  };
  return (
    <Card style={styles.menuRow}>
      <View style={styles.flex}>
        <Text style={[styles.bold, { color: colors.text }]}>{item.name}</Text>
        {editing ? (
          <View style={styles.priceEdit}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              keyboardType="numeric"
              autoFocus
              accessibilityLabel={`New price for ${item.name}`}
              style={[styles.priceInput, { color: colors.text, borderColor: colors.border }]}
            />
            <Pressable onPress={save} accessibilityRole="button" style={styles.linkButton}>
              <Text style={[styles.link, { color: colors.primary }]}>Save</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => {
              setDraft(String(item.price));
              setEditing(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Edit price of ${item.name}, currently ${formatPrice(item.price)}`}
            style={styles.linkButton}
          >
            <Text style={[styles.small, { color: colors.muted }]}>
              {item.category} · {formatPrice(item.price)} · <Text style={{ color: colors.primary }}>Edit price</Text>
            </Text>
          </Pressable>
        )}
      </View>
      <Switch
        value={item.isAvailable}
        onValueChange={() => onToggle(item.id)}
        accessibilityLabel={`${item.name} available`}
        trackColor={{ false: colors.border, true: colors.success }}
        thumbColor="#FFFFFF"
      />
    </Card>
  );
}

export default function ManagerDashboardScreen() {
  const { colors } = useTheme();
  const { orders, dispatch: ordersDispatch } = useOrders();
  const { reservations, dispatch: reservationsDispatch } = useReservations();
  const { items: menuItems, dispatch: menuDispatch } = useMenu();
  const [tab, setTab] = useState(TABS.ORDERS);
  const form = useForm(NEW_ITEM, validateNewItem);

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== ORDER_STATUS.SERVED && o.status !== ORDER_STATUS.CANCELLED).length,
    [orders],
  );
  const reservationList = useMemo(
    () =>
      reservations
        .filter((r) => r.userId !== 'guest' || r.status === RESERVATION_STATUS.PENDING)
        .sort((a, b) => (a.date + a.timeSlot).localeCompare(b.date + b.timeSlot)),
    [reservations],
  );
  const pendingReservations = reservationList.filter((r) => r.status === RESERVATION_STATUS.PENDING).length;

  const changeOrderStatus = useCallback(
    (id, status) =>
      ordersDispatch({ type: ORDER_ACTIONS.UPDATE_STATUS, payload: { id, status, manual: true, at: Date.now() } }),
    [ordersDispatch],
  );
  const setReservationStatus = (id, status) =>
    reservationsDispatch({ type: RESERVATION_ACTIONS.SET_STATUS, payload: { id, status } });
  const savePrice = useCallback(
    (id, price) => menuDispatch({ type: MENU_ACTIONS.UPDATE_PRICE, payload: { id, price } }),
    [menuDispatch],
  );
  const toggleAvailability = useCallback(
    (id) => menuDispatch({ type: MENU_ACTIONS.TOGGLE_AVAILABILITY, payload: { id } }),
    [menuDispatch],
  );
  const addItem = form.handleSubmit((values) => {
    menuDispatch({
      type: MENU_ACTIONS.ADD_ITEM,
      payload: {
        id: generateId('m'),
        name: values.name.trim(),
        description: values.description.trim() || 'New on the menu',
        price: Math.round(Number(values.price)),
        category: values.category,
        isSpecial: false,
        isAvailable: true,
      },
    });
    form.reset();
  });

  const tabs = (
    <SegmentedControl
      options={[
        { value: TABS.ORDERS, label: `Orders (${activeOrders})` },
        { value: TABS.RESERVATIONS, label: `Bookings (${pendingReservations})` },
        { value: TABS.MENU, label: 'Menu' },
      ]}
      value={tab}
      onChange={setTab}
      style={styles.tabs}
    />
  );

  if (tab === TABS.ORDERS) {
    return (
      <FlatList
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.list}
        data={orders}
        keyExtractor={(o) => o.id}
        ListHeaderComponent={tabs}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<EmptyState icon="receipt-outline" title="No incoming orders" message="New customer orders appear here." />}
        renderItem={({ item }) => <OrderRow order={item} onChangeStatus={changeOrderStatus} />}
      />
    );
  }

  if (tab === TABS.RESERVATIONS) {
    return (
      <FlatList
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.list}
        data={reservationList}
        keyExtractor={(r) => r.id}
        ListHeaderComponent={tabs}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<EmptyState icon="calendar-outline" title="No reservations" />}
        renderItem={({ item: r }) => (
          <Card>
            <View style={styles.rowBetween}>
              <Text style={[styles.bold, { color: colors.text }]}>{r.name}</Text>
              <StatusPill status={r.status} />
            </View>
            <Text style={[styles.body, { color: colors.text }]}>
              {formatDateLabel(r.date)} · {r.timeSlot}
            </Text>
            <Text style={[styles.small, { color: colors.muted }]}>
              {r.partySize} guests · Table {r.tableId} · {r.phone}
            </Text>
            {r.status === RESERVATION_STATUS.PENDING && (
              <View style={styles.actions}>
                <PrimaryButton title="Accept" variant="success" style={styles.flex} onPress={() => setReservationStatus(r.id, RESERVATION_STATUS.ACCEPTED)} />
                <PrimaryButton title="Decline" variant="danger" style={styles.flex} onPress={() => setReservationStatus(r.id, RESERVATION_STATUS.DECLINED)} />
              </View>
            )}
          </Card>
        )}
      />
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.list}
      data={menuItems}
      keyExtractor={(m) => m.id}
      keyboardShouldPersistTaps="handled"
      ItemSeparatorComponent={() => <View style={styles.separatorSmall} />}
      ListHeaderComponent={
        <View style={styles.headerGap}>
          {tabs}
          <Card>
            <Text style={[styles.bold, { color: colors.text }]}>Add a menu item</Text>
            <FormField label="Name" value={form.values.name} onChangeText={form.handleChange('name')} placeholder="e.g. Chicken Handi" error={form.errors.name} />
            <FormField label="Price (Rs)" value={form.values.price} onChangeText={form.handleChange('price')} keyboardType="numeric" placeholder="e.g. 950" error={form.errors.price} />
            <FormField label="Description (optional)" value={form.values.description} onChangeText={form.handleChange('description')} placeholder="Short description" />
            <View style={styles.catRow}>
              {categories.map((c) => (
                <Chip key={c.id} label={c.name} selected={form.values.category === c.name} onPress={() => form.setFieldValue('category', c.name)} />
              ))}
            </View>
            <PrimaryButton title="Add to menu" onPress={addItem} />
          </Card>
          <Text style={[styles.small, { color: colors.muted }]}>Changes appear on the customer menu straight away.</Text>
        </View>
      }
      renderItem={({ item }) => <MenuRow item={item} onSavePrice={savePrice} onToggle={toggleAvailability} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 40 },
  tabs: { marginBottom: 14 },
  headerGap: { gap: 12, marginBottom: 12 },
  separator: { height: 12 },
  separatorSmall: { height: 8 },
  flex: { flex: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  bold: { fontSize: 15, fontWeight: '700' },
  body: { fontSize: 14 },
  small: { fontSize: 13 },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  priceEdit: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  priceInput: { minWidth: 90, minHeight: 40, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, fontSize: 15 },
  linkButton: { minHeight: 36, justifyContent: 'center' },
  link: { fontSize: 14, fontWeight: '700' },
});
