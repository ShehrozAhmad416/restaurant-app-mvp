import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import useReservation, { MAX_PARTY, MIN_PARTY } from '../hooks/useReservation';
import Card from '../components/Card';
import Chip from '../components/Chip';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import QuantityStepper from '../components/QuantityStepper';
import StatusPill from '../components/StatusPill';
import { RESERVATION_STATUS } from '../constants/orderStatus';
import { formatDateLabel } from '../utils/date';
import { radius } from '../theme/colors';
import { confirmAction } from '../utils/confirm';

// Question 9: UI only. All business logic lives in useReservation.
export default function ReservationScreen() {
  const { colors } = useTheme();
  const r = useReservation();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const openConfirm = () => {
    setSuccessMessage('');
    if (r.validate()) setConfirmVisible(true);
  };

  const confirmBooking = () => {
    const saved = r.createReservation();
    setConfirmVisible(false);
    if (saved) setSuccessMessage(`Request sent for ${formatDateLabel(saved.date)} at ${saved.timeSlot}. The manager will confirm it.`);
  };

  // Alert confirmation before cancelling.
  const askCancel = (reservation) =>
    confirmAction({
      title: 'Cancel booking?',
      message: `${formatDateLabel(reservation.date)} at ${reservation.timeSlot} for ${reservation.partySize} guests.`,
      confirmText: 'Cancel booking',
      cancelText: 'Keep it',
      destructive: true,
      onConfirm: () => r.cancelReservation(reservation.id),
    });

  const sectionTitle = (text) => <Text style={[styles.section, { color: colors.muted }]}>{text}</Text>;

  return (
    <>
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {sectionTitle('DATE')}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
          {r.dates.map((iso) => (
            <Chip key={iso} label={formatDateLabel(iso)} selected={r.date === iso} onPress={() => r.selectDate(iso)} />
          ))}
        </ScrollView>
        {r.errors.date ? <Text style={[styles.error, { color: colors.danger }]}>{r.errors.date}</Text> : null}

        <View style={styles.partyRow}>
          <View>
            {sectionTitle('PARTY SIZE')}
            <Text style={[styles.hint, { color: colors.muted }]}>
              {MIN_PARTY} to {MAX_PARTY} guests
            </Text>
          </View>
          <QuantityStepper
            label="Party size"
            value={r.partySize}
            min={MIN_PARTY}
            max={MAX_PARTY}
            onDecrement={() => r.setPartySize(r.partySize - 1)}
            onIncrement={() => r.setPartySize(r.partySize + 1)}
          />
        </View>

        {sectionTitle('TIME')}
        <View style={styles.slotGrid}>
          {r.slots.map(({ slot, disabled }) => (
            <Chip
              key={slot}
              label={slot}
              selected={r.timeSlot === slot}
              disabled={disabled}
              strikeThrough={disabled}
              onPress={() => r.selectTimeSlot(slot)}
              style={styles.slot}
            />
          ))}
        </View>
        <Text style={[styles.hint, { color: colors.muted }]}>
          Struck-through slots have no free table for your party, or are less than 1 hour away.
        </Text>
        {r.errors.timeSlot ? <Text style={[styles.error, { color: colors.danger }]}>{r.errors.timeSlot}</Text> : null}
        {r.selectedTable ? (
          <View style={[styles.tableNote, { backgroundColor: colors.successSoft }]}>
            <Text style={[styles.tableNoteText, { color: colors.success }]}>
              Table {r.selectedTable.id} ({r.selectedTable.seats} seats, {r.selectedTable.area}) is free.
            </Text>
          </View>
        ) : null}

        {sectionTitle('CONTACT')}
        <FormField
          label="Name"
          value={r.contact.name}
          onChangeText={(v) => r.updateContact('name', v)}
          placeholder="Name for the booking"
          error={r.errors.name}
        />
        <FormField
          label="Mobile number"
          value={r.contact.phone}
          onChangeText={(v) => r.updateContact('phone', v)}
          placeholder="03XX-XXXXXXX"
          keyboardType="phone-pad"
          maxLength={12}
          error={r.errors.phone}
        />

        {successMessage ? (
          <View style={[styles.tableNote, { backgroundColor: colors.successSoft }]} accessibilityLiveRegion="polite">
            <Text style={[styles.tableNoteText, { color: colors.success }]}>{successMessage}</Text>
          </View>
        ) : null}

        <PrimaryButton title="Review booking" onPress={openConfirm} />

        <Text style={[styles.heading, { color: colors.text }]}>My Reservations</Text>
        {r.myReservations.length === 0 ? (
          <Text style={[styles.hint, { color: colors.muted }]}>You have no bookings yet.</Text>
        ) : (
          r.myReservations.map((res) => {
            const cancellable = res.status === RESERVATION_STATUS.PENDING || res.status === RESERVATION_STATUS.ACCEPTED;
            return (
              <Card key={res.id}>
                <View style={styles.rowBetween}>
                  <Text style={[styles.resTitle, { color: colors.text }]}>
                    {formatDateLabel(res.date)} · {res.timeSlot}
                  </Text>
                  <StatusPill status={res.status} />
                </View>
                <Text style={[styles.hint, { color: colors.muted }]}>
                  {res.partySize} guests · Table {res.tableId} · {res.phone}
                </Text>
                {cancellable && <PrimaryButton title="Cancel booking" variant="danger" onPress={() => askCancel(res)} />}
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Confirmation modal summarising the booking before it is saved */}
      <Modal visible={confirmVisible} transparent animationType="slide" onRequestClose={() => setConfirmVisible(false)}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]} accessibilityViewIsModal>
            <Text style={[styles.heading, { color: colors.text }]}>Confirm your booking</Text>
            {[
              ['Date', formatDateLabel(r.date)],
              ['Time', r.timeSlot],
              ['Guests', String(r.partySize)],
              ['Table', r.selectedTable ? `${r.selectedTable.id} (${r.selectedTable.seats} seats)` : '—'],
              ['Name', r.contact.name],
              ['Mobile', r.contact.phone],
            ].map(([label, value]) => (
              <View key={label} style={[styles.summaryRow, { borderColor: colors.border }]}>
                <Text style={[styles.hint, { color: colors.muted }]}>{label}</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{value}</Text>
              </View>
            ))}
            <View style={styles.sheetButtons}>
              <PrimaryButton title="Edit" variant="secondary" style={styles.flex} onPress={() => setConfirmVisible(false)} />
              <PrimaryButton title="Confirm booking" style={styles.flex} onPress={confirmBooking} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  flex: { flex: 1 },
  section: { fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  hint: { fontSize: 13, lineHeight: 18 },
  error: { fontSize: 13 },
  hRow: { gap: 8 },
  partyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: { flexBasis: '22%', flexGrow: 1, borderRadius: 10 },
  tableNote: { padding: 12, borderRadius: radius.md },
  tableNoteText: { fontSize: 14, fontWeight: '600' },
  heading: { fontSize: 20, fontWeight: '800', marginTop: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  resTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { padding: 20, paddingBottom: 32, borderTopLeftRadius: 22, borderTopRightRadius: 22, gap: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1 },
  summaryValue: { fontSize: 15, fontWeight: '700' },
  sheetButtons: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
