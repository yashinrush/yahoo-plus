import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialQuery?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'キーワードでニュースを検索',
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);

  // Debounced search trigger (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());

    if (query.trim()) {
      // Record search hit to boost trending velocity
      fetch('/api/trending/hit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: query.trim() }),
      }).catch(() => {});
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center w-full"
      role="search"
      aria-label="News Search"
    >
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-l focus:outline-none focus:border-blue-600 placeholder:text-slate-400 text-slate-800"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Clear search input"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <button
        type="submit"
        className="h-9 px-4.5 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-r flex items-center justify-center transition-colors cursor-pointer shrink-0"
        aria-label="Submit search"
      >
        <Search className="w-4 h-4 stroke-[2.5]" />
      </button>
    </form>
  );
};
