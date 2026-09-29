import { useMemo } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import { useOrders } from '../context/OrdersContext';
import { useReservations } from '../context/ReservationsContext';
import { ROLES } from '../data/users';
import { navigationRef } from './navigationRef';

import LoadingScreen from '../components/LoadingScreen';
import LoginScreen from '../screens/LoginScreen';
import MenuScreen from '../screens/MenuScreen';
import ReservationScreen from '../screens/ReservationScreen';
import CartScreen from '../screens/CartScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const MenuStack = createNativeStackNavigator();
const ReserveStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const DashboardStack = createNativeStackNavigator();

function useStackOptions() {
  const { colors } = useTheme();
  return {
    headerStyle: { backgroundColor: colors.card },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '700' },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: colors.background },
  };
}

// ---- Nested stacks (one per tab) ----
function MenuStackScreen() {
  const options = useStackOptions();
  return (
    <MenuStack.Navigator screenOptions={options}>
      <MenuStack.Screen name="Menu" component={MenuScreen} />
    </MenuStack.Navigator>
  );
}
function ReserveStackScreen() {
  const options = useStackOptions();
  return (
    <ReserveStack.Navigator screenOptions={options}>
      <ReserveStack.Screen name="Reservation" component={ReservationScreen} options={{ title: 'Book a Table' }} />
    </ReserveStack.Navigator>
  );
}
function CartStackScreen() {
  const options = useStackOptions();
  return (
    <CartStack.Navigator screenOptions={options}>
      <CartStack.Screen name="Cart" component={CartScreen} options={{ title: 'Your Cart' }} />
      <CartStack.Screen name="OrderSummary" component={OrderSummaryScreen} options={{ title: 'Order Summary' }} />
    </CartStack.Navigator>
  );
}
function OrdersStackScreen() {
  const options = useStackOptions();
  return (
    <OrdersStack.Navigator screenOptions={options}>
      <OrdersStack.Screen name="MyOrders" component={MyOrdersScreen} options={{ title: 'My Orders' }} />
      <OrdersStack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ title: 'Order Tracking' }} />
    </OrdersStack.Navigator>
  );
}
function ProfileStackScreen() {
  const options = useStackOptions();
  return (
    <ProfileStack.Navigator screenOptions={options}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
}
function DashboardStackScreen() {
  const options = useStackOptions();
  return (
    <DashboardStack.Navigator screenOptions={options}>
      <DashboardStack.Screen name="ManagerDashboard" component={ManagerDashboardScreen} options={{ title: 'Manager Dashboard' }} />
      <DashboardStack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ title: 'Order Details' }} />
    </DashboardStack.Navigator>
  );
}

const TAB_ICONS = {
  DashboardTab: 'grid',
  MenuTab: 'restaurant',
  ReserveTab: 'calendar',
  CartTab: 'bag-handle',
  OrdersTab: 'receipt',
  ProfileTab: 'person-circle',
};

// ---- Bottom tabs; the Dashboard tab exists only for managers ----
function MainTabs() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { itemCount } = useCart();
  if (!user) return null;
  const isManager = user.role === ROLES.MANAGER;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? TAB_ICONS[route.name] : `${TAB_ICONS[route.name]}-outline`} size={size} color={color} />
        ),
      })}
    >
      {isManager && <Tab.Screen name="DashboardTab" component={DashboardStackScreen} options={{ title: 'Dashboard' }} />}
      <Tab.Screen name="MenuTab" component={MenuStackScreen} options={{ title: 'Menu' }} />
      {!isManager && (
        <>
          <Tab.Screen name="ReserveTab" component={ReserveStackScreen} options={{ title: 'Reserve' }} />
          <Tab.Screen
            name="CartTab"
            component={CartStackScreen}
            options={{
              title: 'Cart',
              tabBarBadge: itemCount > 0 ? itemCount : undefined,
              tabBarBadgeStyle: { backgroundColor: colors.success, color: colors.onSuccess },
            }}
          />
          <Tab.Screen name="OrdersTab" component={OrdersStackScreen} options={{ title: 'Orders' }} />
        </>
      )}
      <Tab.Screen name="ProfileTab" component={ProfileStackScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { colors, isDark } = useTheme();
  const menu = useMenu();
  const orders = useOrders();
  const reservations = useReservations();

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
        notification: colors.success,
      },
    };
  }, [isDark, colors]);

  // Question 10: wait for AsyncStorage before showing any data.
  if (!menu.isHydrated || !orders.isHydrated || !reservations.isHydrated) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="Main" component={MainTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
