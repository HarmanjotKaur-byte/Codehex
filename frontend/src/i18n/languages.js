/**
 * Official Bhashini Language Specifications & Metadata
 * Source: Digital India Bhashini Division (bhashini.gov.in) & AI4Bharat IndicTrans2 Standards
 */

export const SUPPORTED_LANGUAGES = [
  {
    code: 'en',
    bhashiniCode: 'eng_Latn',
    iso639_1: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr'
  },
  {
    code: 'hi',
    bhashiniCode: 'hin_Deva',
    iso639_1: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr'
  },
  {
    code: 'pa',
    bhashiniCode: 'pan_Guru',
    iso639_1: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    direction: 'ltr'
  }
];

export const DEFAULT_LANGUAGE = 'en';

export const LANGUAGE_MAP = SUPPORTED_LANGUAGES.reduce((acc, lang) => {
  acc[lang.code] = lang;
  return acc;
}, {});
