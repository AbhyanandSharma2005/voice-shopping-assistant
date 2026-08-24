export function SuggestionChips({ suggestions, onSelectSuggestion }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div 
      className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl space-y-2 mb-4"
      role="region" 
      aria-label="Smart Recommendations"
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-300">
        <span>💡 Suggested for you</span>
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Suggested Items">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.name}
            type="button"
            onClick={() => onSelectSuggestion(suggestion.name)}
            aria-label={`Add suggested item: ${suggestion.name}`}
            className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-200 rounded-full border border-amber-200 dark:border-amber-800 hover:border-amber-400 shadow-xs hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-all"
          >
            <span>+</span>
            <span>{suggestion.name}</span>
            {suggestion.type && (
              <span className="text-[10px] text-zinc-400 uppercase font-mono">({suggestion.type})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}