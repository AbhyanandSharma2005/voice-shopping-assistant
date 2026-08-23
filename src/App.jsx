import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

// Import your actual hooks and utilities
// import { useSpeechRecognition } from './hooks/useSpeechRecognition'
// import { parseCommand } from './utils/parseCommand'

function App() {
  const [count, setCount] = useState(0)
  
  // Speech recognition state
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(null)
  const [log, setLog] = useState([])
  const [recognition, setRecognition] = useState(null)

  // Initialize speech recognition
  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser')
      return
    }

    const recognitionInstance = new SpeechRecognition()
    recognitionInstance.lang = 'en-US'
    recognitionInstance.continuous = false
    recognitionInstance.interimResults = false
    recognitionInstance.maxAlternatives = 1

    recognitionInstance.onresult = (event) => {
      const result = event.results[0][0]
      const transcriptText = result.transcript
      const confidence = result.confidence
      
      console.log('Transcript:', transcriptText, 'Confidence:', confidence)
      
      // Optional: Filter low confidence results (noise)
      if (confidence < 0.5) {
        console.log('Low confidence, ignoring...')
        return
      }
      
      setTranscript(transcriptText)
      setListening(false)
    }

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setError(`Error: ${event.error}`)
      setListening(false)
    }

    recognitionInstance.onend = () => {
      setListening(false)
    }

    setRecognition(recognitionInstance)

    // Cleanup
    return () => {
      if (recognitionInstance) {
        recognitionInstance.abort()
      }
    }
  }, [])

  // Parse command whenever transcript changes (fixed with useEffect)
  useEffect(() => {
    if (!transcript) return
    
    const parsed = parseCommand(transcript)
    setLog((prev) => [...prev, parsed])
  }, [transcript]) // Only runs when transcript actually changes

  const startListening = () => {
    if (!recognition) {
      setError('Speech recognition not initialized')
      return
    }

    if (listening) {
      console.log('Already listening...')
      return
    }

    setError(null)
    setListening(true)
    recognition.start()
  }

  // Mock parseCommand (replace with your actual import)
  const parseCommand = (text) => {
    const lower = text.toLowerCase().trim()
    
    if (lower.includes('add') || lower.includes('buy')) {
      const item = lower.replace(/add|buy/i, '').trim()
      return { 
        action: 'add', 
        item: item || 'unknown item', 
        raw: text,
        timestamp: new Date().toISOString()
      }
    } else if (lower.includes('remove') || lower.includes('delete')) {
      const item = lower.replace(/remove|delete/i, '').trim()
      return { 
        action: 'remove', 
        item: item || 'unknown item', 
        raw: text,
        timestamp: new Date().toISOString()
      }
    } else if (lower.includes('checkout') || lower.includes('pay')) {
      return { 
        action: 'checkout', 
        raw: text,
        timestamp: new Date().toISOString()
      }
    } else if (lower.includes('show') || lower.includes('view') || lower.includes('cart')) {
      return { 
        action: 'show_cart', 
        raw: text,
        timestamp: new Date().toISOString()
      }
    } else {
      return { 
        action: 'unknown', 
        raw: text,
        timestamp: new Date().toISOString()
      }
    }
  }

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

      {/* Voice Shopping Assistant - Fixed Version */}
      <section id="voice-assistant" className="p-6 max-w-md mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4">Voice Shopping Assistant</h2>
        
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
        
        {error && (
          <p className="text-red-600 mt-2 text-sm">{error}</p>
        )}
        
        <div className="mt-4">
          <p className="text-gray-600">
            <span className="font-medium">Heard:</span> "{transcript || 'Nothing yet'}"
          </p>
        </div>
        
        <div className="mt-4">
          <h3 className="font-semibold text-gray-700 mb-2">Last Command:</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-32">
            {log.length > 0 
              ? JSON.stringify(log[log.length - 1], null, 2) 
              : 'No commands yet'}
          </pre>
        </div>

        {log.length > 1 && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-700 mb-2">Command History:</h3>
            <div className="max-h-40 overflow-auto bg-gray-50 p-2 rounded text-sm">
              {log.map((entry, index) => (
                <div key={index} className="border-b border-gray-200 py-1">
                  <span className="text-gray-500">{index + 1}.</span>{' '}
                  <span className="font-medium">{entry.action}:</span>{' '}
                  {entry.item || entry.raw}
                </div>
              ))}
            </div>
          </div>
        )}
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