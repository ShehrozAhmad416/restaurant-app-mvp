import { useEffect, useState } from 'react';

/**
 * Question 9: returns `value` only after it has stopped changing for `delay` ms.
 * Replaces the manual useRef-based debounce from Question 5.
 */
export default function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delay);
    // Runs on every keystroke (value change) and on unmount.
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}
