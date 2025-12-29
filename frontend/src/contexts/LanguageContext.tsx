import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'id', name: 'Bahasa Indonesia', nativeName: 'Bahasa Indonesia' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'or', name: 'Oriya', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Panjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  getTranslation: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    SUPPORTED_LANGUAGES.find(lang => lang.code === 'en') || SUPPORTED_LANGUAGES[0]
  );

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    // Store in localStorage for persistence
    localStorage.setItem('agriguru-language', language.code);
  };

  // Simple translation function - in a real app, this would connect to i18n
  const getTranslation = (key: string) => {
    // For now, return the key itself - later integrate with i18n
    return key;
  };

  React.useEffect(() => {
    // Load saved language on mount
    const savedLanguage = localStorage.getItem('agriguru-language');
    if (savedLanguage) {
      const language = SUPPORTED_LANGUAGES.find(lang => lang.code === savedLanguage);
      if (language) {
        setCurrentLanguage(language);
      }
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, getTranslation }}>
      {children}
    </LanguageContext.Provider>
  );
};