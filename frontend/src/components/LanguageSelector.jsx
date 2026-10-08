import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage, languages, t } = useLanguage();

  return (
    <div className="language-selector-wrapper" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <Globe size={16} style={{ color: 'var(--gray-600)', flexShrink: 0 }} aria-hidden="true" />
      <label htmlFor="language-select" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
        {t('common.language')}
      </label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        aria-label={t('common.language')}
        style={{
          padding: '5px 10px',
          fontSize: '0.82rem',
          fontWeight: 600,
          borderRadius: '6px',
          border: '1px solid var(--gray-300)',
          background: '#ffffff',
          color: 'var(--gray-800)',
          cursor: 'pointer',
          outline: 'none',
          transition: 'border-color 0.15s ease',
        }}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName} ({lang.name})
          </option>
        ))}
      </select>
    </div>
  );
}
