import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useMenu } from '../context/MenuContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CART_ACTIONS } from '../reducers/cartReducer';
import useDebounce from '../hooks/useDebounce';
import MenuItemCard from '../components/MenuItemCard';
import Chip from '../components/Chip';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';
import { ALL_CATEGORY, categories } from '../data/categories';
import { MENU_LOAD_DELAY_MS, SIMULATED_FAILURE_RATE } from '../data/menu';
import { ROLES } from '../data/users';
import { radius } from '../theme/colors';

const SEARCH_DELAY_MS = 400;
const BACK_TO_TOP_OFFSET = 300;
const MAX_RECENT_SEARCHES = 5;
const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'priceAsc', label: 'Price: low to high' },
  { value: 'priceDesc', label: 'Price: high to low' },
  { value: 'nameAsc', label: 'Name: A to Z' },
];
const CATEGORY_FILTERS = [ALL_CATEGORY, ...categories.map((c) => c.name)];

export default function MenuScreen({ navigation }) {
  const { colors } = useTheme();
  const { items: sharedMenuItems } = useMenu();
  const { state: cart, dispatch } = useCart();
  const { user } = useAuth();
  const canOrder = user?.role === ROLES.CUSTOMER;

  // ---------------- Question 4: loading with useEffect ----------------
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);

  const loadTimerRef = useRef(null);
  const latestMenuRef = useRef(sharedMenuItems);
  latestMenuRef.current = sharedMenuItems;

  // "Fetches" the menu from a Promise that resolves after 1.5 s.
  const loadMenu = useCallback((isRefresh = false) => {
    clearTimeout(loadTimerRef.current);
    if (!isRefresh) setIsLoading(true);
    setError(null);
    return new Promise((resolve, reject) => {
      loadTimerRef.current = setTimeout(() => {
        if (Math.random() < SIMULATED_FAILURE_RATE) reject(new Error('Could not load the menu. Please try again.'));
        else resolve(latestMenuRef.current);
      }, MENU_LOAD_DELAY_MS);
    })
      .then((data) => setMenuItems(data))
      .catch((err) => setError(err.message))
      .finally(() => {
        setIsLoading(false);
        setRefreshing(false);
      });
  }, []);

  // Empty dependency array: runs once when the screen mounts.
  useEffect(() => {
    loadMenu();
    // Cleanup: clear the timer so no state update happens after unmount.
    return () => clearTimeout(loadTimerRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the loaded list in sync with Manager edits (shared MenuContext state).
  useEffect(() => {
    if (!isLoading && !error) setMenuItems(sharedMenuItems);
  }, [sharedMenuItems]); // eslint-disable-line react-hooks/exhaustive-deps

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMenu(true);
  }, [loadMenu]);

  // ---------------- Question 5: refs ----------------
  const searchInputRef = useRef(null);
  const listRef = useRef(null);
  const previousQueryRef = useRef('');

  // Render counter. Changing a ref's .current does NOT trigger a re-render,
  // because React does not track refs: a ref is a plain mutable box that
  // survives renders. Calling a state setter DOES re-render, because React
  // stores state itself and schedules a render when it changes. That is why
  // incrementing this counter on every render never causes an infinite loop.
  const renderCount = useRef(0);
  renderCount.current += 1;

  const [searchText, setSearchText] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Question 9: useDebounce replaces the manual ref-based debounce from Question 5.
  const debouncedSearch = useDebounce(searchText, SEARCH_DELAY_MS);

  // Save applied searches as recent terms, skipping duplicate consecutive searches.
  useEffect(() => {
    const term = debouncedSearch.trim();
    if (term.length < 2 || term.toLowerCase() === previousQueryRef.current) return;
    previousQueryRef.current = term.toLowerCase();
    setRecentSearches((prev) =>
      [term, ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, MAX_RECENT_SEARCHES),
    );
  }, [debouncedSearch]);

  const focusSearch = () => searchInputRef.current?.focus();
  const clearSearch = () => {
    setSearchText('');
    searchInputRef.current?.focus(); // keep focus after clearing
  };
  const scrollToTop = () => listRef.current?.scrollToOffset({ offset: 0, animated: true });
  const handleScroll = useCallback((event) => {
    const shouldShow = event.nativeEvent.contentOffset.y > BACK_TO_TOP_OFFSET;
    setShowBackToTop((prev) => (prev === shouldShow ? prev : shouldShow));
  }, []);

  // ---------------- Question 8: memoisation ----------------
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [sortOrder, setSortOrder] = useState('default');

  // Derived data is computed, NOT stored in state. Keeping filteredItems in
  // state (as in Question 4) means a second copy that must be synced by an
  // effect, which costs an extra render and can go stale. useMemo recomputes
  // it only when one of its inputs changes.
  const visibleItems = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    const filtered = menuItems.filter((item) => {
      const inCategory = selectedCategory === ALL_CATEGORY || item.category === selectedCategory;
      const matches =
        !query || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
      return inCategory && matches;
    });
    const sorted = [...filtered];
    if (sortOrder === 'priceAsc') sorted.sort((a, b) => a.price - b.price);
    if (sortOrder === 'priceDesc') sorted.sort((a, b) => b.price - a.price);
    if (sortOrder === 'nameAsc') sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [menuItems, selectedCategory, debouncedSearch, sortOrder]);

  const quantities = useMemo(
    () => Object.fromEntries(cart.items.map((line) => [line.id, line.quantity])),
    [cart.items],
  );

  // Stable handler references so React.memo on MenuItemCard can skip re-renders.
  const handleAddToCart = useCallback(
    (item) => dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: item }),
    [dispatch],
  );
  const handleToggleFavorite = useCallback((id) => {
    setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const cycleSort = () => {
    const index = SORT_OPTIONS.findIndex((o) => o.value === sortOrder);
    setSortOrder(SORT_OPTIONS[(index + 1) % SORT_OPTIONS.length].value);
  };

  // Question 4: header title shows the number of items currently shown.
  useEffect(() => {
    navigation.setOptions({ title: `Menu (${visibleItems.length})` });
  }, [navigation, visibleItems.length]);

  const renderItem = useCallback(
    ({ item }) => (
      <MenuItemCard
        item={item}
        isFavorite={favoriteIds.includes(item.id)}
        quantityInCart={quantities[item.id] || 0}
        canOrder={canOrder}
        onAddToCart={handleAddToCart}
        onToggleFavorite={handleToggleFavorite}
      />
    ),
    [favoriteIds, quantities, canOrder, handleAddToCart, handleToggleFavorite],
  );

  // ---------------- UI ----------------
  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.muted, { color: colors.muted }]}>Loading menu…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <EmptyState icon="cloud-offline-outline" title="Something went wrong" message={error}>
          <PrimaryButton title="Retry" onPress={() => loadMenu()} style={styles.retry} />
        </EmptyState>
      </View>
    );
  }

  const showRecent = isSearchFocused && searchText.length === 0 && recentSearches.length > 0;
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortOrder).label;

  const header = (
    <View style={styles.headerBlock}>
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Pressable onPress={focusSearch} accessibilityRole="button" accessibilityLabel="Search the menu" style={styles.iconButton}>
          <Ionicons name="search" size={20} color={colors.muted} />
        </Pressable>
        <TextInput
          ref={searchInputRef}
          value={searchText}
          onChangeText={setSearchText}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          placeholder="Search biryani, chai…"
          placeholderTextColor={colors.muted}
          accessibilityLabel="Search menu"
          returnKeyType="search"
          style={[styles.searchInput, { color: colors.text }]}
        />
        {searchText.length > 0 && (
          <Pressable onPress={clearSearch} accessibilityRole="button" accessibilityLabel="Clear search" style={styles.iconButton}>
            <Ionicons name="close-circle" size={20} color={colors.muted} />
          </Pressable>
        )}
      </View>

      {showRecent && (
        <View style={styles.recentRow}>
          <Text style={[styles.small, { color: colors.muted }]}>Recent:</Text>
          {recentSearches.map((term) => (
            <Chip key={term} label={term} onPress={() => setSearchText(term)} style={styles.smallChip} />
          ))}
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {CATEGORY_FILTERS.map((name) => (
          <Chip key={name} label={name} selected={selectedCategory === name} onPress={() => setSelectedCategory(name)} />
        ))}
      </ScrollView>

      <View style={styles.metaRow}>
        <Text style={[styles.small, { color: colors.muted }]}>Renders: {renderCount.current}</Text>
        <Pressable
          onPress={cycleSort}
          accessibilityRole="button"
          accessibilityLabel={`Sort: ${sortLabel}. Tap to change`}
          style={[styles.sortButton, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Ionicons name="swap-vertical" size={16} color={colors.primary} />
          <Text style={[styles.sortText, { color: colors.text }]}>{sortLabel}</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <FlatList
        ref={listRef}
        data={visibleItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No dishes found"
            message={`Nothing on the menu matches “${debouncedSearch}”. Try another word or category.`}
          />
        }
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={8}
      />
      {showBackToTop && (
        <Pressable
          onPress={scrollToTop}
          accessibilityRole="button"
          accessibilityLabel="Back to top"
          style={[styles.backToTop, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="arrow-up" size={18} color={colors.onPrimary} />
          <Text style={[styles.backToTopText, { color: colors.onPrimary }]}>Back to top</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  muted: { fontSize: 15 },
  retry: { marginTop: 8, alignSelf: 'stretch' },
  listContent: { padding: 16, paddingBottom: 96 },
  separator: { height: 12 },
  headerBlock: { gap: 12, marginBottom: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.md, minHeight: 50 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 10 },
  recentRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  smallChip: { minHeight: 34, paddingHorizontal: 12 },
  chipRow: { gap: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  small: { fontSize: 12 },
  sortButton: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 38, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1 },
  sortText: { fontSize: 13, fontWeight: '700' },
  backToTop: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  backToTopText: { fontSize: 14, fontWeight: '700' },
});
