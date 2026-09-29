import { addDays, toISODate } from '../utils/date';
import { mockTables } from './tables';

// mockReservations: bookings made by other guests, so availability checks
// have something to check against. Dates are relative to "today" so the
// demo always shows a fully booked slot: tomorrow at 20:00.
const tomorrow = toISODate(addDays(new Date(), 1));
const dayAfter = toISODate(addDays(new Date(), 2));

const fullyBooked = mockTables.map((table, index) => ({
  id: `seed-${index + 1}`,
  userId: 'guest',
  name: 'Private dinner',
  phone: '0300-0000000',
  date: tomorrow,
  timeSlot: '20:00',
  partySize: Math.min(table.seats, 4),
  tableId: table.id,
  status: 'Accepted',
  createdAt: 0,
}));

export const mockReservations = [
  ...fullyBooked,
  {
    id: 'seed-7',
    userId: 'guest',
    name: 'Hamza Raza',
    phone: '0321-5550101',
    date: tomorrow,
    timeSlot: '19:00',
    partySize: 7,
    tableId: 'T5',
    status: 'Pending',
    createdAt: 0,
  },
  {
    id: 'seed-8',
    userId: 'guest',
    name: 'Sana Malik',
    phone: '0333-5550199',
    date: dayAfter,
    timeSlot: '13:00',
    partySize: 3,
    tableId: 'T2',
    status: 'Pending',
    createdAt: 0,
  },
];

export default mockReservations;
