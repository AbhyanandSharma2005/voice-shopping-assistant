import { useState, useEffect } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useShoppingList } from './hooks/useShoppingList';
import { parseCommand } from './utils/parseCommand';

function App() {
  const { transcript, listening, error, startListening } = useSpeechRecognition();
  const { groupedByCategory, lastAction, applyCommand } = useShoppingList();

  useEffect(() => {
    if (!transcript) return;
    const parsed = parseCommand(transcript);
    applyCommand(parsed);
  }, [transcript, applyCommand]);

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

      {/* Confirmation toast for the last action */}
      {lastAction && (
        <div className="mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
          {lastAction.type === 'added' && `Added ${lastAction.quantity} ${lastAction.name} ✓`}
          {lastAction.type === 'updated' && `${lastAction.name} quantity updated to ${lastAction.quantity} ✓`}
          {lastAction.type === 'removed' && `Removed ${lastAction.name} ✓`}
          {lastAction.type === 'not_found' && `"${lastAction.name}" wasn't on your list`}
          {lastAction.type === 'cleared' && `List cleared ✓`}
          {lastAction.type === 'unknown' && `Sorry, I didn't understand that`}
        </div>
      )}

      {/* Shopping list grouped by category */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Your List</h2>
        {Object.keys(groupedByCategory).length === 0 && (
          <p className="text-gray-400 text-sm">Your list is empty. Try saying "Add milk".</p>
        )}
        {Object.entries(groupedByCategory).map(([category, items]) => (
          <div key={category} className="mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">{category}</h3>
            <ul className="space-y-1">
              {items.map((item) => (
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