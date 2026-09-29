import { menu } from '../data/menu';
import { categoryImages } from '../data/categories';

export const MENU_ACTIONS = {
  HYDRATE: 'HYDRATE',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_PRICE: 'UPDATE_PRICE',
  TOGGLE_AVAILABILITY: 'TOGGLE_AVAILABILITY',
};

export const initialMenuState = { items: menu };

// `image` is a require() handle, which cannot be stored as JSON, so it is
// re-attached from the category when data is loaded from AsyncStorage.
const withImage = (item) => ({ ...item, image: categoryImages[item.category] });

export function menuReducer(state, action) {
  switch (action.type) {
    case MENU_ACTIONS.HYDRATE:
      return { items: (action.payload.items || state.items).map(withImage) };

    case MENU_ACTIONS.ADD_ITEM:
      return { ...state, items: [withImage(action.payload), ...state.items] };

    case MENU_ACTIONS.UPDATE_PRICE:
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, price: action.payload.price } : item,
        ),
      };

    case MENU_ACTIONS.TOGGLE_AVAILABILITY:
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, isAvailable: !item.isAvailable } : item,
        ),
      };

    default:
      return state;
  }
}

export default menuReducer;
