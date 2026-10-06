# 06 — Frontend & Demo Guide

## Overview

The ParaliPay frontend is a React + Vite single-page application that demonstrates
the complete stubble management workflow in a hackathon-ready interface.

## Technology Stack

| Component  | Choice           | Reason                                   |
|------------|------------------|------------------------------------------|
| Framework  | React 18         | Component model, hooks, fast iteration   |
| Bundler    | Vite 5           | Instant HMR, fast builds                 |
| Icons      | lucide-react     | Lightweight, consistent SVG icons        |
| Styling    | Plain CSS        | Zero config, full control, fast load     |
| API        | fetch (native)   | No axios dependency needed               |

## Directory Structure

```
frontend/
├── .env                     # VITE_API_BASE_URL=http://localhost:8000
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx             # ReactDOM entry point
    ├── App.jsx              # Root + shared state + tab routing
    ├── services/
    │   └── api.js           # predictStubble, predictRisk, matchBuyers, getHealth
    ├── components/
    │   ├── Header.jsx       # Logo + live backend status indicator
    │   ├── NavBar.jsx       # Tab navigation (Dashboard / Stubble / Risk / Buyers)
    │   ├── LoadingSpinner.jsx
    │   ├── ErrorMessage.jsx  # Human-readable errors only — no stack traces
    │   ├── RiskGauge.jsx    # Colour-coded LOW / MEDIUM / HIGH display
    │   └── BuyerCard.jsx    # Ranked buyer with score breakdown
    ├── pages/
    │   ├── Dashboard.jsx    # Hero, How it works, Model transparency table
    │   ├── StubbleEstimate.jsx
    │   ├── BurningRisk.jsx
    │   └── BuyerMatching.jsx
    └── styles/
        └── index.css        # Full CSS, green agricultural theme
```

## Running the Frontend

### Prerequisites
- Node.js ≥ 18
- Backend running on port 8000 (`uvicorn backend.main:app --reload`)

### Start Dev Server

```bash
cd frontend
npm install   # first time only
npm run dev   # starts on http://localhost:3000
```

### Build for Production

```bash
npm run build   # outputs to frontend/dist/
npm run preview # preview production build locally
```

## Shared State Pattern

`App.jsx` manages two pieces of shared state:

```
StubbleEstimate ──────────────────────────────┐
    produces: stubbleResult { tonnes, state }  │
                                               ▼
                                        BuyerMatching (auto-fill qty)

BurningRisk ──────────────────────────────────┐
    saves: farmerLat, farmerLon               │
                                               ▼
                                        BuyerMatching (auto-fill coords)
```

The farmer only enters their location once. Both Burning Risk and Buyer Matching consume it.

## API Integration

All API calls go through `src/services/api.js`. The single config point is:

```
VITE_API_BASE_URL=http://localhost:8000
```

| Function          | Method | Endpoint                |
|-------------------|--------|-------------------------|
| `getHealth()`     | GET    | `/api/health`           |
| `predictStubble()`| POST   | `/api/stubble/predict`  |
| `predictRisk()`   | POST   | `/api/risk/predict`     |
| `matchBuyers()`   | POST   | `/api/buyers/match`     |
| `getBuyers()`     | GET    | `/api/buyers`           |

## Loading & Error States

| Page           | Loading message             |
|----------------|-----------------------------|
| Stubble        | "Estimating stubble…"       |
| Burning Risk   | "Analyzing burning risk…"   |
| Buyer Matching | "Finding suitable buyers…"  |

Errors are displayed as user-readable strings. Python tracebacks are never shown.

## Model Transparency on Dashboard

The Dashboard shows **real metrics** from `models/*/metadata.json`:

| Model     | Algorithm             | Key Metric          |
|-----------|-----------------------|---------------------|
| Model 1   | Random Forest Regressor | R² = 0.9772       |
| Model 3   | Random Forest Classifier | ROC-AUC = 0.8612 |
| Model 2   | Rule-based scoring (NOT ML) | — |

The scoring formula for Model 2 is explicitly shown:
Distance 35% · Price 35% · Capacity 20% · Availability 10%

## Demo Walkthrough (10-second pitch)

1. **Dashboard** — See the three capabilities and model performance at a glance
2. **Stubble Estimate** — Enter area=5 ha, Punjab, Ludhiana, 2024, Kharif → get tonnes
3. **Burning Risk** — Use default Ludhiana coords, Nov 1 → see risk probability
4. **Find Buyers** — Qty auto-filled, coords auto-filled → click Find Buyers → ranked list

Total demo time: ~60 seconds end-to-end.
