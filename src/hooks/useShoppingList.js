// src/hooks/useShoppingList.js
import { useState, useCallback } from 'react';
import { categorize } from '../utils/categories';

function makeId() {
  return `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useShoppingList() {
  const [items, setItems] = useState([]);
  const [lastAction, setLastAction] = useState(null); // for user-facing confirmations

  const addItem = useCallback((name, quantity = 1) => {
    setItems((prev) => {
      // If item already exists (case-insensitive match), bump quantity instead of duplicating
      const existingIndex = prev.findIndex(
        (i) => i.name.toLowerCase() === name.toLowerCase()
      );
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        setLastAction({ type: 'updated', name, quantity: updated[existingIndex].quantity });
        return updated;
      }

      const newItem = {
        id: makeId(),
        name,
        quantity,
        category: categorize(name),
        addedVia: 'voice',
      };
      setLastAction({ type: 'added', name, quantity });
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((name) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.name.toLowerCase() === name.toLowerCase());
      if (!exists) {
        setLastAction({ type: 'not_found', name });
        return prev;
      }
      setLastAction({ type: 'removed', name });
      return prev.filter((i) => i.name.toLowerCase() !== name.toLowerCase());
    });
  }, []);

  const clearList = useCallback(() => {
    setItems([]);
    setLastAction({ type: 'cleared' });
  }, []);

  // Central dispatcher: takes a parsed command object from parseCommand() and applies it
  const applyCommand = useCallback((parsed) => {
    switch (parsed.intent) {
      case 'ADD_ITEM':
        if (parsed.item) addItem(parsed.item, parsed.quantity);
        break;
      case 'REMOVE_ITEM':
        if (parsed.item) removeItem(parsed.item);
        break;
      case 'CLEAR_LIST':
        clearList();
        break;
      case 'LIST_ITEMS':
        setLastAction({ type: 'listed' });
        break;
      case 'SEARCH_ITEM':
        // Search doesn't mutate the list — handled separately in the search feature (Hour 5.5-7)
        setLastAction({ type: 'search', query: parsed.query, maxPrice: parsed.maxPrice });
        break;
      default:
        setLastAction({ type: 'unknown', raw: parsed.raw });
    }
  }, [addItem, removeItem, clearList]);

  // Group items by category for rendering
  const groupedByCategory = items.reduce((groups, item) => {
    const cat = item.category;
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
    return groups;
  }, {});

  return {
    items,
    groupedByCategory,
    lastAction,
    addItem,
    removeItem,
    clearList,
    applyCommand,
  };
}