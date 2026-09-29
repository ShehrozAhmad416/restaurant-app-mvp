import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { MenuProvider } from './src/context/MenuContext';
import { ReservationsProvider } from './src/context/ReservationsContext';
import { OrdersProvider } from './src/context/OrdersContext';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';

// All global state is provided here, so screens never need prop drilling.
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <MenuProvider>
            <ReservationsProvider>
              <OrdersProvider>
                <CartProvider>
                  <AppNavigator />
                </CartProvider>
              </OrdersProvider>
            </ReservationsProvider>
          </MenuProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
