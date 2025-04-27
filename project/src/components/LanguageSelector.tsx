import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '../utils/types';

interface LanguageSelectorProps {
  languages: Language[];
  selected: Language;
  onSelect: (language: Language) => void;
  mobile?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  languages, 
  selected, 
  onSelect,
  mobile = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleSelectLanguage = (language: Language) => {
    onSelect(language);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={toggleDropdown}
        className={`flex items-center gap-2 ${
          mobile ? 'w-full justify-between p-3 border border-gray-200 rounded-md' 
                : 'text-gray-700 hover:text-gray-900'
        }`}
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">{selected.flag}</span>
          <span>{selected.name}</span>
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div 
          className={`absolute bg-white rounded-md shadow-lg py-1 mt-1 z-50 ${
            mobile ? 'w-full' : 'right-0 min-w-40'
          }`}
        >
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleSelectLanguage(language)}
              className={`flex items-center gap-2 p-2 w-full text-left hover:bg-gray-100 ${
                selected.code === language.code ? 'bg-primary-50 text-primary-600' : ''
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;