// src/utils/suggestions.js

// --- Substitutes: shown when an item that has a common alternative is added ---
export const SUBSTITUTE_MAP = {
  milk: ['almond milk', 'oat milk', 'soy milk'],
  bread: ['gluten-free bread', 'sourdough bread'],
  sugar: ['honey', 'stevia'],
  butter: ['margarine', 'olive oil'],
  'white rice': ['brown rice', 'quinoa'],
  beef: ['plant-based mince', 'chicken'],
};

export function getSubstitutes(itemName) {
  const key = itemName.toLowerCase().trim();
  return SUBSTITUTE_MAP[key] || [];
}

// --- Seasonal suggestions: static list, simulates "in season / on sale" items ---
// In a real product this would come from a live catalog/promo feed.
export const SEASONAL_ITEMS = [
  { name: 'strawberries', note: 'In season' },
  { name: 'watermelon', note: 'On sale' },
  { name: 'corn', note: 'In season' },
  { name: 'peaches', note: 'In season' },
];

export function getSeasonalSuggestions(currentItemNames = []) {
  const lowerCurrent = currentItemNames.map((n) => n.toLowerCase());
  // Don't suggest something already on the list
  return SEASONAL_ITEMS.filter((s) => !lowerCurrent.includes(s.name.toLowerCase()));
}

// --- "Running low" / frequently-bought suggestions ---
// Simulates purchase history with a static "usually buy" list, since there's no
// real historical data in an 8-12 hour build. Suggests items from this list that
// aren't currently on the shopping list.
export const FREQUENTLY_BOUGHT = ['milk', 'eggs', 'bread', 'bananas', 'coffee'];

export function getRunningLowSuggestions(currentItemNames = []) {
  const lowerCurrent = currentItemNames.map((n) => n.toLowerCase());
  return FREQUENTLY_BOUGHT.filter((item) => !lowerCurrent.includes(item.toLowerCase()));
}