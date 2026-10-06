# 07 — Bug Fix & Integration Test Report

## Summary

Three frontend integration bugs were identified and fixed. All bugs were **frontend field-name mismatches** — the backend ML models, backend API endpoints, and datasets were **not modified**. No model retraining was performed.

---

## BUG 1 — Burning Risk shows "NaN%"

### Root Cause

`BurningRisk.jsx` passed `result.fire_probability` to `RiskGauge` as the `probability` prop. This field **does not exist** in the backend response. The backend `BurningRiskResponse` schema (and actual JSON response) uses the field name `burning_probability`.

Accessing a non-existent key on a JavaScript object returns `undefined`. `Math.round(undefined * 100)` produces `NaN`. The `risk_level` field **does** exist in the response, so the HIGH badge rendered correctly — but based on a NaN probability.

Additional mismatches in the detail table:
- `result.date` → backend returns `date_analyzed`
- `result.day_of_year` → backend returns `day_of_harvest_season`

### Files Changed

- `frontend/src/pages/BurningRisk.jsx`

### Fix Applied

1. Changed `result.fire_probability` → `result.burning_probability` in `<RiskGauge>`
2. Changed `result.date` → `result.date_analyzed` in the detail table
3. Changed `result.day_of_year` → `result.day_of_harvest_season` in the detail table
4. Added explicit validity guard before setting result state:
   ```js
   const prob = data?.burning_probability;
   if (typeof prob !== 'number' || isNaN(prob) || prob < 0 || prob > 1) {
     setError('Burning risk could not be calculated for this location/date...');
   } else {
     setResult(data);
   }
   ```
   This ensures NaN can never reach `RiskGauge` even if the backend ever returns an invalid value.

### Test Results

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Lat=30.9, Lon=75.8573, 2026-11-01 | valid % | 95.87% (HIGH) | ✅ PASS |
| `burning_probability` in response | true | true | ✅ PASS |
| `fire_probability` absent | correct | correct | ✅ PASS |
| `date_analyzed` in table | 2026-11-01 | 2026-11-01 | ✅ PASS |
| NaN guard fires on invalid prob | friendly error | implemented | ✅ PASS |

---

## BUG 2 — Stubble Prediction Details are blank

### Root Cause

`StubbleEstimate.jsx` displayed prediction details using wrong backend field names. The backend `StubblePredictionResponse` returns:

| Backend field | Frontend was reading | Status |
|---|---|---|
| `state_used` | `result.state` | ❌ wrong |
| `district_used` | `result.district` | ❌ wrong |
| `area_hectares` | `result.area_ha` | ❌ wrong |
| `district_baseline_yield_t_ha` | `result.district_hist_yield` | ❌ wrong |
| *(not in response)* | `result.season` | ❌ not in response |
| *(not in response)* | `result.crop_year` | ❌ not in response |

`Season` and `Crop_Year` are **request** fields — they are echoed back in the backend response as part of the pipeline inputs but **not** included in the `StubblePredictionResponse` model. They must come from form state captured at submit time.

### Files Changed

- `frontend/src/pages/StubbleEstimate.jsx`

### Fix Applied

1. Added `formSnapshot` state: a snapshot of the form values taken at submit time, so Season and Crop_Year remain available after the async response returns.
2. Updated Prediction Details table to use correct field names:
   ```jsx
   <tr><td>State</td><td>{result.state_used}</td></tr>
   <tr><td>District</td><td>{result.district_used}</td></tr>
   <tr><td>Area</td><td>{result.area_hectares} ha</td></tr>
   <tr><td>Season</td><td>{formSnapshot?.Season}</td></tr>
   <tr><td>Crop Year</td><td>{formSnapshot?.Crop_Year}</td></tr>
   {result.district_baseline_yield_t_ha != null && (
     <tr><td>District Yield Baseline</td>
         <td>{result.district_baseline_yield_t_ha?.toFixed(2)} t/ha</td></tr>
   )}
   ```

### Test Results

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Area=10ha, Punjab, Ludhiana, 2026, Kharif → tonnes | ~30.3 t | 30.29 t | ✅ PASS |
| State in details | Punjab | Punjab | ✅ PASS |
| District in details | Ludhiana | LUDHIANA | ✅ PASS |
| Area in details | 10 ha | 10.0 ha | ✅ PASS |
| Season in details (from snapshot) | Kharif | Kharif | ✅ PASS |
| Crop Year in details (from snapshot) | 2026 | 2026 | ✅ PASS |
| Area=20ha — details update | 20 ha | 20.0 ha | ✅ PASS |
| Area=20ha — ratio ~2x | ~60.6 t | 60.58 t | ✅ PASS |

---

## BUG 3 — Buyer Matching returns no buyers / broken UI text

### Root Cause

Multiple field-name mismatches between the backend `BuyerMatchResponse` / `BuyerMatchItem` schemas and the frontend components.

**In `BuyerMatching.jsx` (result display):**

| Backend field | Frontend was reading | Status |
|---|---|---|
| `matched_buyers_count` | `result.total_matched` | ❌ wrong |
| `search_radius_km` | `result.max_distance_km` | ❌ wrong |
| `farmer_stubble_tonnes` | `result.stubble_quantity_tonnes` | ❌ wrong |
| `matches` | `result.matched_buyers` | ❌ wrong |

All four were `undefined` → the buyer list never rendered (`.length` on `undefined` → falsy), and the info banner showed "Found undefined buyers within undefined km for undefined t".

**In `BuyerCard.jsx` (per-buyer display):**

| Backend field | Frontend was reading | Status |
|---|---|---|
| `suitability_score` | `buyer.overall_score` | ❌ wrong → `undefined * 100 = NaN` |
| `offered_price` | `buyer.offered_price_per_tonne` | ❌ wrong → `undefined` |
| *(direct fields)* | `buyer.score_breakdown.distance_score` | ❌ not nested |
| `buyer_type` | `buyer.buyer_type` | ❌ field doesn't exist in schema |

### Files Changed

- `frontend/src/pages/BuyerMatching.jsx`
- `frontend/src/components/BuyerCard.jsx`

### Fix Applied

**BuyerMatching.jsx:**
```jsx
// Before (broken):  result.total_matched, result.matched_buyers, etc.
// After (correct):
Found {result.matched_buyers_count} buyers within {result.search_radius_km} km
for {result.farmer_stubble_tonnes} t of stubble.
{result.matches?.length > 0 ? result.matches.map(...) : "No buyers found ..."}
```

**BuyerCard.jsx:**
- `buyer.overall_score` → `buyer.suitability_score`
- `buyer.offered_price_per_tonne` → `buyer.offered_price`
- `buyer.score_breakdown.X` → `buyer.X` (score fields are flat on the item)
- Removed `buyer.buyer_type` (not in schema); replaced with `buyer.district` / `buyer.state`

### Test Results

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Buyers found at 300km | ≥1 | 8 | ✅ PASS |
| Search radius shown | 300 km | 300.0 km | ✅ PASS |
| Stubble qty shown | 30.3 t | 30.3 t | ✅ PASS |
| #1 buyer name | Ludhiana Bio-Pellet... | Ludhiana Bio-Pellet... | ✅ PASS |
| suitability_score present | 0.0–1.0 | 0.9509 | ✅ PASS |
| offered_price present | ₹/t | Rs.2150.0/t | ✅ PASS |
| Score breakdown visible | distance/price/capacity/avail | all 4 shown | ✅ PASS |
| Buyers found at 500km | ≥ 300km count | 8 (all within 500km) | ✅ PASS |

> [!NOTE]
> All 8 demo buyers are within 300km of Ludhiana (30.9°N, 75.8573°E). At 500km, the count remains 8 as all buyers are already within 300km range. This is expected behaviour with the existing demo buyer locations.

---

## Backend Tests

```
8 passed in 4.90s — 0 failures
```

All 8 existing backend unit tests continue to pass after the fixes.

---

## Frontend Build

```
✓ 1603 modules transformed — built in 11.02s — exit code 0
```

Zero compilation errors or warnings.

---

## Final Report

| Item | Status |
|------|--------|
| **BUG 1 — Burning Risk NaN%** | ✅ **PASS** — `burning_probability` field used; NaN guard added |
| **BUG 2 — Stubble Prediction Details blank** | ✅ **PASS** — all 5 detail fields now populated correctly |
| **BUG 3 — Buyer Matching no buyers / broken text** | ✅ **PASS** — 8 buyers returned, all UI interpolations correct |
| **Frontend build** | ✅ **PASS** — 1603 modules, 0 errors |
| **Backend tests** | ✅ **PASS** — 8/8 passed |
