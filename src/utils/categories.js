// src/utils/categories.js

export const CATEGORY_MAP = {
  // Dairy
  milk: 'Dairy', cheese: 'Dairy', butter: 'Dairy', yogurt: 'Dairy',
  cream: 'Dairy', 'almond milk': 'Dairy', 'oat milk': 'Dairy', eggs: 'Dairy',

  // Produce
  apples: 'Produce', apple: 'Produce', bananas: 'Produce', banana: 'Produce',
  oranges: 'Produce', orange: 'Produce', tomatoes: 'Produce', tomato: 'Produce',
  onions: 'Produce', onion: 'Produce', potatoes: 'Produce', potato: 'Produce',
  lettuce: 'Produce', spinach: 'Produce', carrots: 'Produce', carrot: 'Produce',
  garlic: 'Produce', avocado: 'Produce', avocados: 'Produce',

  // Bakery
  bread: 'Bakery', bagels: 'Bakery', bagel: 'Bakery', croissant: 'Bakery',
  croissants: 'Bakery', buns: 'Bakery',

  // Snacks
  chips: 'Snacks', cookies: 'Snacks', crackers: 'Snacks', chocolate: 'Snacks',
  popcorn: 'Snacks', nuts: 'Snacks',

  // Beverages
  water: 'Beverages', juice: 'Beverages', soda: 'Beverages', coffee: 'Beverages',
  tea: 'Beverages',

  // Meat & Seafood
  chicken: 'Meat & Seafood', beef: 'Meat & Seafood', fish: 'Meat & Seafood',
  shrimp: 'Meat & Seafood', pork: 'Meat & Seafood', bacon: 'Meat & Seafood',

  // Pantry
  rice: 'Pantry', pasta: 'Pantry', flour: 'Pantry', sugar: 'Pantry',
  salt: 'Pantry', oil: 'Pantry', cereal: 'Pantry', beans: 'Pantry',

  // Household
  toothpaste: 'Household', soap: 'Household', shampoo: 'Household',
  detergent: 'Household', 'toilet paper': 'Household',
};

export function categorize(itemName) {
  const key = itemName.toLowerCase().trim();
  return CATEGORY_MAP[key] || 'Other';
}