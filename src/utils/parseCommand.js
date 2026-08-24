// src/utils/parseCommand.js

const NUMBER_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

const LANG_PATTERNS = {
  'en-US': {
    add: /\b(add|need|buy|want)\b/i,
    remove: /\b(remove|delete|take off|get rid of)\b/i,
    search: /\b(find|search|look for)\b/i,
    clear: /\b(clear|empty)\b.*\blist\b/i,
    list: /\b(what's on|show|read)\b.*\blist\b/i,
    fillers: /\b(add|need|buy|want to buy|i want|i need|to my list|to the list|bottles? of|please)\b/gi,
    under: /under\s*\$?(\d+)/i,
  },
  'hi-IN': {
    add: /(जोड़ो|जोड़ें|डालो|चाहिए|खरीदना|खरीदो|खरीदना है)/,
    remove: /(हटाओ|निकालो|हटाएं|हटा दो)/,
    search: /(ढूंढो|खोजो|ढूंढें|खोज)/,
    clear: /(साफ|खाली).*सूची/,
    list: /(सूची दिखाओ|मेरी सूची|लिस्ट दिखाओ)/,
    fillers: /(जोड़ो|जोड़ें|डालो|चाहिए|खरीदना है|खरीदना|खरीदो|मेरी सूची में|कृपया|से)/g,
    under: /(\d+)\s*(रुपये|रुपए)?\s*से\s*कम/,
  },
  'es-ES': {
    add: /\b(añade|agrega|necesito|quiero|compra)\b/i,
    remove: /\b(quita|elimina|borra|saca)\b/i,
    search: /\b(busca|encuentra|buscar)\b/i,
    clear: /\b(vacía|limpia|borra)\b.*\blista\b/i,
    list: /\b(muestra|ver)\b.*\blista\b/i,
    fillers: /\b(añade|agrega|necesito|quiero|compra|a mi lista|de la lista|por favor)\b/gi,
    under: /menos de\s*\$?(\d+)/i,
  },
  'fr-FR': {
    add: /\b(ajoute|ajouter|besoin|veux|achète)\b/i,
    remove: /\b(enlève|supprime|retire|enlever)\b/i,
    search: /\b(cherche|trouve|chercher)\b/i,
    clear: /\b(vide|efface)\b.*\bliste\b/i,
    list: /\b(montre|affiche)\b.*\bliste\b/i,
    fillers: /\b(ajoute|ajouter|besoin|veux|achète|à ma liste|de la liste|s'il te plaît)\b/gi,
    under: /moins de\s*\$?(\d+)/i,
  },
};

function extractQuantity(text) {
  const digitMatch = text.match(/\b(\d+)\b/);
  if (digitMatch) return parseInt(digitMatch[1], 10);

  for (const [word, num] of Object.entries(NUMBER_WORDS)) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(text)) return num;
  }
  return 1;
}

function cleanItemName(text, patterns) {
  return text
    .replace(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/gi, '')
    .replace(patterns.fillers, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// 1. Exported the fallback function so it can be tested with Vitest
export function fallbackParseCommand(rawText, langCode = 'en-US') {
  console.log("Using Regex Fallback Parser");
  const patterns = LANG_PATTERNS[langCode] || LANG_PATTERNS['en-US'];
  const text = rawText.toLowerCase().trim();

  if (patterns.search.test(text)) {
    const priceMatch = text.match(patterns.under);
    const query = text.replace(patterns.search, '').replace(patterns.under, '').trim();
    return { intent: 'SEARCH_ITEM', query, maxPrice: priceMatch ? parseInt(priceMatch[1], 10) : null, raw: rawText };
  }
  if (patterns.remove.test(text)) {
    const itemName = cleanItemName(text.replace(patterns.remove, ''), patterns);
    return { intent: 'REMOVE_ITEM', item: itemName, raw: rawText };
  }
  if (patterns.clear.test(text)) { return { intent: 'CLEAR_LIST', raw: rawText }; }
  if (patterns.list.test(text)) { return { intent: 'LIST_ITEMS', raw: rawText }; }
  
  if (patterns.add.test(text)) {
    const quantity = extractQuantity(text);
    const itemName = cleanItemName(text, patterns);
    if (itemName) return { intent: 'ADD_ITEM', item: itemName, quantity, raw: rawText };
  }
  return { intent: 'UNKNOWN', raw: rawText };
}

// 2. Export the new Async function that hits your Python Backend
export async function parseCommand(rawText, langCode = 'en-US') {
  // If the language isn't English, bypass spaCy (which we configure for EN) and use the local fallback immediately
  if (langCode !== 'en-US') {
    return fallbackParseCommand(rawText, langCode);
  }

  try {
    const response = await fetch('/api/intent_parser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: rawText })
    });

    if (!response.ok) throw new Error('Backend NLP failed');
    
    const data = await response.json();
    return { ...data, raw: rawText }; // Ensure `raw` text is always passed back
    
  } catch (error) {
    console.error("Advanced NLP failed, falling back to Regex:", error);
    return fallbackParseCommand(rawText, langCode);
  }
}