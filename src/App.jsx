import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

// You'll need to create these files:
// - ./hooks/useSpeechRecognition.js
// - ./utils/parseCommand.js

function App() {
  const [count, setCount] = useState(0)
  
  // Speech recognition state
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(null)
  const [log, setLog] = useState([])

  // Mock speech recognition (replace with actual implementation)
  const startListening = () => {
    setListening(true)
    setError(null)
    
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser')
      setListening(false)
      return
    }

    // Simulate listening for demo purposes
    // In production, use the actual Web Speech API
    setTimeout(() => {
      const demoTranscripts = [
        'add apples to cart',
        'remove bananas',
        'checkout',
        'show my cart',
        'add milk'
      ]
      const randomTranscript = demoTranscripts[Math.floor(Math.random() * demoTranscripts.length)]
      setTranscript(randomTranscript)
      setListening(false)
      
      // Parse the command
      const parsed = parseCommand(randomTranscript)
      setLog(prev => [...prev, parsed])
    }, 2000)
  }

  // Mock parseCommand function (replace with your actual implementation)
  const parseCommand = (text) => {
    const lower = text.toLowerCase()
    if (lower.includes('add')) {
      return { action: 'add', item: text.replace('add', '').trim(), raw: text }
    } else if (lower.includes('remove')) {
      return { action: 'remove', item: text.replace('remove', '').trim(), raw: text }
    } else if (lower.includes('checkout')) {
      return { action: 'checkout', raw: text }
    } else if (lower.includes('show')) {
      return { action: 'show_cart', raw: text }
    } else {
      return { action: 'unknown', raw: text }
    }
  }

  const handleMicClick = () => {
    if (!listening) {
      startListening()
    }
  }

  return (
    <>
      {/* Original Hero Section */}
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

      {/* Voice Shopping Assistant Section */}
      <section id="voice-assistant" className="p-6 max-w-md mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4">Voice Shopping Assistant</h2>
        <button
          onClick={handleMicClick}
          className={`px-6 py-3 rounded-full text-white ${
            listening ? 'bg-red-500 animate-pulse' : 'bg-blue-600'
          }`}
          disabled={listening}
        >
          {listening ? 'Listening...' : '🎤 Tap to speak'}
        </button>
        {error && <p className="text-red-600 mt-2">{error}</p>}
        <p className="mt-4 text-gray-600">Heard: "{transcript}"</p>
        {log.length > 0 && (
          <pre className="mt-4 bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(log[log.length - 1], null, 2)}
          </pre>
        )}
      </section>

      <div className="ticks"></div>

      {/* Original Next Steps Section */}
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