export const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

// Local date as YYYY-MM-DD (avoids UTC shifts from toISOString).
export const toISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const fromISODate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const slotToDate = (isoDate, timeSlot) => {
  const date = fromISODate(isoDate);
  const [hours, minutes] = timeSlot.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const isPastDate = (isoDate, now = new Date()) => isoDate < toISODate(now);

export const isAtLeastOneHourAhead = (isoDate, timeSlot, now = new Date()) =>
  slotToDate(isoDate, timeSlot).getTime() - now.getTime() >= 60 * 60 * 1000;

export const formatDateLabel = (isoDate) => {
  const date = fromISODate(isoDate);
  const today = toISODate(new Date());
  const weekday = isoDate === today ? 'Today' : date.toLocaleDateString('en-GB', { weekday: 'short' });
  return `${weekday}, ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
};

export const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
