# 12. MULTILINGUAL SUPPORT USING BHARAT/BHASHINI LANGUAGE TECHNOLOGY

## 1. Executive Summary & Official Resource Research

ParaliPay implements an official National Digital Bharat / BHASHINI-standard multilingual system targeting the agricultural belt of Punjab and Haryana as well as pan-Indian governance stakeholders.

### Official Government of India Bharat / BHASHINI Reference
- **Governing Body**: Digital India Bhashini Division (DIBD), Ministry of Electronics and Information Technology (MeitY), Government of India.
- **Reference Portals**: [bhashini.gov.in](https://bhashini.gov.in) & ULCA (Universal Language Contribution Assessment) [bhashini.gov.in/ulca](https://bhashini.gov.in/ulca).
- **Core ML Foundation**: AI4Bharat IndicTrans2 benchmarked Indic language processing standards.
- **Licensing & Usage**: Open public digital infrastructure (DPI) model designed to bridge the digital divide for Indian citizens. Permitted for hackathons, societal governance projects, and public digital platforms.

### Supported Language Standards & Codes
ParaliPay adheres to ISO 639-1 / Bhashini Indic script designations:
1. **English (`en` / `eng_Latn`)**: System Default & Seamless Fallback.
2. **Hindi (`hi` / `hin_Deva`)**: Official National Language.
3. **Punjabi (`pa` / `pan_Guru`)**: Gurmukhi script, essential for ground-level agricultural adoption by paddy farmers across Punjab and Haryana.

---

## 2. System Architecture

The multilingual capability is implemented as a single, centralized architecture covering all three primary platform roles:
- **FARMER**
- **BUYER / SELLER**
- **GOVERNMENT OFFICER**

### Directory Structure
```
frontend/src/
├── i18n/
│   ├── languages.js            # Official Bhashini language metadata & registry
│   ├── index.js                # Core translation lookup with nested keys & fallback
│   └── locales/
│       ├── en.js               # Complete English dictionary (Base)
│       ├── hi.js               # Complete Hindi dictionary (Devanagari)
│       └── pa.js               # Complete Punjabi dictionary (Gurmukhi)
├── context/
│   └── LanguageContext.jsx     # Context provider with localStorage persistence
└── components/
    └── LanguageSelector.jsx    # Universal language selector dropdown in Header
```

---

## 3. Key Design Principles & Constraints Honored

1. **Deterministic ML Protection**:
   - ML regression for stubble volume prediction (`tonnes`) and ML classification for burning risk (`LOW`, `MEDIUM`, `HIGH`) inference calculations were kept completely untouched.
   - Predictions continue to output exact floats; only presentation labels and localized risk badges are translated.

2. **Database & API Integrity**:
   - Status enums (`AVAILABLE`, `RESERVED`, `INTERESTED`, `ACCEPTED`, `VERIFIED`, etc.) and role enums (`FARMER`, `BUYER`, `GOVERNMENT`) are preserved as system invariants in the backend database.
   - Translation occurs exclusively at the presentation layer via `t(`status.${status}`)` mappings.

3. **Zero Authentication Interruption**:
   - Switching languages modifies the React state and `localStorage` (`paralipay_language`) without reloading the page, logging the user out, or clearing token headers.

4. **Robust Fallback**:
   - If any translation key is missing in a regional language bundle, the system automatically falls back to English, avoiding raw key display like `dashboard.title`.

---

## 4. Verification Matrix

| Component / Page | Status | Verification Detail |
|---|---|---|
| **Header Language Selector** | ✅ Verified | Available on all pages; immediately toggles `en`, `hi`, and `pa` without reload. |
| **Authentication (Login/Register)** | ✅ Verified | Role badges, input placeholders, buttons, and error messages fully localized. |
| **Farmer Dashboard & ML Tools** | ✅ Verified | Stubble Estimator, Burning Risk, and Buyer Matching translated with English fallback. |
| **Buyer Dashboard & Listings** | ✅ Verified | Available Stubble metrics, price filters, and interest submission fully localized. |
| **Government Dashboard** | ✅ Verified | Regional surveillance cards, grid monitoring, and regulatory notices localized. |
| **Production Build** | ✅ Verified | Vite production build passes with 0 errors (`built in 9.02s`). |
