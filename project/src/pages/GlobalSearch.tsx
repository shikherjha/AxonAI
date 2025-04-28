import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Book, FileText, Newspaper, Headphones, Video, Cuboid as Cube, Filter, Bookmark, Sun, Moon } from 'lucide-react';
import axios from 'axios'; // Axios for API requests

const categories = [
  { id: 'articles', name: 'Articles', icon: Newspaper },
  { id: 'books', name: 'Books', icon: Book },
  { id: 'papers', name: 'Research Papers', icon: FileText },
  { id: 'audio', name: 'Audio Lectures', icon: Headphones },
  { id: 'videos', name: 'Video Tutorials', icon: Video },
  { id: 'simulations', name: 'Interactive Simulations', icon: Cube },
];

const GlobalSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]); // State to store search results
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state

  // Handle search query and API request
  const handleSearch = async () => {
    if (searchQuery.trim() === '') return; // Prevent empty searches

    setLoading(true); // Set loading to true when search starts
    try {
      const response = await axios.get('https://searx.be/search', {
        params: {
          q: searchQuery,
          format: 'json', // We want the results in JSON format
        },
      });

      setResults(response.data.results); // Update results with SearxNG response
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false); // Set loading to false once the request is completed
    }
  };

  // Handle "Enter" key press for search
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
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
                  onKeyDown={handleKeyPress} // Listen for "Enter" key press
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
                onClick={handleSearch} // Trigger search on click
                className="ml-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Search"
              >
                <Search size={24} />
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
              className={`p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 ${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <category.icon size={24} className="text-primary-600" />
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
            <h2 className="text-xl font-semibold">Search Results</h2>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <div className="text-center text-gray-400">Loading...</div>
            ) : results.length > 0 ? (
              results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`p-4 rounded-lg transition-all hover:scale-[1.01] ${
                    isDarkMode
                      ? 'bg-gray-800 hover:bg-gray-700'
                      : 'bg-white hover:shadow-lg border border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold mb-2">{result.title}</h3>
                      <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {result.content}
                      </p>
                    </div>
                    <button
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      title="Save to Learning Pathway"
                    >
                      <Bookmark size={20} className="text-gray-400 hover:text-primary-600" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-gray-400">No results found</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GlobalSearch;
