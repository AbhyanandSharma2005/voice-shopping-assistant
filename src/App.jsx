import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

// Import your utilities and hooks
// import { useSpeechRecognition } from './hooks/useSpeechRecognition'
// import { useShoppingList } from './hooks/useShoppingList'
// import { parseCommand } from './utils/parseCommand'
// import { searchProducts } from './utils/searchProducts'
// import { getSubstitutes, getSeasonalSuggestions, getRunningLowSuggestions } from './utils/suggestions'

// Mock implementations (replace with actual imports)
const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(null)

  const startListening = () => {
    setListening(true)
    setTimeout(() => {
      const demo = ['add milk', 'search for bananas', 'remove eggs', 'show cart']
      setTranscript(demo[Math.floor(Math.random() * demo.length)])
      setListening(false)
    }, 2000)
  }

  return { transcript, listening, error, startListening }
}

const useShoppingList = () => {
  const [items, setItems] = useState([
    { id: 1, name: 'Milk', quantity: 2, category: 'Dairy' },
    { id: 2, name: 'Eggs', quantity: 1, category: 'Dairy' },
    { id: 3, name: 'Bread', quantity: 1, category: 'Bakery' },
  ])
  const [lastAction, setLastAction] = useState(null)

  const groupedByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const applyCommand = (parsed) => {
    if (parsed.intent === 'ADD_ITEM') {
      const existing = items.find(i => i.name.toLowerCase() === parsed.item.toLowerCase())
      if (existing) {
        setItems(items.map(i => 
          i.id === existing.id ? { ...i, quantity: i.quantity + (parsed.quantity || 1) } : i
        ))
        setLastAction({ type: 'updated', name: parsed.item, quantity: existing.quantity + (parsed.quantity || 1) })
      } else {
        const newItem = { 
          id: Date.now(), 
          name: parsed.item, 
          quantity: parsed.quantity || 1, 
          category: 'Other' 
        }
        setItems([...items, newItem])
        setLastAction({ type: 'added', name: parsed.item, quantity: parsed.quantity || 1 })
      }
    } else if (parsed.intent === 'REMOVE_ITEM') {
      const existing = items.find(i => i.name.toLowerCase() === parsed.item.toLowerCase())
      if (existing) {
        if (existing.quantity > 1) {
          setItems(items.map(i => 
            i.id === existing.id ? { ...i, quantity: i.quantity - 1 } : i
          ))
          setLastAction({ type: 'updated', name: parsed.item, quantity: existing.quantity - 1 })
        } else {
          setItems(items.filter(i => i.id !== existing.id))
          setLastAction({ type: 'removed', name: parsed.item })
        }
      } else {
        setLastAction({ type: 'not_found', name: parsed.item })
      }
    } else if (parsed.intent === 'CLEAR_LIST') {
      setItems([])
      setLastAction({ type: 'cleared' })
    } else if (parsed.intent === 'SHOW_CART') {
      setLastAction({ type: 'shown', name: 'cart' })
    } else {
      setLastAction({ type: 'unknown' })
    }
  }

  return { items, groupedByCategory, lastAction, applyCommand }
}

const parseCommand = (text) => {
  const lower = text.toLowerCase().trim()
  
  // Search command
  const searchMatch = lower.match(/search for (.+)|search (.+)|find (.+)/i)
  if (searchMatch) {
    const query = searchMatch[1] || searchMatch[2] || searchMatch[3] || ''
    return { intent: 'SEARCH_ITEM', query: query.trim(), raw: text }
  }

  // Add command
  const addMatch = lower.match(/add (\d+ )?(.+)|buy (\d+ )?(.+)|get (\d+ )?(.+)/i)
  if (addMatch) {
    const quantity = parseInt(addMatch[1] || addMatch[3] || addMatch[5] || '1')
    const item = addMatch[2] || addMatch[4] || addMatch[6] || ''
    return { intent: 'ADD_ITEM', item: item.trim(), quantity, raw: text }
  }

  // Remove command
  const removeMatch = lower.match(/remove (.+)|delete (.+)|take off (.+)|forget (.+)/i)
  if (removeMatch) {
    return { intent: 'REMOVE_ITEM', item: (removeMatch[1] || removeMatch[2] || removeMatch[3] || removeMatch[4] || '').trim(), raw: text }
  }

  // Clear command
  if (lower.includes('clear') || lower.includes('empty') || lower.includes('reset')) {
    return { intent: 'CLEAR_LIST', raw: text }
  }

  // Show cart command
  if (lower.includes('show') || lower.includes('view') || lower.includes('what')) {
    return { intent: 'SHOW_CART', raw: text }
  }

  return { intent: 'UNKNOWN', raw: text }
}

const searchProducts = (query, maxPrice) => {
  const products = [
    { id: 1, name: 'Bananas', brand: 'Chiquita', category: 'Fruit', price: 0.69 },
    { id: 2, name: 'Apples', brand: 'Gala', category: 'Fruit', price: 1.29 },
    { id: 3, name: 'Milk', brand: 'Horizon', category: 'Dairy', price: 3.99 },
    { id: 4, name: 'Organic Milk', brand: 'Organic Valley', category: 'Dairy', price: 4.99 },
    { id: 5, name: 'Bread', brand: 'Wonder', category: 'Bakery', price: 2.49 },
    { id: 6, name: 'Whole Wheat Bread', brand: 'Nature\'s Own', category: 'Bakery', price: 3.29 },
    { id: 7, name: 'Eggs', brand: 'Eggland\'s Best', category: 'Dairy', price: 2.99 },
    { id: 8, name: 'Butter', brand: 'Land O\'Lakes', category: 'Dairy', price: 4.49 },
    { id: 9, name: 'Chicken Breast', brand: 'Tyson', category: 'Meat', price: 5.99 },
    { id: 10, name: 'Ground Beef', brand: 'Angus', category: 'Meat', price: 6.99 },
  ]

  let results = products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase()) ||
    p.brand.toLowerCase().includes(query.toLowerCase())
  )

  if (maxPrice) {
    results = results.filter(p => p.price <= maxPrice)
  }

  return results
}

const getSubstitutes = (itemName) => {
  const substitutes = {
    'milk': ['Almond Milk', 'Oat Milk', 'Soy Milk'],
    'butter': ['Margarine', 'Coconut Oil', 'Olive Oil'],
    'eggs': ['Egg Substitute', 'Applesauce', 'Flax Eggs'],
    'bread': ['Gluten-Free Bread', 'Tortillas', 'Lettuce Wraps'],
  }
  const key = Object.keys(substitutes).find(k => itemName.toLowerCase().includes(k))
  return key ? substitutes[key] : []
}

const getSeasonalSuggestions = (currentItems) => {
  const suggestions = [
    { name: 'Strawberries', note: 'in season' },
    { name: 'Asparagus', note: 'on sale' },
    { name: 'Avocados', note: 'in season' },
  ]
  return suggestions.filter(s => !currentItems.includes(s.name))
}

const getRunningLowSuggestions = (currentItems) => {
  const common = ['Milk', 'Bread', 'Eggs', 'Butter', 'Cheese']
  return common.filter(c => !currentItems.includes(c))
}

function App() {
  const [count, setCount] = useState(0)
  
  // Speech recognition
  const { transcript, listening, error, startListening } = useSpeechRecognition()
  
  // Shopping list
  const { items, groupedByCategory, lastAction, applyCommand } = useShoppingList()
  
  // Search state
  const [searchResults, setSearchResults] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Parse transcript when it changes
  useEffect(() => {
    if (!transcript) return
    
    const parsed = parseCommand(transcript)
    
    // Branch on intent - search vs command
    if (parsed.intent === 'SEARCH_ITEM') {
      const results = searchProducts(parsed.query)
      setSearchResults(results)
      setSearchQuery(parsed.query)
    } else {
      setSearchResults(null) // Clear search view for non-search commands
      applyCommand(parsed)
    }
  }, [transcript, applyCommand])

  // Handle quick add from search results
  const handleAddFromSearch = (product) => {
    applyCommand({ 
      intent: 'ADD_ITEM', 
      item: product.name, 
      quantity: 1, 
      raw: `from search: ${product.name}` 
    })
    setSearchResults(null) // Dismiss search results after adding
  }

  // Handle quick add from suggestions
  const handleQuickAdd = (name) => {
    applyCommand({ 
      intent: 'ADD_ITEM', 
      item: name, 
      quantity: 1, 
      raw: `quick-add: ${name}` 
    })
  }

  // Get current item names for suggestions
  const currentItemNames = items.map((i) => i.name)
  const seasonalSuggestions = getSeasonalSuggestions(currentItemNames)
  const runningLowSuggestions = getRunningLowSuggestions(currentItemNames)
  const substitutesForLastAdd = 
    lastAction?.type === 'added' ? getSubstitutes(lastAction.name) : []

  return (
    <>
      {/* Hero Section */}
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      {/* Voice Shopping Assistant */}
      <section id="voice-assistant" className="p-6 max-w-2xl mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-4">Voice Shopping Assistant</h1>

        {/* Mic Button */}
        <button
          onClick={startListening}
          disabled={listening}
          className={`px-6 py-3 rounded-full text-white font-semibold transition-all ${
            listening
              ? 'bg-red-500 animate-pulse cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {listening ? '🎤 Listening...' : '🎤 Tap to speak'}
        </button>

        {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}

        {/* Transcript Display */}
        <div className="mt-4">
          <p className="text-gray-600">
            <span className="font-medium">Heard:</span> "{transcript || 'Nothing yet'}"
          </p>
        </div>

        {/* Search Results */}
        {searchResults !== null && (
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

        {/* Last Action Confirmation */}
        {lastAction && (
          <div className="mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
            {lastAction.type === 'added' && `Added ${lastAction.quantity} ${lastAction.name} ✓`}
            {lastAction.type === 'updated' && `${lastAction.name} quantity updated to ${lastAction.quantity} ✓`}
            {lastAction.type === 'removed' && `Removed ${lastAction.name} ✓`}
            {lastAction.type === 'not_found' && `"${lastAction.name}" wasn't on your list`}
            {lastAction.type === 'cleared' && `List cleared ✓`}
            {lastAction.type === 'shown' && `Showing your cart ✓`}
            {lastAction.type === 'unknown' && `Sorry, I didn't understand that`}
          </div>
        )}

        {/* Substitutes */}
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

        {/* Running Low Suggestions */}
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

        {/* Seasonal Suggestions */}
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

        {/* Shopping List */}
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
      </section>

      <div className="ticks"></div>

      {/* Next Steps Section */}
      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App