import { createContext, useContext, useMemo, useReducer } from 'react';
import { cartReducer, initialCartState } from '../reducers/cartReducer';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  const itemCount = useMemo(
    () => state.items.reduce((sum, line) => sum + line.quantity, 0),
    [state.items],
  );

  const value = useMemo(() => ({ state, dispatch, itemCount }), [state, itemCount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside <CartProvider>. Wrap your app with CartProvider in App.js.');
  }
  return context;
}

export default CartContext;
