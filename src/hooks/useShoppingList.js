// src/hooks/useShoppingList.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { categorize } from '../utils/categories';
import { getRecommendations } from '../utils/suggestions'; // Added ML recommender import

function makeId() {
  return `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useShoppingList() {
  const [items, setItems] = useState([]);
  const [lastAction, setLastAction] = useState(null);
  
  // New state to hold dynamic suggestions from your Python backend
  const [suggestions, setSuggestions] = useState([]); 
  
  // Ref to track the last added item without triggering unnecessary re-renders
  const lastAddedItemRef = useRef(null);

  const addItem = useCallback((name, quantity = 1) => {
    lastAddedItemRef.current = name; // Update ref to fetch substitutes for this item

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
    lastAddedItemRef.current = null;
    setLastAction({ type: 'cleared' });
  }, []);

  // Central dispatcher: takes a parsed command object and applies it
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
        // Search doesn't mutate the list
        setLastAction({ type: 'search', query: parsed.query, maxPrice: parsed.maxPrice });
        break;
      default:
        setLastAction({ type: 'unknown', raw: parsed.raw });
    }
  }, [addItem, removeItem, clearList]);

  // Reactive Effect: Fetch ML recommendations whenever the cart changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchSuggestions = async () => {
      const currentItemNames = items.map((i) => i.name);
      
      // Call our new async fallback-enabled recommender
      const newSuggestions = await getRecommendations(
        currentItemNames, 
        lastAddedItemRef.current
      );
      
      if (isMounted) {
        setSuggestions(newSuggestions);
        // Clear the ref after fetching so we don't suggest substitutes for this item forever
        lastAddedItemRef.current = null; 
      }
    };

    fetchSuggestions();
    
    // Cleanup function to prevent race conditions on unmount
    return () => { isMounted = false; };
  }, [items]);

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
    suggestions, // Exporting suggestions to be mapped directly in UI
    lastAction,
    addItem,
    removeItem,
    clearList,
    applyCommand,
  };
}