import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Book, FileText, Newspaper, Headphones, Video, Cuboid as Cube, X, Bookmark, Sun, Moon } from 'lucide-react';
import axios from 'axios';

// Categories for filtering
const categories = [
  { id: 'articles', name: 'Articles', icon: Newspaper },
  { id: 'books', name: 'Books', icon: Book },
  { id: 'papers', name: 'Research Papers', icon: FileText },
  { id: 'audio', name: 'Audio Lectures', icon: Headphones },
  { id: 'videos', name: 'Video Tutorials', icon: Video },
  { id: 'simulations', name: 'Interactive Simulations', icon: Cube },
];

// Educational sources to prioritize in results
const educationalSources = [
  'wikipedia.org',
  'khan-academy',
  'coursera',
  'edx.org',
  'mit.edu',
  'stanford.edu',
  'harvard.edu',
  'arxiv.org',
  'researchgate.net',
  'jstor.org',
  'youtube.com/edu',
  'scholar.google',
  'openstax.org',
  'plos.org',
  'open.edu',
];

// Define the search result interface
interface SearchResult {
  id?: string;
  title: string;
  description: string;
  url: string;
  source?: string;
  category: string;
  isEducational: boolean;
  // Original data fields from APIs in case we need them
  originalData?: any;
}

// Type for API selection
type SearchAPI = 'duckduckgo' | 'tavily' | 'groq' | 'all';

const GlobalSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAPI, setSelectedAPI] = useState<SearchAPI>('duckduckgo');

  // Handle filtering results when category or results change
  useEffect(() => {
    if (activeCategory && results.length > 0) {
      filterResultsByCategory(activeCategory);
    } else {
      setFilteredResults(results);
    }
  }, [activeCategory, results]);

  // Determine result category based on content and URL
  const determineCategory = (result: any): string => {
    const title = (result.title || '').toLowerCase();
    const description = (result.description || '').toLowerCase();
    const url = (result.url || '').toLowerCase();
    
    if (
      url.includes('youtube.com') || 
      url.includes('vimeo.com') || 
      title.includes('video') || 
      description.includes('video tutorial')
    ) {
      return 'videos';
    } else if (
      url.includes('arxiv') || 
      url.includes('research') || 
      url.includes('paper') ||
      title.includes('research') ||
      description.includes('research paper')
    ) {
      return 'papers';
    } else if (
      url.includes('book') || 
      title.includes('textbook') || 
      title.includes('book') ||
      description.includes('chapter') ||
      description.includes('textbook')
    ) {
      return 'books';
    } else if (
      url.includes('podcast') || 
      url.includes('audio') || 
      url.includes('lecture') ||
      title.includes('podcast') ||
      title.includes('audio') ||
      description.includes('lecture')
    ) {
      return 'audio';
    } else if (
      url.includes('simulator') || 
      url.includes('interactive') ||
      title.includes('simulation') ||
      description.includes('interactive')
    ) {
      return 'simulations';
    } else {
      return 'articles'; // Default category
    }
  };

  // Check if a result is from an educational source
  const isEducationalSource = (result: any): boolean => {
    const url = (result.url || '').toLowerCase();
    const title = (result.title || '').toLowerCase();
    const description = (result.description || '').toLowerCase();
    
    // Check against our list of educational domains
    return educationalSources.some(source => 
      url.includes(source) || 
      title.includes(source) || 
      description.includes(source) ||
      // Also check for educational keywords
      description.includes('university') ||
      description.includes('course') ||
      description.includes('lecture') ||
      title.includes('university') ||
      title.includes('course') ||
      title.includes('lecture')
    );
  };

  // Filter results by selected category
  const filterResultsByCategory = (categoryId: string) => {
    if (!categoryId) {
      setFilteredResults(results);
      return;
    }

    const filtered = results.filter(result => result.category === categoryId);
    setFilteredResults(filtered);
  };

  // Handle clicking on a category
  const handleCategoryClick = (categoryId: string) => {
    if (activeCategory === categoryId) {
      // If clicking the already active category, clear filter
      setActiveCategory(null);
    } else {
      // Otherwise set new active category
      setActiveCategory(categoryId);
    }
  };

  // Enhance search query for educational focus
  const getEnhancedQuery = (query: string): string => {
    // Add terms to focus on educational content
    return `${query} (education OR learning OR academic OR tutorial OR course OR lecture)`;
  };

  // Extract domain from URL
  const extractDomain = (url: string): string => {
    try {
      if (!url) return '';
      if (!url.includes('//')) url = 'https://' + url;
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '');
    } catch (e) {
      return url;
    }
  };

  // Format DuckDuckGo results into our standard format
  const formatDuckDuckGoResults = (data: any): SearchResult[] => {
    if (!data.RelatedTopics || !Array.isArray(data.RelatedTopics)) {
      return [];
    }

    return data.RelatedTopics.map((topic: any) => {
      // Extract URL from HTML if available
      const urlMatch = topic.Result ? topic.Result.match(/href="([^"]*)"/) : null;
      const url = urlMatch ? urlMatch[1] : topic.FirstURL || '';
      
      // Extract title from HTML or use Text field
      const titleMatch = topic.Result ? topic.Result.match(/>([^<]*)<\/a>/) : null;
      const title = titleMatch ? titleMatch[1] : topic.Text || 'Unknown';
      
      // Use available description or fallback to title
      const description = topic.AbstractText || topic.Abstract || topic.Text || '';
      
      const result: SearchResult = {
        title,
        description,
        url,
        source: extractDomain(url),
        category: determineCategory({ title, description, url }),
        isEducational: isEducationalSource({ title, description, url }),
        originalData: topic
      };
      
      return result;
    });
  };

  // Format Tavily results
  const formatTavilyResults = (data: any): SearchResult[] => {
    if (!data || !data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item: any) => {
      const result: SearchResult = {
        title: item.title || 'Unknown',
        description: item.content || item.snippet || '',
        url: item.url || '',
        source: extractDomain(item.url),
        category: determineCategory(item),
        isEducational: isEducationalSource(item),
        originalData: item
      };
      
      return result;
    });
  };

  // Format Groq results
  const formatGroqResults = (data: any): SearchResult[] => {
    // Adapt this to the actual Groq API response structure
    if (!data || !data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item: any) => {
      const result: SearchResult = {
        title: item.title || 'Unknown',
        description: item.snippet || item.description || '',
        url: item.url || '',
        source: extractDomain(item.url),
        category: determineCategory(item),
        isEducational: isEducationalSource(item),
        originalData: item
      };
      
      return result;
    });
  };

  // Search with DuckDuckGo API
  const searchWithDuckDuckGo = async (query: string): Promise<SearchResult[]> => {
    try {
      const enhancedQuery = getEnhancedQuery(query);
      
      const response = await axios.get('https://api.duckduckgo.com/', {
        params: {
          q: enhancedQuery,
          format: 'json',
          no_html: 1,
          no_redirect: 1,
          // DuckDuckGo public API doesn't require an API key
        },
      });

      if (!response.data) {
        throw new Error('Empty response from DuckDuckGo API');
      }

      return formatDuckDuckGoResults(response.data);
    } catch (error) {
      console.error('DuckDuckGo search error:', error);
      throw error;
    }
  };

  // Search with Tavily API
  const searchWithTavily = async (query: string): Promise<SearchResult[]> => {
    try {
      const enhancedQuery = getEnhancedQuery(query);
      const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY;
      
      const response = await axios.post('https://api.tavily.com/search', {
        query: enhancedQuery,
        search_depth: "advanced",
        include_domains: educationalSources,
        api_key: TAVILY_API_KEY
      });

      if (!response.data) {
        throw new Error('Empty response from Tavily API');
      }

      return formatTavilyResults(response.data);
    } catch (error) {
      console.error('Tavily search error:', error);
      throw error;
    }
  };

  // Search with Groq API
  const searchWithGroq = async (query: string): Promise<SearchResult[]> => {
    try {
      const enhancedQuery = getEnhancedQuery(query);
      const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
      
      // Note: You'll need to adjust this based on the actual Groq search API endpoint
      const response = await axios.post('https://api.groq.com/v1/search', {
        query: enhancedQuery,
        max_results: 10
      }, {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data) {
        throw new Error('Empty response from Groq API');
      }

      return formatGroqResults(response.data);
    } catch (error) {
      console.error('Groq search error:', error);
      throw error;
    }
  };

  // Handle search with multiple APIs
  const handleMultiSearch = async () => {
    try {
      const results = await Promise.all([
        searchWithDuckDuckGo(searchQuery).catch(() => []),
        searchWithTavily(searchQuery).catch(() => []),
        searchWithGroq(searchQuery).catch(() => [])
      ]);
      
      // Combine and deduplicate results
      const allResults = results.flat();
      
      // Simple deduplication by URL
      const uniqueUrls = new Set();
      const dedupedResults = allResults.filter(result => {
        if (!result.url || uniqueUrls.has(result.url)) return false;
        uniqueUrls.add(result.url);
        return true;
      });
      
      return dedupedResults;
    } catch (error) {
      console.error('Multi-search error:', error);
      throw error;
    }
  };

  // Main search handler
  const handleSearch = async () => {
    if (searchQuery.trim() === '') return;

    setLoading(true);
    setError(null);
    
    try {
      let searchResults: SearchResult[] = [];
      
      // Perform search based on selected API
      switch(selectedAPI) {
        case 'duckduckgo':
          searchResults = await searchWithDuckDuckGo(searchQuery);
          break;
        case 'tavily':
          searchResults = await searchWithTavily(searchQuery);
          break;
        case 'groq':
          searchResults = await searchWithGroq(searchQuery);
          break;
        case 'all':
          searchResults = await handleMultiSearch();
          break;
      }

      // Sort results: educational first, then by category relevance
      const sortedResults = searchResults.sort((a, b) => {
        // First sort by educational status
        if (a.isEducational && !b.isEducational) return -1;
        if (!a.isEducational && b.isEducational) return 1;
        
        // Then sort by category relevance if we have an active category
        if (activeCategory) {
          if (a.category === activeCategory && b.category !== activeCategory) return -1;
          if (a.category !== activeCategory && b.category === activeCategory) return 1;
        }
        
        return 0;
      });

      setResults(sortedResults);
      setFilteredResults(sortedResults);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setError('Failed to fetch search results. Please try again.');
      setResults([]);
      setFilteredResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle clicking a search result - opens in a new tab
  const handleResultClick = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener noreferrer');
    }
  };

  // Save result to bookmarks (placeholder function)
  const handleSaveBookmark = (e: React.MouseEvent, result: any) => {
    e.stopPropagation(); // Prevent triggering the parent click
    console.log('Saved to bookmarks:', result);
    alert('Result saved to Learning Pathway!');
  };

  return (
    <div className={`min-h-screen pt-24 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Search for knowledge..."
                  className={`w-full pl-12 pr-4 py-4 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow ${
                    isDarkMode
                      ? 'bg-gray-800 text-white border-gray-700'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <button
                onClick={handleSearch}
                className="ml-4 p-4 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                title="Search"
              >
                <Search size={20} />
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="ml-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Toggle dark mode"
              >
                {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
              </button>
            </motion.div>
          </div>
          
          {/* API Selection */}
          <div className="flex gap-2 mt-4 justify-center">
            <button 
              onClick={() => setSelectedAPI('duckduckgo')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedAPI === 'duckduckgo' 
                  ? 'bg-primary-600 text-white' 
                  : isDarkMode 
                    ? 'bg-gray-800 text-gray-300' 
                    : 'bg-gray-200 text-gray-700'
              }`}
            >
              DuckDuckGo
            </button>
            <button 
              onClick={() => setSelectedAPI('tavily')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedAPI === 'tavily' 
                  ? 'bg-primary-600 text-white' 
                  : isDarkMode 
                    ? 'bg-gray-800 text-gray-300' 
                    : 'bg-gray-200 text-gray-700'
              }`}
            >
              Tavily
            </button>
            <button 
              onClick={() => setSelectedAPI('groq')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedAPI === 'groq' 
                  ? 'bg-primary-600 text-white' 
                  : isDarkMode 
                    ? 'bg-gray-800 text-gray-300' 
                    : 'bg-gray-200 text-gray-700'
              }`}
            >
              Groq
            </button>
            <button 
              onClick={() => setSelectedAPI('all')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedAPI === 'all' 
                  ? 'bg-primary-600 text-white' 
                  : isDarkMode 
                    ? 'bg-gray-800 text-gray-300' 
                    : 'bg-gray-200 text-gray-700'
              }`}
            >
              All APIs
            </button>
          </div>
        </div>

        {/* Category Tiles */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => handleCategoryClick(category.id)}
              className={`p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 ${
                activeCategory === category.id
                  ? 'ring-2 ring-primary-500 shadow-md' 
                  : ''
              } ${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <category.icon size={24} className={activeCategory === category.id ? "text-primary-600" : "text-gray-500"} />
              <span className="text-sm font-medium">{category.name}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Search Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex-1"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Search Results {activeCategory && `(Filtered by ${categories.find(c => c.id === activeCategory)?.name})`}
            </h2>
            {activeCategory && (
              <button 
                onClick={() => setActiveCategory(null)}
                className="text-primary-600 text-sm hover:underline"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-6">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-2"></div>
                <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Searching for educational resources...</p>
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <p className="text-red-500 mb-2">{error}</p>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Please try again or contact support if the issue persists
                </p>
              </div>
            ) : filteredResults.length > 0 ? (
              filteredResults.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => handleResultClick(result.url)}
                  className={`p-4 rounded-lg transition-all hover:scale-[1.01] cursor-pointer ${
                    isDarkMode
                      ? 'bg-gray-800 hover:bg-gray-700'
                      : 'bg-white hover:shadow-lg border border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {/* Show category icon */}
                        {categories.find(c => c.id === result.category)?.icon && 
                          React.createElement(categories.find(c => c.id === result.category)!.icon, { 
                            size: 16, 
                            className: "text-primary-600" 
                          })
                        }
                        <span className="text-xs text-gray-500">
                          {categories.find(c => c.id === result.category)?.name || 'Article'}
                        </span>
                        {result.isEducational && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-200">
                            Educational
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold mb-2">{result.title}</h3>
                      <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {result.description || 'No description available'}
                      </p>
                      {result.url && (
                        <p className="text-xs text-primary-600 hover:underline">
                          {result.source || extractDomain(result.url)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleSaveBookmark(e, result)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      title="Save to Learning Pathway"
                    >
                      <Bookmark size={20} className="text-gray-400 hover:text-primary-600" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : searchQuery ? (
              <div className="text-center py-12">
                <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>No results found for your search</p>
                <p className="text-sm text-gray-500">Try adjusting your search terms or removing the category filter</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                  Enter a search term to begin exploring educational resources
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GlobalSearch;