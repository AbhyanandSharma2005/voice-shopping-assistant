import { useState, useEffect } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useShoppingList } from './hooks/useShoppingList';
import { parseCommand } from './utils/parseCommand';
import { getSubstitutes, getSeasonalSuggestions, getRunningLowSuggestions } from './utils/suggestions';
import { searchProducts } from './utils/searchProducts';

const LANGUAGES = [
  { code: 'en-US', label: 'English' },
  { code: 'hi-IN', label: 'हिंदी (Hindi)' },
  { code: 'es-ES', label: 'Español (Spanish)' },
  { code: 'fr-FR', label: 'Français (French)' },
];

function App() {
  const [selectedLang, setSelectedLang] = useState('en-US');
  const { transcript, listening, error, startListening } = useSpeechRecognition(selectedLang);
  const { items, groupedByCategory, lastAction, applyCommand } = useShoppingList();
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Parse each new transcript into a command and act on it
  useEffect(() => {
    if (!transcript) return;
    const parsed = parseCommand(transcript, selectedLang);

    if (parsed.intent === 'SEARCH_ITEM') {
      setSearching(true);
      setSearchQuery(parsed.query);
      setSearchResults(null);
      const timer = setTimeout(() => {
        const results = searchProducts(parsed.query, parsed.maxPrice);
        setSearchResults(results);
        setSearching(false);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setSearchResults(null);
      setSearching(false);
      applyCommand(parsed);
    }
  }, [transcript, applyCommand, selectedLang]);

  // Auto-dismiss the confirmation toast after 4 seconds
  useEffect(() => {
    if (!lastAction) return;
    setShowToast(true);
    const timer = setTimeout(() => setShowToast(false), 4000);
    return () => clearTimeout(timer);
  }, [lastAction]);

  const currentItemNames = items.map((i) => i.name);
  const seasonalSuggestions = getSeasonalSuggestions(currentItemNames);
  const runningLowSuggestions = getRunningLowSuggestions(currentItemNames);
  const substitutesForLastAdd =
    lastAction?.type === 'added' ? getSubstitutes(lastAction.name) : [];

  const handleQuickAdd = (name) => {
    applyCommand({ intent: 'ADD_ITEM', item: name, quantity: 1, raw: `quick-add: ${name}` });
  };

  const handleAddFromSearch = (product) => {
    applyCommand({ intent: 'ADD_ITEM', item: product.name, quantity: 1, raw: `from search: ${product.name}` });
    setSearchResults(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto mt-6 sm:mt-8">
      <h1 className="text-2xl font-bold mb-4">🛒 Voice Shopping Assistant</h1>

      <div className="mb-3">
        <label className="text-xs text-gray-500 mr-2">Language:</label>
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          disabled={listening}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={startListening}
          disabled={listening}
          className={`px-6 py-3 rounded-full text-white font-semibold transition-all ${
            listening
              ? 'bg-red-500 animate-pulse cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          }`}
        >
          {listening ? '🎤 Listening...' : '🎤 Tap to speak'}
        </button>
        {listening && (
          <span className="flex gap-1">
            <span className="w-1.5 h-4 bg-red-400 rounded animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-4 bg-red-400 rounded animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-4 bg-red-400 rounded animate-bounce"></span>
          </span>
        )}
      </div>

      {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}

      <div className="mt-4">
        <p className="text-gray-600">
          <span className="font-medium">Heard:</span> "{transcript || 'Nothing yet'}"
        </p>
      </div>

      {searching && (
        <div className="mt-4 text-sm text-gray-400">Searching...</div>
      )}

      {!searching && searchResults !== null && (
        <div className="mt-4 border border-gray-200 rounded p-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Search results for "{searchQuery}"
          </h3>
          {searchResults.length === 0 ? (
            <p className="text-gray-400 text-sm">No products matched that search.</p>
          ) : (
            <ul className="space-y-2">
              {searchResults.map((product) => (
                <li
                  key={product.id}
                  className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded"
                >
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.brand} · {product.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">${product.price.toFixed(2)}</span>
                    <button
                      onClick={() => handleAddFromSearch(product)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => setSearchResults(null)}
            className="mt-2 text-xs text-gray-400 hover:text-gray-600"
          >
            Clear search
          </button>
        </div>
      )}

      {lastAction && showToast && (
        <div className="mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded text-sm text-green-800 transition-opacity">
          {lastAction.type === 'added' && `Added ${lastAction.quantity} ${lastAction.name} ✓`}
          {lastAction.type === 'updated' && `${lastAction.name} quantity updated to ${lastAction.quantity} ✓`}
          {lastAction.type === 'removed' && `Removed ${lastAction.name} ✓`}
          {lastAction.type === 'not_found' && `"${lastAction.name}" wasn't on your list`}
          {lastAction.type === 'cleared' && `List cleared ✓`}
          {lastAction.type === 'listed' && `Here's your current list ✓`}
          {lastAction.type === 'unknown' && `Sorry, I didn't understand that`}
        </div>
      )}

      {substitutesForLastAdd.length > 0 && (
        <div className="mt-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded text-sm">
          <span className="text-blue-800">Prefer an alternative to {lastAction.name}?</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {substitutesForLastAdd.map((sub) => (
              <button
                key={sub}
                onClick={() => handleQuickAdd(sub)}
                className="px-3 py-1 bg-white border border-blue-300 rounded-full text-blue-700 text-xs hover:bg-blue-100"
              >
                + {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {runningLowSuggestions.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">You usually buy</h3>
          <div className="flex flex-wrap gap-2">
            {runningLowSuggestions.map((item) => (
              <button
                key={item}
                onClick={() => handleQuickAdd(item)}
                className="px-3 py-1 bg-white border border-gray-300 rounded-full text-gray-700 text-xs hover:bg-gray-100"
              >
                + {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {seasonalSuggestions.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">In season / on sale</h3>
          <div className="flex flex-wrap gap-2">
            {seasonalSuggestions.map((s) => (
              <button
                key={s.name}
                onClick={() => handleQuickAdd(s.name)}
                className="px-3 py-1 bg-white border border-green-300 rounded-full text-green-700 text-xs hover:bg-green-100"
              >
                + {s.name} <span className="text-green-500">({s.note})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Your List</h2>
        {Object.keys(groupedByCategory).length === 0 && (
          <p className="text-gray-400 text-sm">Your list is empty. Try saying "Add milk".</p>
        )}
        {Object.entries(groupedByCategory).map(([category, catItems]) => (
          <div key={category} className="mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">{category}</h3>
            <ul className="space-y-1">
              {catItems.map((item) => (
                <li key={item.id} className="flex justify-between bg-gray-50 px-3 py-2 rounded">
                  <span>{item.name}</span>
                  <span className="text-gray-500">x{item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
