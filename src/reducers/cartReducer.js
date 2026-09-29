import { PROMO_CODES } from '../data/promoCodes';

// Question 7: a pure reducer. It never mutates `state`; every branch returns
// a new object (or the same object when nothing changes).

export const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  UPDATE_NOTE: 'UPDATE_NOTE',
  CLEAR_CART: 'CLEAR_CART',
  APPLY_PROMO: 'APPLY_PROMO',
  REMOVE_PROMO: 'REMOVE_PROMO',
};

export const initialCartState = {
  items: [], // [{ id, name, price, quantity, note }]
  promoCode: null,
  discountPercent: 0,
};

const updateItem = (items, id, update) =>
  items.map((line) => (line.id === id ? { ...line, ...update(line) } : line));

export function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const menuItem = action.payload;
      if (!menuItem || !menuItem.isAvailable) return state;
      const exists = state.items.some((line) => line.id === menuItem.id);
      if (exists) {
        return {
          ...state,
          items: updateItem(state.items, menuItem.id, (line) => ({ quantity: line.quantity + 1 })),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          { id: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 1, note: '' },
        ],
      };
    }

    case CART_ACTIONS.REMOVE_ITEM:
      return { ...state, items: state.items.filter((line) => line.id !== action.payload.id) };

    case CART_ACTIONS.INCREMENT:
      return {
        ...state,
        items: updateItem(state.items, action.payload.id, (line) => ({ quantity: line.quantity + 1 })),
      };

    case CART_ACTIONS.DECREMENT: {
      // Removes the item when its quantity reaches zero.
      const items = state.items
        .map((line) => (line.id === action.payload.id ? { ...line, quantity: line.quantity - 1 } : line))
        .filter((line) => line.quantity > 0);
      return { ...state, items };
    }

    case CART_ACTIONS.UPDATE_NOTE:
      return {
        ...state,
        items: updateItem(state.items, action.payload.id, () => ({ note: action.payload.note })),
      };

    case CART_ACTIONS.CLEAR_CART:
      return initialCartState;

    case CART_ACTIONS.APPLY_PROMO: {
      const code = (action.payload.code || '').trim().toUpperCase();
      const percent = PROMO_CODES[code];
      if (!percent) return state; // invalid codes are rejected; the screen shows the error
      return { ...state, promoCode: code, discountPercent: percent };
    }

    case CART_ACTIONS.REMOVE_PROMO:
      return { ...state, promoCode: null, discountPercent: 0 };

    default:
      return state;
  }
}

// Helper used by the Cart screen before dispatching APPLY_PROMO.
export const isValidPromoCode = (code) => Boolean(PROMO_CODES[(code || '').trim().toUpperCase()]);

export default cartReducer;
