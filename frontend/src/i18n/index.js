import en from './locales/en.js';
import hi from './locales/hi.js';
import pa from './locales/pa.js';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './languages.js';

export const translations = {
  en,
  hi,
  pa
};

/**
 * Nested key lookup with English fallback.
 * Guarantees that raw keys are NEVER displayed to the user.
 */
export function translate(key, language = DEFAULT_LANGUAGE, params = {}) {
  const langData = translations[language] || translations[DEFAULT_LANGUAGE];
  const defaultData = translations[DEFAULT_LANGUAGE];

  const getNested = (obj, path) => {
    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : undefined;
    }, obj);
  };

  let text = getNested(langData, key);

  // Fallback to English if key missing or blank
  if (text === undefined || text === null || text === '') {
    text = getNested(defaultData, key);
  }

  // Final fallback to key tail rather than raw dotted path if missing altogether
  if (text === undefined || text === null) {
    const parts = key.split('.');
    text = parts[parts.length - 1];
  }

  // Parameter substitution if any (e.g. {name})
  // Some callers pass a fallback string as the second argument. Only objects
  // are interpolation parameters; treating a string as one creates keys such
  // as "0" and an invalid regular expression like /{0}/g.
  if (typeof text === 'string' && params && typeof params === 'object' && !Array.isArray(params)) {
    Object.entries(params).forEach(([key, value]) => {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      text = text.replace(new RegExp(`\\{${escapedKey}\\}`, 'g'), String(value));
    });
  }

  return text;
}

export { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE };
