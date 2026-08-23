import { useState, useEffect } from 'react'
import './App.css'

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
  
  const searchMatch = lower.match(/search for (.+)|search (.+)|find (.+)/i)
  if (searchMatch) {
    const query = searchMatch[1] || searchMatch[2] || searchMatch[3] || ''
    return { intent: 'SEARCH_ITEM', query: query.trim(), raw: text }
  }

  const addMatch = lower.match(/add (\d+ )?(.+)|buy (\d+ )?(.+)|get (\d+ )?(.+)/i)
  if (addMatch) {
    const quantity = parseInt(addMatch[1] || addMatch[3] || addMatch[5] || '1')
    const item = addMatch[2] || addMatch[4] || addMatch[6] || ''
    return { intent: 'ADD_ITEM', item: item.trim(), quantity, raw: text }
  }

  const removeMatch = lower.match(/remove (.+)|delete (.+)|take off (.+)|forget (.+)/i)
  if (removeMatch) {
    return { intent: 'REMOVE_ITEM', item: (removeMatch[1] || removeMatch[2] || removeMatch[3] || removeMatch[4] || '').trim(), raw: text }
  }

  if (lower.includes('clear') || lower.includes('empty') || lower.includes('reset')) {
    return { intent: 'CLEAR_LIST', raw: text }
  }

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
  const { transcript, listening, error, startListening } = useSpeechRecognition()
  const { items, groupedByCategory, lastAction, applyCommand } = useShoppingList()
  const [searchResults, setSearchResults] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!transcript) return
    
    const parsed = parseCommand(transcript)
    
    if (parsed.intent === 'SEARCH_ITEM') {
      const results = searchProducts(parsed.query)
      setSearchResults(results)
      setSearchQuery(parsed.query)
    } else {
      setSearchResults(null)
      applyCommand(parsed)
    }
  }, [transcript, applyCommand])

  const handleAddFromSearch = (product) => {
    applyCommand({ 
      intent: 'ADD_ITEM', 
      item: product.name, 
      quantity: 1, 
      raw: `from search: ${product.name}` 
    })
    setSearchResults(null)
  }

  const handleQuickAdd = (name) => {
    applyCommand({ 
      intent: 'ADD_ITEM', 
      item: name, 
      quantity: 1, 
      raw: `quick-add: ${name}` 
    })
  }

  const currentItemNames = items.map((i) => i.name)
  const seasonalSuggestions = getSeasonalSuggestions(currentItemNames)
  const runningLowSuggestions = getRunningLowSuggestions(currentItemNames)
  const substitutesForLastAdd = 
    lastAction?.type === 'added' ? getSubstitutes(lastAction.name) : []

  return (
    <div className="app-container">
      <div className="voice-assistant">
        <h1 className="title">🛒 Voice Shopping Assistant</h1>

        <button
          onClick={startListening}
          disabled={listening}
          className={`mic-button ${listening ? 'listening' : ''}`}
        >
          {listening ? '🎤 Listening...' : '🎤 Tap to speak'}
        </button>

        {error && <p className="error">{error}</p>}

        <div className="transcript">
          <span className="label">Heard:</span> "{transcript || 'Nothing yet'}"
        </div>

        {searchResults !== null && (
          <div className="search-results">
            <h3>Search results for "{searchQuery}"</h3>
            {searchResults.length === 0 ? (
              <p className="no-results">No products matched that search.</p>
            ) : (
              <ul>
                {searchResults.map((product) => (
                  <li key={product.id}>
                    <div>
                      <p className="product-name">{product.name}</p>
                      <p className="product-details">{product.brand} · {product.category}</p>
                    </div>
                    <div>
                      <span className="price">${product.price.toFixed(2)}</span>
                      <button onClick={() => handleAddFromSearch(product)}>
                        Add
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <button className="clear-search" onClick={() => setSearchResults(null)}>
              Clear search
            </button>
          </div>
        )}

        {lastAction && (
          <div className={`confirmation ${lastAction.type}`}>
            {lastAction.type === 'added' && `Added ${lastAction.quantity} ${lastAction.name} ✓`}
            {lastAction.type === 'updated' && `${lastAction.name} quantity updated to ${lastAction.quantity} ✓`}
            {lastAction.type === 'removed' && `Removed ${lastAction.name} ✓`}
            {lastAction.type === 'not_found' && `"${lastAction.name}" wasn't on your list`}
            {lastAction.type === 'cleared' && `List cleared ✓`}
            {lastAction.type === 'shown' && `Showing your cart ✓`}
            {lastAction.type === 'unknown' && `Sorry, I didn't understand that`}
          </div>
        )}

        {substitutesForLastAdd.length > 0 && (
          <div className="suggestions substitutes">
            <span>Prefer an alternative to {lastAction.name}?</span>
            <div>
              {substitutesForLastAdd.map((sub) => (
                <button key={sub} onClick={() => handleQuickAdd(sub)}>
                  + {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {runningLowSuggestions.length > 0 && (
          <div className="suggestions">
            <h3>You usually buy</h3>
            <div>
              {runningLowSuggestions.map((item) => (
                <button key={item} onClick={() => handleQuickAdd(item)}>
                  + {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {seasonalSuggestions.length > 0 && (
          <div className="suggestions seasonal">
            <h3>In season / on sale</h3>
            <div>
              {seasonalSuggestions.map((s) => (
                <button key={s.name} onClick={() => handleQuickAdd(s.name)}>
                  + {s.name} <span>({s.note})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="shopping-list">
          <h2>Your List</h2>
          {Object.keys(groupedByCategory).length === 0 && (
            <p className="empty-list">Your list is empty. Try saying "Add milk".</p>
          )}
          {Object.entries(groupedByCategory).map(([category, catItems]) => (
            <div key={category}>
              <h3>{category}</h3>
              <ul>
                {catItems.map((item) => (
                  <li key={item.id}>
                    <span>{item.name}</span>
                    <span>x{item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App