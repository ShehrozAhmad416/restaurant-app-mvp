// Categories data set. "All" is a UI-only filter and is not stored here.
export const categories = [
  { id: 'starters', name: 'Starters', sortOrder: 1 },
  { id: 'mains', name: 'Mains', sortOrder: 2 },
  { id: 'desserts', name: 'Desserts', sortOrder: 3 },
  { id: 'drinks', name: 'Drinks', sortOrder: 4 },
];

export const ALL_CATEGORY = 'All';

export const categoryImages = {
  Starters: require('../../assets/menu/starters.png'),
  Mains: require('../../assets/menu/mains.png'),
  Desserts: require('../../assets/menu/desserts.png'),
  Drinks: require('../../assets/menu/drinks.png'),
};

export default categories;
