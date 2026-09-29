import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { darkColors, lightColors } from '../theme/colors';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);

  const value = useMemo(
    () => ({ isDark, toggleTheme, colors: isDark ? darkColors : lightColors }),
    [isDark, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside <ThemeProvider>. Wrap your app with ThemeProvider in App.js.');
  }
  return context;
}

export default ThemeContext;
