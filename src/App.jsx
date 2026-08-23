import { useState, useEffect } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { parseCommand } from './utils/parseCommand';

function App() {
  const { transcript, listening, error, startListening } = useSpeechRecognition();
  const [log, setLog] = useState([]);

  // Parse command whenever transcript changes
  useEffect(() => {
    if (!transcript) return;
    const parsed = parseCommand(transcript);
    setLog((prev) => [...prev, parsed]);
  }, [transcript]);

  return (
    <div className="p-6 max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Voice Shopping Assistant</h1>

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
                <span className="font-medium">{entry.intent}:</span>{' '}
                {entry.item || entry.query || entry.raw}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;