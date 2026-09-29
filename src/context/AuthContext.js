import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { users as mockUsers } from '../data/users';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Accounts created with Signup are added to this in-memory list.
  const [users, setUsers] = useState(mockUsers);

  const login = useCallback((account) => {
    // Never keep the password in global state.
    const { password, ...safeUser } = account;
    setUser(safeUser);
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const registerUser = useCallback((account) => setUsers((prev) => [...prev, account]), []);

  const value = useMemo(
    () => ({ user, users, login, logout, registerUser }),
    [user, users, login, logout, registerUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>. Wrap your app with AuthProvider in App.js.');
  }
  return context;
}

export default AuthContext;
