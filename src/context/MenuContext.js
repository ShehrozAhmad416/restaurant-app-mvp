import { createContext, useContext, useMemo } from 'react';
import { initialMenuState, menuReducer } from '../reducers/menuReducer';
import usePersistedReducer from '../hooks/usePersistedReducer';

// Shared menu state: Manager edits appear on the customer Menu immediately.
const MenuContext = createContext(null);
export const MENU_STORAGE_KEY = '@restaurant/menu';

export function MenuProvider({ children }) {
  const [state, dispatch, isHydrated] = usePersistedReducer(menuReducer, initialMenuState, MENU_STORAGE_KEY);

  const value = useMemo(
    () => ({ items: state.items, dispatch, isHydrated }),
    [state.items, dispatch, isHydrated],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used inside <MenuProvider>. Wrap your app with MenuProvider in App.js.');
  }
  return context;
}

export default MenuContext;
