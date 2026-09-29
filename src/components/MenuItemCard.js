import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatPrice } from '../utils/format';
import { radius } from '../theme/colors';

/**
 * Question 8: wrapped in React.memo. With stable handlers from useCallback
 * in MenuScreen, only the card whose props changed re-renders
 * (for example the one whose heart was tapped).
 */
function MenuItemCard({ item, isFavorite, quantityInCart, canOrder, onAddToCart, onToggleFavorite }) {
  const { colors } = useTheme();
  console.log(`[render] MenuItemCard: ${item.name}`);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: item.isAvailable ? 1 : 0.5 },
      ]}
    >
      <Image source={item.image} style={styles.image} accessibilityIgnoresInvertColors />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={styles.titleCol}>
            {item.isSpecial && (
              <View style={[styles.badge, { backgroundColor: colors.successSoft }]}>
                <Text style={[styles.badgeText, { color: colors.success }]}>Daily Special</Text>
              </View>
            )}
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
          </View>
          <Pressable
            onPress={() => onToggleFavorite(item.id)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? `Remove ${item.name} from favourites` : `Add ${item.name} to favourites`}
            accessibilityState={{ selected: isFavorite }}
            style={styles.heart}
          >
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={24} color={colors.primary} />
          </Pressable>
        </View>
        <Text style={[styles.description, { color: colors.muted }]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.footer}>
          <View>
            <Text style={[styles.price, { color: colors.text }]}>{formatPrice(item.price)}</Text>
            {quantityInCart > 0 && (
              <Text style={[styles.inCart, { color: colors.success }]}>{quantityInCart} in cart</Text>
            )}
          </View>
          {canOrder ? (
            <Pressable
              onPress={() => onAddToCart(item)}
              disabled={!item.isAvailable}
              accessibilityRole="button"
              accessibilityLabel={item.isAvailable ? `Add ${item.name} to cart` : `${item.name} is unavailable`}
              accessibilityState={{ disabled: !item.isAvailable }}
              style={({ pressed }) => [
                styles.addButton,
                {
                  backgroundColor: item.isAvailable ? colors.primary : colors.disabled,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={[styles.addText, { color: item.isAvailable ? colors.onPrimary : colors.muted }]}>
                {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
              </Text>
            </Pressable>
          ) : (
            <Text style={[styles.inCart, { color: colors.muted }]}>
              {item.isAvailable ? 'Available' : 'Switched off'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

export default memo(MenuItemCard);

const styles = StyleSheet.create({
  card: { flexDirection: 'row', padding: 12, gap: 12, borderRadius: radius.lg, borderWidth: 1 },
  image: { width: 80, height: 80, borderRadius: radius.md },
  body: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  titleCol: { flex: 1, gap: 4 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  name: { fontSize: 16, fontWeight: '700' },
  heart: { padding: 4 },
  description: { fontSize: 13, lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  price: { fontSize: 15, fontWeight: '700' },
  inCart: { fontSize: 12, fontWeight: '700' },
  addButton: { minHeight: 40, paddingHorizontal: 14, borderRadius: 10, justifyContent: 'center' },
  addText: { fontSize: 14, fontWeight: '700' },
});
