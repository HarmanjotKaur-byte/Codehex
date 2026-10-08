// @refresh reset
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translate, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../i18n/index.js';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'paralipay_language';

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) return saved;
    } catch (_) {}
    return DEFAULT_LANGUAGE;
  });

  const changeLanguage = (langCode) => {
    if (SUPPORTED_LANGUAGES.some(l => l.code === langCode)) {
      setCurrentLanguage(langCode);
      try { localStorage.setItem(STORAGE_KEY, langCode); } catch (_) {}
    }
  };

  useEffect(() => {
    try {
      const bcp47Map = { en: 'en-IN', hi: 'hi-IN', pa: 'pa-IN' };
      document.documentElement.lang = bcp47Map[currentLanguage] || currentLanguage;
    } catch (_) {}
  }, [currentLanguage]);

  const t = (key, params = {}) => {
    const fallback = typeof params === 'string' ? params : undefined;
    const interpolationParams = params && typeof params === 'object' && !Array.isArray(params)
      ? params
      : {};
    const translated = translate(key, currentLanguage, interpolationParams);
    return fallback && translated === key.split('.').pop() ? fallback : translated;
  };

  return (
    <LanguageContext.Provider value={{ language: currentLanguage, setLanguage: changeLanguage, languages: SUPPORTED_LANGUAGES, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
