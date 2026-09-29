// Order lifecycle, matching the State Machine Diagram in A1/UML.
export const ORDER_STATUS = {
  PENDING: 'Pending',
  PREPARING: 'Preparing',
  READY: 'Ready',
  SERVED: 'Served',
  CANCELLED: 'Cancelled',
};

// The happy path, in order. Used by the step progress indicator.
export const STATUS_FLOW = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY,
  ORDER_STATUS.SERVED,
];

// Allowed transitions. Anything not listed here is rejected by ordersReducer.
export const ALLOWED_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.READY]: [ORDER_STATUS.SERVED],
  [ORDER_STATUS.SERVED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

// Demo timings for automatic progression on the Order Tracking screen.
export const AUTO_STATUS_SECONDS = {
  [ORDER_STATUS.PREPARING]: 10,
  [ORDER_STATUS.READY]: 20,
  [ORDER_STATUS.SERVED]: 30,
};

export const RESERVATION_STATUS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
  CANCELLED: 'Cancelled',
};

export const isTerminalStatus = (status) => ALLOWED_TRANSITIONS[status]?.length === 0;

export const canTransition = (from, to) => (ALLOWED_TRANSITIONS[from] || []).includes(to);

// Which status the order should have reached after `seconds` (auto mode).
export const getAutoStatus = (seconds) => {
  if (seconds >= AUTO_STATUS_SECONDS[ORDER_STATUS.SERVED]) return ORDER_STATUS.SERVED;
  if (seconds >= AUTO_STATUS_SECONDS[ORDER_STATUS.READY]) return ORDER_STATUS.READY;
  if (seconds >= AUTO_STATUS_SECONDS[ORDER_STATUS.PREPARING]) return ORDER_STATUS.PREPARING;
  return ORDER_STATUS.PENDING;
};
