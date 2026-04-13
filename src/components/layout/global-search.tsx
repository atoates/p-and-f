'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  FileText,
  ShoppingCart,
  BookUser,
  Receipt,
  FileCheck,
  Truck,
  ChevronRight,
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'enquiry' | 'order' | 'contact' | 'invoice' | 'proposal' | 'delivery';
  title: string;
  subtitle?: string;
  url: string;
}

type Category = 'All' | 'Enquiries' | 'Orders' | 'Contacts' | 'Invoices' | 'Proposals' | 'Delivery';

const CATEGORIES: Category[] = ['All', 'Enquiries', 'Orders', 'Contacts', 'Invoices', 'Proposals', 'Delivery'];

const CATEGORY_TO_TYPE: Record<Category, string> = {
  All: '',
  Enquiries: 'enquiry',
  Orders: 'order',
  Contacts: 'contact',
  Invoices: 'invoice',
  Proposals: 'proposal',
  Delivery: 'delivery',
};

const ICON_MAP: Record<SearchResult['type'], React.ComponentType<any>> = {
  enquiry: FileText,
  order: ShoppingCart,
  contact: BookUser,
  invoice: Receipt,
  proposal: FileCheck,
  delivery: Truck,
};

export function GlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [groupedResults, setGroupedResults] = useState<Map<string, SearchResult[]>>(new Map());

  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Register keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
      setSelectedResultIndex(-1);
    }
  }, [isOpen]);

  // Trap focus in dialog
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const resultCount = Array.from(groupedResults.values()).flat().length;
        setSelectedResultIndex((prev) => (prev < resultCount - 1 ? prev + 1 : 0));
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const resultCount = Array.from(groupedResults.values()).flat().length;
        setSelectedResultIndex((prev) => (prev > 0 ? prev - 1 : resultCount - 1));
      }

      if (e.key === 'Enter' && selectedResultIndex >= 0) {
        e.preventDefault();
        const flatResults = Array.from(groupedResults.values()).flat();
        const selectedResult = flatResults[selectedResultIndex];
        if (selectedResult) {
          handleResultClick(selectedResult);
        }
      }
    };

    dialogRef.current?.addEventListener('keydown', handleKeyDown);
    return () => dialogRef.current?.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedResultIndex, groupedResults]);

  // Debounced search
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setGroupedResults(new Map());
      return;
    }

    setIsLoading(true);

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const categoryParam = CATEGORY_TO_TYPE[selectedCategory];
        const params = new URLSearchParams({
          q: query,
          ...(categoryParam && { category: categoryParam }),
        });

        const response = await fetch(`/api/search?${params}`);
        const data: SearchResult[] = await response.json();

        setResults(data);
        groupResultsByCategory(data);
        setSelectedResultIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setGroupedResults(new Map());
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, selectedCategory]);

  const groupResultsByCategory = (items: SearchResult[]) => {
    const grouped = new Map<string, SearchResult[]>();

    items.forEach((item) => {
      const category = item.type.charAt(0).toUpperCase() + item.type.slice(1);
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(item);
    });

    setGroupedResults(grouped);
  };

  const handleResultClick = (result: SearchResult) => {
    // Add to recent searches
    setRecentSearches((prev) => {
      const updated = [query, ...prev.filter((q) => q !== query)].slice(0, 5);
      return updated;
    });

    setIsOpen(false);
    router.push(result.url);
  };

  const flatResults = Array.from(groupedResults.values()).flat();

  return (
    <>
      {/* Search Icon Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Open global search"
        title="Search (Cmd+K)"
      >
        <Search size={20} />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-[10vh]"
          onClick={() => setIsOpen(false)}
          role="presentation"
        >
          {/* Search Panel */}
          <div
            ref={dialogRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[70vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Global search"
            aria-modal="true"
          >
            {/* Search Input */}
            <div className="border-b border-gray-200 p-4">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Type to search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all text-base"
                  aria-label="Search query"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedResultIndex(-1);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-[#1B4332] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    aria-pressed={selectedCategory === category}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto">
              {query.trim() && isLoading && (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin">
                    <Search size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 mt-2">Searching...</p>
                </div>
              )}

              {query.trim() && !isLoading && results.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-gray-500 mb-2">No results found</p>
                  <p className="text-sm text-gray-400">Try a different search term or category</p>
                </div>
              )}

              {query.trim() && !isLoading && results.length > 0 && (
                <div className="p-4">
                  {Array.from(groupedResults.entries()).map(([category, items]) => (
                    <div key={category} className="mb-6">
                      <h3 className="text-xs uppercase tracking-wide font-serif text-gray-500 mb-2">
                        {category}
                      </h3>
                      <div className="space-y-1">
                        {items.map((result) => {
                          const globalIndex = flatResults.indexOf(result);
                          const Icon = ICON_MAP[result.type];

                          return (
                            <button
                              key={result.id}
                              onClick={() => handleResultClick(result)}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer group ${
                                globalIndex === selectedResultIndex
                                  ? 'bg-[#1B4332] text-white'
                                  : 'text-gray-900 hover:bg-gray-100'
                              }`}
                              role="option"
                              aria-selected={globalIndex === selectedResultIndex}
                            >
                              <Icon
                                size={18}
                                className={globalIndex === selectedResultIndex ? 'text-white' : 'text-gray-400'}
                              />
                              <div className="flex-1 text-left min-w-0">
                                <p className="font-medium truncate">{result.title}</p>
                                {result.subtitle && (
                                  <p
                                    className={`text-sm truncate ${
                                      globalIndex === selectedResultIndex ? 'text-white/70' : 'text-gray-500'
                                    }`}
                                  >
                                    {result.subtitle}
                                  </p>
                                )}
                              </div>
                              <ChevronRight
                                size={16}
                                className={
                                  globalIndex === selectedResultIndex
                                    ? 'text-white/50 opacity-100'
                                    : 'text-gray-300 opacity-0 group-hover:opacity-100'
                                }
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!query.trim() && recentSearches.length > 0 && (
                <div className="p-4">
                  <h3 className="text-xs uppercase tracking-wide font-serif text-gray-500 mb-2">
                    Recent Searches
                  </h3>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={`recent-${index}`}
                        onClick={() => setQuery(search)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-left"
                      >
                        <Search size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!query.trim() && recentSearches.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>Start typing to search...</p>
                </div>
              )}
            </div>

            {/* Footer Hint */}
            {query.trim() && (
              <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 text-center">
                <p className="text-xs text-gray-500">Press Esc to close</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
