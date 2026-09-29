import { CART_ACTIONS, cartReducer, initialCartState } from '../src/reducers/cartReducer';

const biryani = { id: 'm6', name: 'Mutton Biryani', price: 1100, isAvailable: true };
const chai = { id: 'm15', name: 'Doodh Patti Chai', price: 180, isAvailable: true };
const kebab = { id: 'm4', name: 'Seekh Kebab', price: 780, isAvailable: false };

const line = (item, quantity = 1, note = '') => ({ id: item.id, name: item.name, price: item.price, quantity, note });
const withItems = (...items) => ({ ...initialCartState, items });

describe('cartReducer', () => {
  test('TC1 ADD_ITEM adds a new line with quantity 1', () => {
    const next = cartReducer(initialCartState, { type: CART_ACTIONS.ADD_ITEM, payload: biryani });
    expect(next.items).toEqual([line(biryani, 1)]);
  });

  test('TC2 ADD_ITEM on an existing item increases its quantity', () => {
    const next = cartReducer(withItems(line(biryani, 1)), { type: CART_ACTIONS.ADD_ITEM, payload: biryani });
    expect(next.items).toEqual([line(biryani, 2)]);
  });

  test('TC3 ADD_ITEM ignores unavailable items', () => {
    const state = withItems();
    expect(cartReducer(state, { type: CART_ACTIONS.ADD_ITEM, payload: kebab })).toBe(state);
  });

  test('TC4 INCREMENT raises the quantity by one', () => {
    const next = cartReducer(withItems(line(chai, 2)), { type: CART_ACTIONS.INCREMENT, payload: { id: chai.id } });
    expect(next.items[0].quantity).toBe(3);
  });

  test('TC5 DECREMENT at quantity 1 removes the item', () => {
    const next = cartReducer(withItems(line(chai, 1), line(biryani, 2)), {
      type: CART_ACTIONS.DECREMENT,
      payload: { id: chai.id },
    });
    expect(next.items).toEqual([line(biryani, 2)]);
  });

  test('TC6 REMOVE_ITEM removes the line regardless of quantity', () => {
    const next = cartReducer(withItems(line(chai, 5)), { type: CART_ACTIONS.REMOVE_ITEM, payload: { id: chai.id } });
    expect(next.items).toEqual([]);
  });

  test('TC7 UPDATE_NOTE sets special instructions on one item', () => {
    const next = cartReducer(withItems(line(biryani, 1)), {
      type: CART_ACTIONS.UPDATE_NOTE,
      payload: { id: biryani.id, note: 'no onions' },
    });
    expect(next.items[0].note).toBe('no onions');
  });

  test('TC8 APPLY_PROMO accepts a valid code (case-insensitive)', () => {
    const next = cartReducer(withItems(line(biryani)), { type: CART_ACTIONS.APPLY_PROMO, payload: { code: 'feast20' } });
    expect(next.promoCode).toBe('FEAST20');
    expect(next.discountPercent).toBe(20);
  });

  test('TC9 APPLY_PROMO rejects an invalid code and leaves state unchanged', () => {
    const state = withItems(line(biryani));
    expect(cartReducer(state, { type: CART_ACTIONS.APPLY_PROMO, payload: { code: 'FREEFOOD' } })).toBe(state);
  });

  test('TC10 REMOVE_PROMO clears the code and discount', () => {
    const state = { ...withItems(line(biryani)), promoCode: 'WELCOME10', discountPercent: 10 };
    const next = cartReducer(state, { type: CART_ACTIONS.REMOVE_PROMO });
    expect(next.promoCode).toBeNull();
    expect(next.discountPercent).toBe(0);
  });

  test('TC11 CLEAR_CART returns the initial state', () => {
    const state = { ...withItems(line(biryani), line(chai)), promoCode: 'WELCOME10', discountPercent: 10 };
    expect(cartReducer(state, { type: CART_ACTIONS.CLEAR_CART })).toEqual(initialCartState);
  });

  test('TC12 the reducer never mutates the previous state', () => {
    const state = withItems(line(biryani, 1));
    const frozen = JSON.parse(JSON.stringify(state));
    cartReducer(state, { type: CART_ACTIONS.INCREMENT, payload: { id: biryani.id } });
    cartReducer(state, { type: CART_ACTIONS.UPDATE_NOTE, payload: { id: biryani.id, note: 'extra raita' } });
    expect(state).toEqual(frozen);
  });
});
