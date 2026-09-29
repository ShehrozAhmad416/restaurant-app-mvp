import { canTransition } from '../constants/orderStatus';

export const ORDER_ACTIONS = {
  HYDRATE: 'HYDRATE',
  PLACE_ORDER: 'PLACE_ORDER',
  UPDATE_STATUS: 'UPDATE_STATUS',
};

export const initialOrdersState = { orders: [] };

export function ordersReducer(state, action) {
  switch (action.type) {
    case ORDER_ACTIONS.HYDRATE:
      return { ...initialOrdersState, ...action.payload };

    case ORDER_ACTIONS.PLACE_ORDER:
      return { ...state, orders: [action.payload, ...state.orders] };

    case ORDER_ACTIONS.UPDATE_STATUS: {
      // `at` (timestamp) comes from the caller so the reducer stays pure.
      const { id, status, manual = false, at = null } = action.payload;
      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.id !== id || !canTransition(order.status, status)) return order;
          return {
            ...order,
            status,
            // Once a manager changes the status by hand, automatic timers stop.
            manualOverride: order.manualOverride || manual,
            statusHistory: [...(order.statusHistory || []), { status, at }],
          };
        }),
      };
    }

    default:
      return state;
  }
}

export default ordersReducer;
