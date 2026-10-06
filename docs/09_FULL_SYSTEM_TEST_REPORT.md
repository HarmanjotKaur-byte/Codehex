# 09 — Full System Test Report & Demo Audit

## Executive Summary

A comprehensive end-to-end audit was conducted across the entire ParaliPay platform covering backend health, all three role sections (Farmer, Buyer, Admin/Government), role switching, data contracts, input validation, and production build readiness. 

**Result: All core workflows and regression tests PASSED.**

---

## 1. Backend Health & Core Endpoints

| Test | Expected | Actual | Status |
| :--- | :--- | :--- | :--- |
| `GET /api/health` | HTTP 200, status "ok", models loaded | HTTP 200, `status: "ok"`, `models_loaded: true` | **PASS** |
| Model 1 status | `status: "ready"` | `status: "ready"` | **PASS** |
| Model 3 status | `status: "ready"` | `status: "ready"` | **PASS** |
| Model 2 status | `status: "ready"` | `status: "ready"` | **PASS** |
| Demo Buyers Directory (`GET /api/buyers`) | List of 8 regional aggregators | 8 active regional buyers returned | **PASS** |

---

## 2. Farmer End-to-End Workflow Testing

### Step 1 — Stubble Quantity Estimation (10 ha)
- **Input**: Area = 10 ha, State = Punjab, District = Ludhiana, Crop Year = 2026, Season = Kharif
- **Expected**: ~30.3 tonnes, populated prediction details
- **Actual**: `predicted_stubble_tonnes: 30.29`, `state_used: "Punjab"`, `district_used: "LUDHIANA"`, `area_hectares: 10.0`, `district_baseline_yield_t_ha: 4.322`
- **Status**: **PASS**

### Step 2 — Change Area (20 ha)
- **Input**: Area = 20 ha, State = Punjab, District = Ludhiana, Crop Year = 2026, Season = Kharif
- **Expected**: ~60.6 tonnes, details update to 20 ha
- **Actual**: `predicted_stubble_tonnes: 60.58`, `area_hectares: 20.0` (Ratio 2.0x vs 10 ha)
- **Status**: **PASS**

### Step 3 — Burning Risk Prediction
- **Input**: Latitude = 30.9000, Longitude = 75.8573, Date = 2026-11-01
- **Expected**: Valid probability between 0 and 1, percentage formatting, valid risk level, zero NaN
- **Actual**: `burning_probability: 0.9587` (formatted as `95.87%`), `risk_level: "HIGH"`, snapped to grid cell `30.875°N, 75.875°E`
- **Status**: **PASS**

### Step 4 — Smart Buyer Matching
- **Input**: Stubble = 30.3 t, Latitude = 30.9000, Longitude = 75.8573, Max Dist = 300 km & 500 km
- **Expected**: Dynamic display, ranked buyers, correct variables, no fake records
- **Actual**:
  - At 300 km: 8 buyers matched, Top: Ludhiana Bio-Pellet Manufacturing Ltd (Dist: 0.11 km, Score: 0.9509)
  - At 500 km: 8 buyers matched (all regional buyers within domain)
  - Text interpolation: *"Found 8 buyers within 300 km for 30.3 t of stubble."*
- **Status**: **PASS**

---

## 3. Buyer End-to-End Workflow Testing

| Sub-Test | Expected | Actual | Status |
| :--- | :--- | :--- | :--- |
| **Buyer Dashboard Cards** | 4 summary cards: Available Stubble, Nearby Listings, Average Asking Price, Suitable Listings | Correctly rendered: 290.5 t, 6 listings, ₹2,110/t average, 5 suitable active listings | **PASS** |
| **Available Stubble Directory** | Table of demo listings with distance relative to Ludhiana hub | Table loaded with all 6 regional listings with exact distances and statuses | **PASS** |
| **Interactive Filters** | Changing distance, min quantity, max price, or availability filters results | Tested: Filtering updates results dynamically. Empty state properly displays when criteria match 0 listings | **PASS** |
| **View Details Modal** | Detailed parcel breakdown without null/undefined fields | Displays farmer contact, coordinates, crop year, and asking price cleanly | **PASS** |
| **Express Interest** | Safe confirmation message without transaction/payment | Displays *"Interest recorded for listing LIST-XXX in this demo."* without backend crash | **PASS** |
| **Buyer Preferences** | Configurable procurement criteria with rule-based ranking | Evaluates Distance (35%), Price (35%), Capacity (20%), Availability (10%) and renders ranked cards | **PASS** |

---

## 4. Admin / Government End-to-End Workflow Testing

| Sub-Test | Expected | Actual | Status |
| :--- | :--- | :--- | :--- |
| **Admin Overview** | Summary metrics without fabricated statistics | Shows Total Stubble (290.5 t), High-Risk Areas (Active Grid), Farmers Using Platform ("Data not available"), Buyer Activity (8 Registered) | **PASS** |
| **Grid Burning Risk Definition** | Explicitly defines grid-level probability, NOT individual farmer tracking | Displays: *"The model predicts the probability of observing stubble-burning activity in a geographic grid cell (0.25° × 0.25°) on a given date. It does NOT predict individual farmer behavior."* | **PASS** |
| **Risk Query Execution** | Live query calling `POST /api/risk/predict` | Returns 95.87% HIGH risk, Day 32 of harvest season, real NASA FIRMS lattice audit trail | **PASS** |
| **Stubble Availability** | District-filtered regional crop residue volumes | Filterable by district (Ludhiana, Patiala, Karnal, etc.) with empty state fallback | **PASS** |
| **Model Information** | Accurate documentation of Model 1, 2, and 3 | Displays exact verified metrics: Model 1 ($R^2=0.9772$), Model 2 (Rule-Based 35/35/20/10), Model 3 ($\text{ROC-AUC}=0.8612$, Acc 78.74%, Rec 77.14%, Prec 72.02%, F1 74.49%) with data limitation notes | **PASS** |

---

## 5. Role Switching Test

- **Navigation Flow Tested**:
  1. Role Selection Screen → Select **Farmer** → Farmer Dashboard
  2. Click **Switch Role** → Role Selection Screen
  3. Select **Buyer** → Buyer Dashboard
  4. Click **Switch Role** → Role Selection Screen
  5. Select **Admin** → Admin Overview
  6. Click **Switch Role** → Select **Farmer**
- **Result**: Zero crashes, active tab resets appropriately, shared states preserved for farmer flow, header role badge updates instantly.
- **Status**: **PASS**

---

## 6. API Contract Verification

- **Centralized Service**: All HTTP requests are channeled through `frontend/src/services/api.js`.
- **Response Field Alignment**:
  - `burning_probability` verified (eliminating prior NaN risk).
  - `state_used`, `district_used`, `area_hectares` verified.
  - `matched_buyers_count`, `search_radius_km`, `farmer_stubble_tonnes`, `matches` verified.
- **Status**: **PASS**

---

## 7. Input Validation & Error Handling

| Scenario | Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| Negative Area | Area = -10 ha | Frontend blocks / Backend 422 | Frontend blocks form submit (`min="0.01"`), Backend returns HTTP 422 | **PASS** |
| Out-of-bounds Lat | Lat = 15.0°N | Frontend error message / Backend 422 | Friendly UI message: *"Latitude must be between 28.5° and 32.5°"* | **PASS** |
| Negative Stubble | Qty = -5.0 t | Frontend error message / Backend 422 | Friendly UI message: *"Enter a valid stubble quantity greater than 0."* | **PASS** |
| Negative Distance | MaxDist = -50 km | Frontend error message / Backend 422 | Friendly UI message: *"Enter a valid maximum search distance greater than 0 km."* | **PASS** |

---

## 8. UI Quality & Build Testing

- **Broken Text Search**: No occurrences of `"NaN"`, `"undefined"`, or broken string interpolation (`"km for"`).
- **Vite Production Build**:
  ```powershell
  npm run build
  ✓ 1612 modules transformed.
  ✓ built in 10.38s — 0 errors.
  ```
- **Backend Test Suite**:
  ```powershell
  python -m pytest test_backend.py -v
  ======================= 8 passed in 8.71s =======================
  ```
- **Status**: **PASS**

---

## 9. Bugs Found & Fixed in this Audit

1. **Buyer Matching Input Validation Guard**:
   - *Bug Found*: In `BuyerMatching.jsx`, negative search distance was parsed without explicit greater-than-zero validation.
   - *Fix Applied*: Added `if (isNaN(maxDistF) || maxDistF <= 0)` check before API dispatch with user-friendly error message.
2. **Dashboard Card Label Consistency**:
   - *Bug Found*: Slight variation in summary card labels between prototype pages and prompt specification.
   - *Fix Applied*: Strictly aligned card labels in `BuyerDashboard.jsx` and `AdminDashboard.jsx`.

---

## 10. Known System Limitations

- **Demo Marketplace Scope**: Marketplace supply listings are based on 6 representative Punjab and Haryana clusters; transactions are recorded for demonstration only (no real payment escrow).
- **Grid Extrapolation**: Burning Risk Classifier is calibrated on spatial coordinates within Lat 28.5°–32.5°N and Lon 73.5°–77.5°E. Outside coordinates are rejected by validation guards.
- **District Scale Model 1**: Stubble regression model is trained on district historical medians; field parcels < 100 ha use scale ratio against regional baselines.

---

## Final Verification Summary

- **Backend Health**: **PASS**
- **Stubble ML**: **PASS**
- **Burning Risk ML**: **PASS**
- **Buyer Matching**: **PASS**
- **Farmer Section**: **PASS**
- **Buyer Section**: **PASS**
- **Admin/Government Section**: **PASS**
- **Role Switching**: **PASS**
- **Input Validation**: **PASS**
- **API Integration**: **PASS**
- **Frontend Build**: **PASS**
- **Backend Tests**: **PASS**
