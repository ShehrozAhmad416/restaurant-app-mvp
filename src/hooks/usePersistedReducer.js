import { useEffect, useReducer, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Question 10: useReducer + AsyncStorage persistence.
 * 1. On mount, loads saved state and dispatches { type: 'HYDRATE' }.
 * 2. After loading, saves state whenever it changes.
 * `isHydrated` lets the app show a loading screen instead of flashing empty data.
 */
export default function usePersistedReducer(reducer, initialState, storageKey) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (!cancelled && raw) dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) });
      })
      .catch((error) => console.warn(`Could not load ${storageKey}`, error))
      .finally(() => {
        if (!cancelled) setIsHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!isHydrated) return; // never overwrite saved data with the initial state
    AsyncStorage.setItem(storageKey, JSON.stringify(state)).catch((error) =>
      console.warn(`Could not save ${storageKey}`, error),
    );
  }, [state, isHydrated, storageKey]);

  return [state, dispatch, isHydrated];
}
