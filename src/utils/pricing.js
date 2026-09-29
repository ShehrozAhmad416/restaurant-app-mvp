import { SALES_TAX_RATE, SERVICE_CHARGE_RATE } from '../constants/pricing';

// Pure calculation, used inside useMemo on the Order Summary screen.
export const calculateTotals = (items, discountPercent = 0) => {
  const subtotal = items.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const serviceCharge = Math.round(subtotal * SERVICE_CHARGE_RATE);
  const salesTax = Math.round(subtotal * SALES_TAX_RATE);
  const discount = Math.round((subtotal * discountPercent) / 100);
  const grandTotal = subtotal + serviceCharge + salesTax - discount;
  return { subtotal, serviceCharge, salesTax, discount, grandTotal };
};
