export const formatPrice = (amount) => `Rs ${Math.round(amount).toLocaleString('en-US')}`;

export const formatElapsed = (totalSeconds) => {
  const safe = Math.max(0, totalSeconds);
  const minutes = String(Math.floor(safe / 60)).padStart(2, '0');
  const seconds = String(safe % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export const getInitials = (fullName = '') =>
  fullName
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const generateId = (prefix) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;
