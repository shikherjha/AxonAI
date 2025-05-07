import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../utils/types';

// Updated languages list with Indian languages
export const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
];

interface LanguageContextType {
  language: Language;
  languages: Language[];
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if user has a preference in localStorage, otherwise use English as default
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguageCode = localStorage.getItem('languageCode');
    if (savedLanguageCode) {
      const savedLanguage = languages.find(lang => lang.code === savedLanguageCode);
      return savedLanguage || languages[0];
    }
    return languages[0]; // Default to English
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('languageCode', language.code);
    // Here you would also update any i18n library if you're using one
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, languages, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};