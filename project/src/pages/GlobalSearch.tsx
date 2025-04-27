import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Book, FileText, Newspaper, Headphones, Video, Cuboid as Cube, Filter, Bookmark, Sun, Moon } from 'lucide-react';

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

        {/* Filters Button (Mobile) */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`w-full p-3 rounded-lg flex items-center justify-center gap-2 ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
            }`}
          >
            <Filter size={20} />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar (Desktop) */}
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`hidden md:block w-64 flex-shrink-0 ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
            } p-4 rounded-lg sticky top-24 h-fit`}
          >
            <h3 className="font-semibold mb-4">Filters</h3>
            {/* Filter sections would go here */}
          </motion.aside>

          {/* Results Area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex-1"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Resources</h2>
              <button
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                title="View saved items"
              >
                <Bookmark size={20} />
                <span className="hidden sm:inline">Saved Items</span>
              </button>
            </div>

            {/* Example Result Cards */}
            <div className="grid gap-4">
              {[1, 2, 3].map((item) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: item * 0.1 }}
                  className={`p-4 rounded-lg transition-all hover:scale-[1.01] ${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-gray-700' 
                      : 'bg-white hover:shadow-lg border border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold mb-2">Example Resource Title</h3>
                      <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Brief description of the resource content goes here...
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Physics', 'Advanced'].map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      title="Save to Learning Pathway"
                    >
                      <Bookmark size={20} className="text-gray-400 hover:text-primary-600" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;