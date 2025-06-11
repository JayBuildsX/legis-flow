import { useState, useEffect, useRef, useCallback } from 'react';
import { LucideSearch, LucideX } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import debounce from 'lodash/debounce';

interface SearchBoxProps {
  initialValue?: string;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface Suggestion {
  id: string;
  title: string;
  reference: string;
}

export default function SearchBox({
  initialValue = '',
  onSearch,
  placeholder = 'Rechercher...',
  className = ''
}: SearchBoxProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Sync searchTerm when initialValue changes from parent
  useEffect(() => {
    if (initialValue !== searchTerm) {
      setSearchTerm(initialValue);
    }
  }, [initialValue]);

  // Debounced fetch suggestions function
  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await apiClient.suggestDocuments(query);
        if (response.status === 200) {
          setSuggestions(response.data.suggestions);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );
  
  // Update suggestions when search term changes
  useEffect(() => {
    if (searchTerm.length >= 2) {
      fetchSuggestions(searchTerm);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, fetchSuggestions]);
  
  // Handle outside click to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('SearchBox: Search submitted with term:', searchTerm);
    
    if (onSearch) {
      console.log('SearchBox: Calling onSearch callback with term:', searchTerm);
      onSearch(searchTerm);
    } else {
      // Default behavior: navigate to documents with search term
      console.log('SearchBox: Navigating to documents page with query:', searchTerm);
      router.push(`/documents?q=${encodeURIComponent(searchTerm)}`);
    }
    
    setShowSuggestions(false);
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: Suggestion) => {
    router.push(`/documents/${suggestion.id}`);
    setShowSuggestions(false);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Highlight matching text in suggestions
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-primary/20 font-medium">{part}</mark> : part
    );
  };
  
  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <LucideSearch size={16} className="text-muted-foreground" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
            className="py-2 pl-10 pr-10 w-full text-sm rounded-md border border-input bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder={placeholder}
            autoComplete="off"
          />
          
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <LucideX size={16} className="text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </form>
      
      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute mt-1 w-full z-50 bg-white dark:bg-slate-950 rounded-md shadow-lg border border-border max-h-64 overflow-auto"
        >
          {loading ? (
            <div className="p-2 text-center text-sm text-muted-foreground">
              Chargement...
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-muted flex flex-col"
                  >
                    <span className="font-medium">
                      {highlightMatch(suggestion.title, searchTerm)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {highlightMatch(suggestion.reference, searchTerm)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : searchTerm.length >= 2 ? (
            <div className="p-2 text-center text-sm text-muted-foreground">
              Aucun document trouvé
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
} 