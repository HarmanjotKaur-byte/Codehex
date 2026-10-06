# 08 — Role-Based Frontend Architecture & Implementation

## 1. Overview & Architecture

The ParaliPay user interface has been restructured into **three dedicated role-based dashboards** accessed via a top-level **Demo Role Selection** screen:

1. **FARMER**: Residue prediction, burning risk forecasting, and regional biomass buyer matching.
2. **BUYER**: Sourcing discovery, parcel listings, transparent procurement preference scoring, and interest signaling.
3. **ADMIN / GOVERNMENT**: Geographic grid-level satellite burning surveillance, biomass diversion oversight, and ML model audits.

> [!NOTE]
> This is a hackathon prototype implementation. Real authentication, passwords, JWT, or database-backed access control were intentionally excluded. The interface features a prominent **"Switch Role"** button to allow instantaneous navigation between roles during live demonstrations.

---

## 2. Global Navigation & Role Selection

### Role Selection Landing Screen (`RoleSelector.jsx`)
- Title: **PARALIPAY — "Turn Crop Waste Into Value"**
- Three primary role entry cards:
  - **FARMER**: "Estimate your stubble, assess burning risk, and find buyers." → *Continue as Farmer*
  - **BUYER**: "Find available stubble and connect with farmers." → *Continue as Buyer*
  - **ADMIN / GOVERNMENT**: "Monitor stubble availability and regional burning risk." → *Continue as Admin*
- Clearly states: *"Hackathon Prototype — Select a role to explore the interactive workflow"*

### Persistent Header & Role Switching (`Header.jsx`)
- Displays current active role: `Role: Farmer`, `Role: Buyer`, or `Role: Admin / Government`
- Contains a clickable **"Switch Role"** button that resets state to the selection screen.
- Real-time backend connection status dot via `/api/health`.

---

## 3. Section Details

### A. Farmer Dashboard
Preserves the complete, validated ML and rule-based workflow from previous phases:
- **Dashboard**: High-level platform introduction, workflow pillars, and model transparency metrics.
- **Stubble Estimate**: Form taking Area, State, District, Crop Year, and Season; invokes `POST /api/stubble/predict` (Model 1 Random Forest Regressor).
- **Burning Risk**: Form taking Latitude, Longitude, and Date; invokes `POST /api/risk/predict` (Model 3 Random Forest Classifier) with real NASA FIRMS VIIRS lag features.
- **Find Buyers**: Rule-based multi-criteria buyer matching invoking `POST /api/buyers/match` with auto-filled coordinates and stubble volume.

### B. Buyer Dashboard (`pages/buyer/*`)
- **Buyer Dashboard (`BuyerDashboard.jsx`)**: 
  - Summary metrics: *Total Available Stubble (290.5 t)*, *Nearby Farmer Listings (6)*, *Average Asking Price (₹2,110/t)*, and *Registered Aggregators (8 from `/api/buyers`)*.
  - Transparent supply chain workflow explanation.
- **Available Stubble (`AvailableStubble.jsx`)**:
  - Filterable directory of demo agricultural stubble listings (`DEMO_MARKETPLACE_LISTINGS` from Punjab/Haryana).
  - Dynamic filters: Maximum Distance (km), Minimum Stubble (tonnes), Maximum Asking Price (₹/tonne), Availability filter.
  - **"View Details"** modal with farmer contacts, coordinates, and volume.
  - **"Express Interest"** interactive button with confirmation feedback (`Interest recorded for listing LIST-XXX in this demo`).
- **Buyer Preferences (`BuyerPreferences.jsx`)**:
  - Configure procurement hub (Ludhiana, Patiala, Bathinda, Karnal), radius, batch size, and price ceiling.
  - Dynamically recalculates listing rankings using the **transparent rule-based scoring formula**:
    - Distance (35%), Price (35%), Volume Capacity (20%), Availability (10%).

### C. Admin / Government Dashboard (`pages/admin/*`)
- **Admin Overview (`AdminDashboard.jsx`)**:
  - Real summary metrics combining live backend statuses and tracked regional inventories.
  - Regulatory intervention framework linking satellite detection with market diversion.
- **Burning Risk Monitoring (`BurningRiskMonitoring.jsx`)**:
  - Explicit definition displayed: *"The model predicts the probability of observing stubble-burning activity in a geographic grid cell (0.25° × 0.25°) on a given date. It does NOT predict individual farmer behavior."*
  - Interactive grid assessment tool invoking live `POST /api/risk/predict` with lattice metrics, date analysis, and historical fire source auditing.
- **Stubble Availability (`StubbleAvailability.jsx`)**:
  - District-filtered breakdown of tracked crop residue parcels across Punjab and Haryana.
- **Model Information (`ModelInformation.jsx`)**:
  - Complete scientific documentation of:
    - **Model 1**: Random Forest Regressor, R² = 0.9772, with explicit regional dataset limitation disclaimer.
    - **Model 2**: Rule-based scoring engine (strictly non-ML) with weight transparency (35% Dist, 35% Price, 20% Cap, 10% Avail).
    - **Model 3**: Random Forest Classifier, ROC-AUC = 0.8612, Accuracy = 78.74%, Recall = 77.14%, Precision = 72.02%, F1 = 74.49%.

---

## 4. API & Data Integrity Audit

- **Centralized API Calls**: All backend communication routes strictly through `src/services/api.js`.
- **Zero Synthetic ML Data**: No synthetic records or invented labels were added.
- **Demo Marketplace Tagging**: Commercial listings for buyer/admin views are sourced from regional agricultural clusters and explicitly flagged as *Demo Marketplace Listings*.
- **No Hardcoded Predictions**: All ML regression values, classification probabilities, and aggregator scoring are computed live by the backend engine.

---

## 5. Test & Validation Results

### Backend Test Suite
```powershell
python -m pytest test_backend.py -v
======================= 8 passed, 703 warnings in 3.98s =======================
```

### Integration End-to-End Verification (`test_bug_fixes.py`)
```powershell
python test_bug_fixes.py
==================================================
ALL 5 INTEGRATION TESTS: PASS
  Stubble 10ha  : 30.29 t
  Stubble 20ha  : 60.58 t
  Burning Risk  : 95.87% (HIGH)
  Buyers 300km  : 8 buyers found
  Buyers 500km  : 8 buyers found
```

### Frontend Build
```powershell
npm run build
✓ 1612 modules transformed.
✓ built in 9.62s — zero errors.
```
