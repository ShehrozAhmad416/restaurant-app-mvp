import { categoryImages } from './categories';

// 16 menu items across 4 categories. Prices are in Pakistani rupees (Rs).
// `image` points to a local asset so the app works fully offline.
const item = (id, name, description, price, category, isSpecial = false, isAvailable = true) => ({
  id,
  name,
  description,
  price,
  category,
  image: categoryImages[category],
  isSpecial,
  isAvailable,
});

export const menu = [
  item('m1', 'Chicken Tikka Bites', 'Charred boneless tikka with mint chutney', 650, 'Starters', true),
  item('m2', 'Dahi Bhallay', 'Lentil dumplings, spiced yoghurt and tamarind', 420, 'Starters'),
  item('m3', 'Vegetable Samosa (4)', 'Crisp pastry filled with spiced potato and peas', 300, 'Starters'),
  item('m4', 'Seekh Kebab', 'Minced beef skewers straight off the grill', 780, 'Starters', false, false),
  item('m5', 'Chicken Karahi (Half)', 'Tomato, ginger and green chilli, wok-cooked', 1450, 'Mains', true),
  item('m6', 'Mutton Biryani', 'Aged basmati with slow-cooked mutton and raita', 1100, 'Mains'),
  item('m7', 'Daal Makhni', 'Black lentils simmered overnight in butter', 720, 'Mains'),
  item('m8', 'Beef Nihari', 'Slow-braised shank with ginger and fresh naan', 1250, 'Mains'),
  item('m9', 'Grilled Fish', 'Lemon-pepper fillet with sautéed greens', 1650, 'Mains', false, false),
  item('m10', 'Gulab Jamun (3)', 'Warm milk dumplings in rose syrup', 350, 'Desserts'),
  item('m11', 'Kheer', 'Rice pudding with cardamom and pistachio', 380, 'Desserts', true),
  item('m12', 'Molten Chocolate Cake', 'Gooey centre with vanilla ice cream', 690, 'Desserts'),
  item('m13', 'Mint Margarita', 'Crushed mint, lemon and soda', 390, 'Drinks'),
  item('m14', 'Sweet Lassi', 'Churned yoghurt with a hint of rose', 320, 'Drinks'),
  item('m15', 'Doodh Patti Chai', 'Strong milk tea with cardamom', 180, 'Drinks', true),
  item('m16', 'Fresh Lime Soda', 'Sweet or salted, your choice', 250, 'Drinks'),
];

// Simulated network settings for the Menu screen (Question 4).
export const MENU_LOAD_DELAY_MS = 1500;
// Set to a value such as 0.3 to test the error message and Retry button.
export const SIMULATED_FAILURE_RATE = 0;

export default menu;
