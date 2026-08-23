// src/utils/parseCommand.js

const NUMBER_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

function extractQuantity(text) {
  const digitMatch = text.match(/\b(\d+)\b/);
  if (digitMatch) return parseInt(digitMatch[1], 10);

  for (const [word, num] of Object.entries(NUMBER_WORDS)) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(text)) return num;
  }
  return 1; // default quantity
}

function cleanItemName(text) {
  return text
    .replace(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/gi, '')
    .replace(/\b(add|need|buy|want to buy|i want|i need|to my list|to the list|bottles? of|please)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseCommand(rawText) {
  const text = rawText.toLowerCase().trim();

  // SEARCH_ITEM: "find X", "search for X", with optional price filter
  if (/\b(find|search|look for)\b/.test(text)) {
    const priceMatch = text.match(/under\s*\$?(\d+)/);
    const query = text
      .replace(/\b(find|search for|search|look for)\b/g, '')
      .replace(/under\s*\$?\d+/, '')
      .trim();
    return {
      intent: 'SEARCH_ITEM',
      query,
      maxPrice: priceMatch ? parseInt(priceMatch[1], 10) : null,
      raw: rawText,
    };
  }

  // REMOVE_ITEM: "remove X", "delete X", "take X off"
  if (/\b(remove|delete|take off|get rid of)\b/.test(text)) {
    const itemName = cleanItemName(text.replace(/\b(remove|delete|take off|get rid of)\b/g, ''));
    return { intent: 'REMOVE_ITEM', item: itemName, raw: rawText };
  }

  // CLEAR_LIST
  if (/\b(clear|empty)\b.*\blist\b/.test(text)) {
    return { intent: 'CLEAR_LIST', raw: rawText };
  }

  // LIST_ITEMS: "what's on my list", "show my list"
  if (/\b(what's on|show|read)\b.*\blist\b/.test(text)) {
    return { intent: 'LIST_ITEMS', raw: rawText };
  }

  // ADD_ITEM: "add X", "I need X", "I want to buy X" — the default/fallback for anything
  // mentioning an item-like phrase
  if (/\b(add|need|buy|want)\b/.test(text)) {
    const quantity = extractQuantity(text);
    const itemName = cleanItemName(text);
    if (itemName) {
      return { intent: 'ADD_ITEM', item: itemName, quantity, raw: rawText };
    }
  }

  return { intent: 'UNKNOWN', raw: rawText };
}