import { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useShoppingList } from './hooks/useShoppingList';
import { parseCommand } from './utils/parseCommand';
import { searchProducts } from './utils/searchProducts';

const LANGUAGES = [
  { code: 'en-US', label: 'English' },
  { code: 'hi-IN', label: 'हिंदी (Hindi)' },
  { code: 'es-ES', label: 'Español (Spanish)' },
  { code: 'fr-FR', label: 'Français (French)' },
];

function App() {
  const [selectedLang, setSelectedLang] = useState('en-US');
  const { 
    transcript, 
    listening, 
    error, 
    startListening, 
    stopListening, 
    toggleListening: hookToggleListening 
  } = useSpeechRecognition(selectedLang);
  
  // We now destructure `suggestions` directly from our updated hook
  const { items, groupedByCategory, suggestions, lastAction, applyCommand } = useShoppingList();
  
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  // Screen reader announcements state & helper
  const [screenReaderMessage, setScreenReaderMessage] = useState('');

  const announce = (message) => {
    setScreenReaderMessage(message);
    setTimeout(() => setScreenReaderMessage(''), 3000);
  };

  const isListening = listening;

  const toggleListening = useCallback(() => {
    if (hookToggleListening) {
      hookToggleListening();
    } else if (isListening) {
      stopListening?.();
    } else {
      startListening?.();
    }
  }, [hookToggleListening, isListening, startListening, stopListening]);

  // Global Keyboard Accessibility (Space / Alt+M to toggle, Escape to cancel)
  useEffect(() => {
    const handleKeyDown = (event) => {
      const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      
      if ((event.code === 'Space' && !isInputActive) || (event.altKey && event.key.toLowerCase() === 'm')) {
        event.preventDefault();
        toggleListening();
      }
      
      if (event.key === 'Escape' && isListening) {
        toggleListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening, toggleListening]);

  // Async Parser: Awaits the Python NLP endpoint and dispatches the command
  useEffect(() => {
    if (!transcript) return;

    const processTranscript = async () => {
      // Use the new async parseCommand
      const parsed = await parseCommand(transcript, selectedLang);

      if (parsed.intent === 'SEARCH_ITEM') {
        setSearching(true);
        setSearchQuery(parsed.query);
        setSearchResults(null);
        
        // Simulating search delay
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
    };

    processTranscript();
  }, [transcript, applyCommand, selectedLang]);

  // React Hot Toast & Screen Reader Announcements Integration
  useEffect(() => {
    if (!lastAction) return;

    let message = '';
    if (lastAction.type === 'added') {
      message = `Added ${lastAction.quantity} ${lastAction.name}${lastAction.category ? ` to ${lastAction.category}` : ''}`;
      toast.success(message);
    } else if (lastAction.type === 'updated') {
      message = `${lastAction.name} quantity updated to ${lastAction.quantity}`;
      toast.success(message);
    } else if (lastAction.type === 'removed') {
      message = `Removed ${lastAction.name} from your list`;
      toast.success(message);
    } else if (lastAction.type === 'not_found') {
      message = `"${lastAction.name}" wasn't on your list`;
      toast.error(message);
    } else if (lastAction.type === 'cleared') {
      message = 'List cleared';
      toast.success(message);
    } else if (lastAction.type === 'listed') {
      message = "Here's your current list";
      toast.success(message);
    } else if (lastAction.type === 'unknown') {
      message = "Sorry, I didn't understand that";
      toast.error(message);
    }

    if (message) {
      announce(message);
    }
  }, [lastAction]);

  const handleQuickAdd = (name) => {
    applyCommand({ intent: 'ADD_ITEM', item: name, quantity: 1, raw: `quick-add: ${name}` });
  };

  const handleAddFromSearch = (product) => {
    applyCommand({ intent: 'ADD_ITEM', item: product.name, quantity: 1, raw: `from search: ${product.name}` });
    setSearchResults(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto mt-6 sm:mt-8 pb-32">
      {/* Toast Notification Container */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Screen reader live region for announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {screenReaderMessage}
      </div>

      <h1 className="text-2xl font-bold mb-4 text-zinc-800">🛒 Voice Shopping Assistant</h1>

      <div className="mb-6">
        <label className="text-xs font-semibold text-zinc-500 mr-2 uppercase tracking-wide">Language:</label>
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          disabled={listening}
          className="text-sm border border-zinc-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 bg-white"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-600 mb-4 text-sm font-medium p-3 bg-red-50 rounded-lg">{error}</p>}

      {/* Dynamic ML Suggestions Block */}
      {suggestions && suggestions.length > 0 && (
        <div 
          className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 mb-6 shadow-sm transition-all"
          role="region" 
          aria-label="Smart Recommendations"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900">
            <span>💡 Suggested for you</span>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested Items">
            {suggestions.map((suggestion, idx) => (
              <button
                key={`${suggestion.name}-${idx}`}
                type="button"
                onClick={() => handleQuickAdd(suggestion.name)}
                aria-label={`Add suggested item: ${suggestion.name}`}
                className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1 bg-white text-xs font-medium text-zinc-700 rounded-full border border-amber-200 hover:border-amber-400 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              >
                <span className="text-amber-600 font-bold">+</span>
                <span>{suggestion.name}</span>
                {suggestion.note && (
                  <span className="text-[10px] text-zinc-400 uppercase font-mono">({suggestion.note})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searching && (
        <div className="mt-4 text-sm text-zinc-400 font-medium animate-pulse">Searching catalog...</div>
      )}

      {!searching && searchResults !== null && (
        <div className="mb-6 border border-zinc-200 rounded-xl p-4 shadow-sm bg-white">
          <h3 className="text-sm font-semibold text-zinc-700 mb-3">
            Search results for "{searchQuery}"
          </h3>
          {searchResults.length === 0 ? (
            <p className="text-zinc-400 text-sm">No products matched that search.</p>
          ) : (
            <ul className="space-y-2">
              {searchResults.map((product) => (
                <li
                  key={product.id}
                  className="flex justify-between items-center bg-zinc-50 px-3 py-2.5 rounded-lg border border-zinc-100"
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">{product.name}</p>
                    <p className="text-xs text-zinc-500">{product.brand} · {product.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-zinc-700">${product.price.toFixed(2)}</span>
                    <button
                      onClick={() => handleAddFromSearch(product)}
                      className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 transition-all min-h-[44px]"
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
            className="mt-3 text-xs font-medium text-zinc-400 hover:text-zinc-600 underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Shopping List Layout */}
      <div className="mt-2">
        <h2 className="text-lg font-bold mb-3 text-zinc-800">Your List</h2>
        
        {Object.keys(groupedByCategory).length === 0 && (
          <div className="text-center py-10 px-4 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
            <p className="text-zinc-500 text-sm font-medium mb-1">Your list is empty.</p>
            <p className="text-zinc-400 text-xs">Try saying "Add 2 bottles of milk" or "Find toothpaste under $5".</p>
          </div>
        )}
        
        {Object.entries(groupedByCategory).map(([category, catItems]) => (
          <section key={category} className="mb-5" aria-labelledby={`cat-${category}`}>
            <h3 id={`cat-${category}`} className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 border-b border-zinc-200 pb-1">
              {category}
            </h3>
            <ul className="space-y-1.5">
              {catItems.map((item) => (
                <li key={item.id} className="flex justify-between items-center bg-zinc-50 px-3 py-2.5 rounded-lg border border-zinc-100">
                  <span className="font-medium text-zinc-800 text-sm">{item.name}</span>
                  <span className="text-xs font-mono font-semibold bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full">
                    x{item.quantity}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Floating Mobile Voice Controller */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50 w-full max-w-sm px-4">
        {transcript && (
          <div 
            className="bg-zinc-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg backdrop-blur-md animate-fade-in border border-zinc-700 max-w-xs truncate"
          >
            <span className="text-zinc-400 font-medium mr-1">Heard:</span> "{transcript}"
          </div>
        )}

        <div className="relative flex items-center justify-center">
          {listening && (
            <>
              <span className="absolute h-16 w-16 rounded-full bg-blue-500/30 animate-ping" />
              <span className="absolute h-20 w-20 rounded-full bg-blue-500/15 animate-pulse" />
            </>
          )}

          <button
            type="button"
            onClick={toggleListening}
            aria-label={listening ? "Stop voice recognition" : "Start voice recognition"}
            className={`relative z-10 flex items-center justify-center min-w-[64px] min-h-[64px] rounded-full shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
              listening
                ? "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 scale-110"
                : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400 hover:scale-105"
            }`}
          >
            {listening ? (
              <svg className="w-8 h-8 fill-current animate-pulse" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </button>
        </div>

        <span className="text-[10px] tracking-widest font-bold text-zinc-500 uppercase mt-1">
          {listening ? "Listening..." : "Tap mic or press Space"}
        </span>
      </div>
    </div>
  );
}

export default App;