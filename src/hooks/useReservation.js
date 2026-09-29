import { useCallback, useMemo, useState } from 'react';
import { mockTables, TIME_SLOTS } from '../data/tables';
import { RESERVATION_STATUS } from '../constants/orderStatus';
import { RESERVATION_ACTIONS } from '../reducers/reservationsReducer';
import { useAuth } from '../context/AuthContext';
import { useReservations } from '../context/ReservationsContext';
import { addDays, isAtLeastOneHourAhead, isPastDate, toISODate } from '../utils/date';
import { isValidPkMobile } from '../utils/validation';
import { generateId } from '../utils/format';

export const MIN_PARTY = 1;
export const MAX_PARTY = 12;
const BOOKING_DAYS = 7;
const ACTIVE = [RESERVATION_STATUS.PENDING, RESERVATION_STATUS.ACCEPTED];

/**
 * Question 9: all reservation business logic lives here, so
 * ReservationScreen only renders UI. This hook returns data and functions,
 * never JSX.
 */
export default function useReservation() {
  const { user } = useAuth();
  const { reservations, dispatch } = useReservations();

  const [date, setDate] = useState(() => toISODate(addDays(new Date(), 1)));
  const [timeSlot, setTimeSlot] = useState(null);
  const [partySize, setPartySizeState] = useState(2);
  const [contact, setContact] = useState({ name: user?.fullName ?? '', phone: '' });
  const [errors, setErrors] = useState({});

  const dates = useMemo(
    () => Array.from({ length: BOOKING_DAYS }, (_, i) => toISODate(addDays(new Date(), i))),
    [],
  );

  // Smallest free table with enough seats at the given date and time, or null.
  const findFreeTable = useCallback(
    (onDate, atSlot, size) => {
      const booked = new Set(
        reservations
          .filter((r) => r.date === onDate && r.timeSlot === atSlot && ACTIVE.includes(r.status))
          .map((r) => r.tableId),
      );
      return (
        mockTables
          .filter((t) => t.seats >= size && !booked.has(t.id))
          .sort((a, b) => a.seats - b.seats)[0] || null
      );
    },
    [reservations],
  );

  const slots = useMemo(
    () =>
      TIME_SLOTS.map((slot) => {
        const tooSoon = !isAtLeastOneHourAhead(date, slot);
        const table = findFreeTable(date, slot, partySize);
        return { slot, table, tooSoon, disabled: tooSoon || !table };
      }),
    [date, partySize, findFreeTable],
  );

  const selectedTable = useMemo(
    () => (timeSlot ? findFreeTable(date, timeSlot, partySize) : null),
    [timeSlot, date, partySize, findFreeTable],
  );

  const selectDate = useCallback((iso) => {
    setDate(iso);
    setTimeSlot(null);
    setErrors((prev) => ({ ...prev, date: undefined, timeSlot: undefined }));
  }, []);

  const selectTimeSlot = useCallback((slot) => {
    setTimeSlot(slot);
    setErrors((prev) => ({ ...prev, timeSlot: undefined }));
  }, []);

  const setPartySize = useCallback((size) => {
    setPartySizeState(Math.max(MIN_PARTY, Math.min(MAX_PARTY, size)));
    setTimeSlot(null); // availability depends on party size
  }, []);

  const updateContact = useCallback((field, value) => {
    setContact((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const validate = useCallback(() => {
    const next = {};
    if (isPastDate(date)) next.date = 'The date cannot be in the past.';
    if (partySize < MIN_PARTY || partySize > MAX_PARTY) next.partySize = 'Party size must be 1 to 12.';
    if (!timeSlot) next.timeSlot = 'Choose a time slot.';
    else if (!isAtLeastOneHourAhead(date, timeSlot)) next.timeSlot = 'Bookings must be at least 1 hour ahead.';
    else if (!selectedTable) next.timeSlot = 'No table is free at that time. Pick another slot.';
    if (!contact.name.trim()) next.name = 'Enter a name for the booking.';
    if (!isValidPkMobile(contact.phone)) next.phone = 'Use the format 03XX-XXXXXXX.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [date, partySize, timeSlot, selectedTable, contact]);

  const createReservation = useCallback(() => {
    if (!validate()) return null;
    const reservation = {
      id: generateId('RES'),
      userId: user.email,
      name: contact.name.trim(),
      phone: contact.phone.trim(),
      date,
      timeSlot,
      partySize,
      tableId: selectedTable.id,
      status: RESERVATION_STATUS.PENDING,
      createdAt: Date.now(),
    };
    dispatch({ type: RESERVATION_ACTIONS.CREATE, payload: reservation });
    setTimeSlot(null);
    return reservation;
  }, [validate, user, contact, date, timeSlot, partySize, selectedTable, dispatch]);

  const cancelReservation = useCallback(
    (id) => dispatch({ type: RESERVATION_ACTIONS.CANCEL, payload: { id } }),
    [dispatch],
  );

  const myReservations = useMemo(
    () =>
      reservations
        .filter((r) => r.userId === user?.email)
        .sort((a, b) => (a.date + a.timeSlot).localeCompare(b.date + b.timeSlot)),
    [reservations, user],
  );

  return {
    dates,
    date,
    selectDate,
    slots,
    timeSlot,
    selectTimeSlot,
    partySize,
    setPartySize,
    contact,
    updateContact,
    selectedTable,
    errors,
    validate,
    createReservation,
    cancelReservation,
    myReservations,
  };
}
