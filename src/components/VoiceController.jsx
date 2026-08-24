import React from 'react';

export function VoiceController({ isListening, toggleListening, transcript, error }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-50 w-full max-w-sm px-4">
      {/* Real-time speech transcript pill */}
      {transcript && (
        <div 
          className="bg-zinc-900/90 text-white text-xs px-3 py-1.5 rounded-full shadow-md backdrop-blur-md animate-fade-in border border-zinc-700 max-w-xs truncate"
          aria-live="polite"
        >
          <span className="text-zinc-400 font-medium">Heard:</span> "{transcript}"
        </div>
      )}

      {/* Floating Action Button Container */}
      <div className="relative flex items-center justify-center">
        {/* Animated ripple indicator */}
        {isListening && (
          <>
            <span className="absolute h-16 w-16 rounded-full bg-emerald-500/30 animate-ping" />
            <span className="absolute h-20 w-20 rounded-full bg-emerald-500/15 animate-pulse" />
          </>
        )}

        <button
          type="button"
          onClick={toggleListening}
          aria-label={isListening ? "Stop voice recognition" : "Start voice recognition"}
          aria-pressed={isListening}
          className={`relative z-10 flex items-center justify-center min-w-[56px] min-h-[56px] rounded-full shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${
            isListening
              ? "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-400"
              : "bg-emerald-600 text-white hover:bg-emerald-750 focus-visible:ring-emerald-400 hover:scale-105"
          }`}
        >
          {isListening ? (
            /* Stop Icon (Square) */
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            /* Mic Icon */
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Voice status label */}
      <span className="text-[11px] tracking-wide font-medium text-zinc-500 uppercase">
        {isListening ? "Listening... (Tap to stop)" : "Tap mic or press Space"}
      </span>
    </div>
  );
}