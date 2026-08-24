// src/utils/suggestions.js

// ==========================================
// 1. FALLBACK STATIC DATA
// ==========================================

export const SUBSTITUTE_MAP = {
  milk: ['almond milk', 'oat milk', 'soy milk'],
  bread: ['gluten-free bread', 'sourdough bread'],
  sugar: ['honey', 'stevia'],
  butter: ['margarine', 'olive oil'],
  'white rice': ['brown rice', 'quinoa'],
  beef: ['plant-based mince', 'chicken'],
};

export const SEASONAL_ITEMS = [
  { name: 'strawberries', note: 'In season' },
  { name: 'watermelon', note: 'On sale' },
  { name: 'corn', note: 'In season' },
  { name: 'peaches', note: 'In season' },
];

export const FREQUENTLY_BOUGHT = ['milk', 'eggs', 'bread', 'bananas', 'coffee'];


// ==========================================
// 2. FALLBACK HELPER FUNCTIONS
// ==========================================

export function getSubstitutes(itemName) {
  if (!itemName) return [];
  const key = itemName.toLowerCase().trim();
  return SUBSTITUTE_MAP[key] || [];
}

export function getSeasonalSuggestions(currentItemNames = []) {
  const lowerCurrent = currentItemNames.map((n) => n.toLowerCase());
  return SEASONAL_ITEMS.filter((s) => !lowerCurrent.includes(s.name.toLowerCase()));
}

export function getRunningLowSuggestions(currentItemNames = []) {
  const lowerCurrent = currentItemNames.map((n) => n.toLowerCase());
  return FREQUENTLY_BOUGHT.filter((item) => !lowerCurrent.includes(item.toLowerCase()));
}


// ==========================================
// 3. MAIN ASYNC RECOMMENDER (ML + FALLBACK)
// ==========================================

/**
 * Fetches collaborative filtering recommendations from the Python backend.
 * Falls back to static rules if the API fails.
 * 
 * @param {Array<string>} currentItemNames - Array of item names currently in the cart
 * @param {string|null} lastAddedItem - The name of the item just added (to fetch substitutes)
 * @returns {Promise<Array<Object>>} Array of suggestion objects { name, type, note }
 */
export async function getRecommendations(currentItemNames = [], lastAddedItem = null) {
  let suggestions = [];

  // Step 1: Always check for local substitutes first if an item was just added
  if (lastAddedItem) {
    const subs = getSubstitutes(lastAddedItem);
    suggestions.push(...subs.map(name => ({
      name,
      type: 'Substitute',
      note: `Instead of ${lastAddedItem}`
    })));
  }

  // Step 2: Try to get algorithmic suggestions from the backend
  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart: currentItemNames })
    });
    
    if (!response.ok) throw new Error('ML Recommendation API failed');
    
    const data = await response.json();
    
    // Append the ML-driven frequently bought items
    const mlSuggestions = data.suggested.map(name => ({
      name,
      type: 'Frequently Bought',
      note: 'Based on purchase history'
    }));
    
    suggestions.push(...mlSuggestions);
    
    // Add a couple of seasonal items to round it out
    const seasonal = getSeasonalSuggestions(currentItemNames).slice(0, 2);
    suggestions.push(...seasonal.map(item => ({
      name: item.name,
      type: 'Seasonal',
      note: item.note
    })));

    return suggestions;
    
  } catch (error) {
    console.warn("Algorithmic recommendations failed, using local static rules:", error);
    
    // Step 3: Graceful Fallback - Compose local rule-based suggestions
    const runningLow = getRunningLowSuggestions(currentItemNames);
    suggestions.push(...runningLow.map(name => ({
      name,
      type: 'Frequently Bought',
      note: 'Usually buy'
    })));

    const seasonal = getSeasonalSuggestions(currentItemNames);
    suggestions.push(...seasonal.map(item => ({
      name: item.name,
      type: 'Seasonal',
      note: item.note
    })));

    // Return the fallback array (deduplicated by a quick filter if needed)
    return suggestions;
  }
}