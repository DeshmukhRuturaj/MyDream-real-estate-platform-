/// <reference types="@types/google.maps" />
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, History, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  redirectToBuy?: boolean;
}

export function SearchBar({ onSearch, redirectToBuy = false }: SearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');
  const [showHistory, setShowHistory] = React.useState(false);
  const [searchHistory, setSearchHistory] = React.useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Add to search history
      const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      
      // If on home page, navigate to buy page with location parameter
      if (redirectToBuy) {
        navigate(`/buy?location=${encodeURIComponent(searchQuery)}`);
      } else {
        // Call onSearch with the query for other pages
        onSearch(searchQuery);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
      setShowHistory(false);
      setQuery(searchQuery);
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-full shadow-lg p-1 sm:p-2">
        <div className="flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowHistory(true);
            }}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowHistory(true)}
            placeholder="Enter an address, neighborhood, city, or ZIP code"
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-lg border-none focus:outline-none rounded-full"
          />
          
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setShowHistory(false);
              }}
              className="p-1 sm:p-2 text-gray-500 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
          
          <button
            onClick={() => handleSearch(query)}
            className="p-2 sm:p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors ml-1 sm:ml-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Search History Dropdown */}
      {showHistory && searchHistory.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-10">
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-gray-50">
            <div className="flex items-center text-gray-600">
              <History className="w-4 h-4 mr-2" />
              <span className="text-xs sm:text-sm font-medium">Recent Searches</span>
            </div>
            <button
              onClick={clearHistory}
              className="text-xs sm:text-sm text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {searchHistory.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSearch(item)}
                className="w-full px-3 sm:px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm sm:text-base text-gray-700"
              >
                <History className="w-4 h-4 mr-2 sm:mr-3 text-gray-400" />
                <span className="truncate">{item}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}