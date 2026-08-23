// Item shape:
// { id: string, name: string, quantity: number, category: string, addedVia: 'voice' | 'manual' }

// Supported intents:
// ADD_ITEM      - "add milk", "I need apples", "add 2 bottles of water"
// REMOVE_ITEM   - "remove milk", "remove milk from my list"
// SET_QUANTITY  - "add 5 oranges" (quantity folded into ADD_ITEM)
// SEARCH_ITEM   - "find organic apples", "find toothpaste under $5"
// LIST_ITEMS    - "what's on my list"
// CLEAR_LIST    - "clear my list"
// UNKNOWN       - fallback