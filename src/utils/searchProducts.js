// src/utils/searchProducts.js
import { PRODUCTS } from '../data/products';

// Splits the query into words and matches products whose name/brand/category
// contain ANY of those words. Simple substring/keyword match — not a real
// search index, but sufficient for a small mock catalog within the time budget.
export function searchProducts(query, maxPrice = null) {
  const cleanQuery = (query || '').toLowerCase().trim();
  if (!cleanQuery) return [];

  const words = cleanQuery.split(/\s+/).filter(Boolean);

  let results = PRODUCTS.filter((product) => {
    const haystack = `${product.name} ${product.brand} ${product.category}`.toLowerCase();
    return words.some((word) => haystack.includes(word));
  });

  // Prioritize results where the product name itself contains the full query
  // (so "organic apples" ranks the exact match above a loose keyword hit)
  results.sort((a, b) => {
    const aExact = a.name.toLowerCase().includes(cleanQuery) ? 1 : 0;
    const bExact = b.name.toLowerCase().includes(cleanQuery) ? 1 : 0;
    return bExact - aExact;
  });

  if (maxPrice !== null && !isNaN(maxPrice)) {
    results = results.filter((product) => product.price <= maxPrice);
  }

  return results;
}