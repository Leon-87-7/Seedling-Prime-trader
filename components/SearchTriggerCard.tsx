'use client';

export default function SearchTriggerCard() {
  const handleClick = () => {
    // Simulate Cmd+K / Ctrl+K keyboard shortcut to trigger the search in navbar
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      code: 'KeyK',
      metaKey: true, // For Mac
      ctrlKey: true, // For Windows/Linux
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center justify-center bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg h-[400px] hover:border-yellow-500/50 hover:bg-gray-800/70 transition-all group cursor-pointer"
    >
      <div className="text-center px-6">
        <div className="mb-4 text-gray-600 group-hover:text-yellow-500 transition-colors">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-300 group-hover:text-yellow-400 transition-colors mb-2">
          Add More Stocks
        </h3>
        <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
          Click to search and track more stocks
        </p>
      </div>
    </div>
  );
}
