import { createContext, useContext, useMemo } from 'react';
import { initialReservationsState, reservationsReducer } from '../reducers/reservationsReducer';
import usePersistedReducer from '../hooks/usePersistedReducer';

const ReservationsContext = createContext(null);
export const RESERVATIONS_STORAGE_KEY = '@restaurant/reservations';

export function ReservationsProvider({ children }) {
  const [state, dispatch, isHydrated] = usePersistedReducer(
    reservationsReducer,
    initialReservationsState,
    RESERVATIONS_STORAGE_KEY,
  );

  const value = useMemo(
    () => ({ reservations: state.reservations, dispatch, isHydrated }),
    [state.reservations, dispatch, isHydrated],
  );

  return <ReservationsContext.Provider value={value}>{children}</ReservationsContext.Provider>;
}

export function useReservations() {
  const context = useContext(ReservationsContext);
  if (!context) {
    throw new Error(
      'useReservations must be used inside <ReservationsProvider>. Wrap your app with ReservationsProvider in App.js.',
    );
  }
  return context;
}

export default ReservationsContext;
