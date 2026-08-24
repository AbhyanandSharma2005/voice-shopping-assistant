import { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useShoppingList } from './hooks/useShoppingList';
import { parseCommand } from './utils/parseCommand';
import { searchProducts } from './utils/searchProducts';
import { 
  Mic, 
  Square, 
  ShoppingCart, 
  Sparkles, 
  Search, 
  Plus, 
  Globe, 
  ChevronRight, 
  PackageOpen
} from 'lucide-react';

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
  
  const { items, groupedByCategory, suggestions, lastAction, applyCommand } = useShoppingList();
  
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
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

  useEffect(() => {
    if (!transcript) return;
    const processTranscript = async () => {
      const parsed = await parseCommand(transcript, selectedLang);
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
    };
    processTranscript();
  }, [transcript, applyCommand, selectedLang]);

  useEffect(() => {
    if (!lastAction) return;
    let message = '';
    
    const toastConfig = {
      style: {
        borderRadius: '16px',
        background: '#333',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '500',
        padding: '12px 20px',
      }
    };

    if (lastAction.type === 'added') {
      message = `Added ${lastAction.quantity} ${lastAction.name}${lastAction.category ? ` to ${lastAction.category}` : ''}`;
      toast.success(message, toastConfig);
    } else if (lastAction.type === 'updated') {
      message = `${lastAction.name} quantity updated to ${lastAction.quantity}`;
      toast.success(message, toastConfig);
    } else if (lastAction.type === 'removed') {
      message = `Removed ${lastAction.name} from your list`;
      toast.success(message, toastConfig);
    } else if (lastAction.type === 'not_found') {
      message = `"${lastAction.name}" wasn't on your list`;
      toast.error(message, toastConfig);
    } else if (lastAction.type === 'cleared') {
      message = 'List cleared';
      toast.success(message, toastConfig);
    } else if (lastAction.type === 'listed') {
      message = "Here's your current list";
      toast.success(message, toastConfig);
    } else if (lastAction.type === 'unknown') {
      message = "Sorry, I didn't catch that. Please try again.";
      toast.error(message, toastConfig);
    }

    if (message) announce(message);
  }, [lastAction]);

  const handleQuickAdd = (name) => {
    applyCommand({ intent: 'ADD_ITEM', item: name, quantity: 1, raw: `quick-add: ${name}` });
  };

  const handleAddFromSearch = (product) => {
    applyCommand({ intent: 'ADD_ITEM', item: product.name, quantity: 1, raw: `from search: ${product.name}` });
    setSearchResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-100 to-emerald-50/40 font-sans pb-36">
      <Toaster position="top-center" reverseOrder={false} />
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {screenReaderMessage}
      </div>

      <div className="max-w-md mx-auto px-5 pt-8">
        {/* Premium Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/30 text-white">
              <ShoppingCart size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">Voice Shopping Assistant</h1>
              <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">Smart Assistant</p>
            </div>
          </div>
          
          {/* Styled Language Selector */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <Globe size={14} strokeWidth={2.5} />
            </div>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              disabled={listening}
              className="appearance-none bg-white border border-gray-200 text-gray-700 text-xs font-bold py-2 pl-8 pr-8 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
              <ChevronRight size={14} className="rotate-90" />
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-semibold">
            <div className="bg-red-100 p-1.5 rounded-full"><Sparkles size={16} /></div>
            {error}
          </div>
        )}

        {/* Dynamic ML Suggestions Block - Horizontal Scroll */}
        {suggestions && suggestions.length > 0 && (
          <div className="mb-8" role="region" aria-label="Smart Recommendations">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Sparkles size={18} className="text-amber-500" />
              <h2 className="text-sm font-bold text-gray-800">Suggested for you</h2>
            </div>
            <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 -mx-1 px-1">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={`${suggestion.name}-${idx}`}
                  type="button"
                  onClick={() => handleQuickAdd(suggestion.name)}
                  className="flex-shrink-0 group flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-2xl shadow-sm hover:border-emerald-300 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <div className="bg-emerald-50 text-emerald-600 p-1 rounded-full group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Plus size={14} strokeWidth={3} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-800 leading-none">{suggestion.name}</span>
                    {suggestion.note && (
                      <span className="text-[10px] font-medium text-gray-400 mt-1">{suggestion.note}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searching && (
          <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm animate-pulse mb-6 border border-gray-200/60">
            <Search className="text-gray-400 animate-spin" size={20} />
            <span className="text-sm font-semibold text-gray-500">Searching catalog...</span>
          </div>
        )}

        {!searching && searchResults !== null && (
          <div className="mb-8 bg-white/90 backdrop-blur-md border border-gray-200/60 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Search size={16} className="text-emerald-500" />
                Results for "{searchQuery}"
              </h3>
              <button
                onClick={() => setSearchResults(null)}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 bg-gray-100 px-3 py-1 rounded-full transition-colors"
              >
                Clear
              </button>
            </div>
            
            {searchResults.length === 0 ? (
              <div className="text-center py-6 text-gray-400 flex flex-col items-center">
                <PackageOpen size={32} className="mb-2 opacity-50" />
                <p className="text-sm font-medium">No products found.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {searchResults.map((product) => (
                  <li key={product.id} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{product.name}</p>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">{product.brand} · {product.category}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-emerald-600">${product.price.toFixed(2)}</span>
                      <button
                        onClick={() => handleAddFromSearch(product)}
                        className="bg-gray-900 text-white p-2 rounded-xl hover:bg-emerald-500 focus:ring-2 focus:ring-emerald-400 transition-all shadow-sm"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Shopping List Layout */}
        <div className="mt-4">
          <h2 className="text-xl font-extrabold mb-4 text-gray-900">Your Cart</h2>
          
          {Object.keys(groupedByCategory).length === 0 && (
            <div className="text-center py-16 px-4 bg-white/80 backdrop-blur-md rounded-3xl border border-dashed border-gray-300 shadow-sm">
              <ShoppingCart size={40} strokeWidth={1.5} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-900 font-bold mb-1">Your cart is empty</p>
              <p className="text-gray-400 text-xs font-medium">Tap the mic and say "Add 2 bottles of milk"</p>
            </div>
          )}
          
          {Object.entries(groupedByCategory).map(([category, catItems]) => (
            <section key={category} className="mb-6" aria-labelledby={`cat-${category}`}>
              <h3 id={`cat-${category}`} className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 pl-1">
                {category}
              </h3>
              <ul className="space-y-2">
                {catItems.map((item) => (
                  <li key={item.id} className="flex justify-between items-center bg-white/90 backdrop-blur-md px-4 py-3.5 rounded-2xl border border-gray-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                    <span className="font-bold text-gray-800 text-sm">{item.name}</span>
                    <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-lg">
                      x{item.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      {/* Premium Glassmorphic Floating Action Controller */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-100 via-slate-100/80 to-transparent z-50 pointer-events-none flex flex-col items-center justify-end h-40">
        
        {/* Live Transcript Bubble */}
        <div className={`transition-all duration-300 transform ${transcript ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} mb-4 pointer-events-auto`}>
          {transcript && (
            <div className="glass-panel text-gray-800 text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg max-w-[280px] truncate border border-white/60">
              <span className="text-emerald-500 font-bold mr-1.5">Hearing:</span>
              "{transcript}"
            </div>
          )}
        </div>

        {/* Mic Button Container */}
        <div className="relative flex items-center justify-center pointer-events-auto">
          {listening && (
            <>
              <span className="absolute h-20 w-20 rounded-full bg-emerald-400/30 animate-ping" />
              <span className="absolute h-24 w-24 rounded-full bg-emerald-400/20 animate-pulse" />
            </>
          )}

          <button
            type="button"
            onClick={toggleListening}
            aria-label={listening ? "Stop voice recognition" : "Start voice recognition"}
            className={`relative z-10 flex items-center justify-center min-w-[72px] min-h-[72px] rounded-full shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
              listening
                ? "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 scale-110 shadow-red-500/30"
                : "bg-gray-900 text-white hover:bg-emerald-500 focus:ring-emerald-400 hover:scale-105 hover:shadow-emerald-500/30"
            }`}
          >
            {listening ? (
              <Square className="w-8 h-8 fill-current animate-pulse" />
            ) : (
              <Mic className="w-8 h-8" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;