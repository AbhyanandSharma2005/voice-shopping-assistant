export function CategorizedList({ categorizedItems, onRemoveItem, onQuantityChange }) {
  const categories = Object.keys(categorizedItems);

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <p className="text-base font-medium">Your shopping list is empty</p>
        <p className="text-sm">Try saying "Add 2 apples" or "I need bread"</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      {categories.map((category) => (
        <section key={category} aria-labelledby={`category-${category}`}>
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1 mb-2">
            <h3 
              id={`category-${category}`}
              className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              {category}
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              {categorizedItems[category].length}
            </span>
          </div>

          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {categorizedItems[category].map((item) => (
              <li 
                key={item.id}
                className="flex items-center justify-between py-2.5 px-1 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                    {item.name}
                  </span>
                  {item.quantity > 1 && (
                    <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-full font-mono">
                      ×{item.quantity}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {/* Min 44x44px hit target for accessibility */}
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    aria-label={`Remove ${item.name} from list`}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}