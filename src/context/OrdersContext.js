import { createContext, useContext, useMemo } from 'react';
import { initialOrdersState, ordersReducer } from '../reducers/ordersReducer';
import usePersistedReducer from '../hooks/usePersistedReducer';

const OrdersContext = createContext(null);
export const ORDERS_STORAGE_KEY = '@restaurant/orders';

export function OrdersProvider({ children }) {
  const [state, dispatch, isHydrated] = usePersistedReducer(
    ordersReducer,
    initialOrdersState,
    ORDERS_STORAGE_KEY,
  );

  const value = useMemo(
    () => ({ orders: state.orders, dispatch, isHydrated }),
    [state.orders, dispatch, isHydrated],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used inside <OrdersProvider>. Wrap your app with OrdersProvider in App.js.');
  }
  return context;
}

export default OrdersContext;
