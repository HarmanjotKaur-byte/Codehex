# ParaliPay — Backend API Specification

## 1. Overview & Architecture

The **ParaliPay Backend** is a lightweight, high-performance REST API built with **FastAPI** and **Python 3.12**. It serves as the production-ready inference layer connecting the trained machine learning models and business logic to frontend client applications:

1. **Model 1 (`POST /api/stubble/predict`)**: ML Regression predicting available crop residue (tonnes) using a trained `RandomForestRegressor`.
2. **Model 3 (`POST /api/risk/predict`)**: ML Classification predicting stubble fire probability and operational risk tiers using a trained `RandomForestClassifier`.
3. **Model 2 (`POST /api/buyers/match`)**: Multi-Criteria Transparent Scoring Engine ranking biomass buyers by distance, price, capacity, and availability (confirmed Non-ML).
4. **Health Check (`GET /api/health`)**: System readiness and model status verification.
5. **Buyers Directory (`GET /api/buyers`)**: Listing active demo regional biomass aggregators and bio-energy plants.

All models are loaded into memory **once** on application startup using FastAPI's `lifespan` handler to ensure sub-millisecond API response times.

---

## 2. How to Start the Backend

Ensure dependencies are installed:
```bash
pip install fastapi uvicorn scikit-learn joblib pandas numpy
```

From the project root:
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
Or directly from the `backend/` directory:
```bash
cd backend
python main.py
```

* Interactive OpenAPI Documentation (Swagger UI): `http://127.0.0.1:8000/docs`
* Raw OpenAPI Schema: `http://127.0.0.1:8000/openapi.json`

---

## 3. API Endpoints

### 3.1 Health Check

* **Endpoint**: `GET /api/health`
* **Purpose**: Verify backend status and confirm ML models are loaded in memory.
* **Example Response**:
```json
{
  "status": "ok",
  "models_loaded": true,
  "models": {
    "model_1_stubble": {
      "type": "RandomForestRegressor",
      "status": "ready"
    },
    "model_3_burning_risk": {
      "type": "RandomForestClassifier",
      "status": "ready"
    },
    "model_2_buyer_matching": {
      "type": "Transparent Weighted Multi-Criteria Scoring (Non-ML)",
      "status": "ready"
    }
  }
}
```

---

### 3.2 Stubble Quantity Estimation (Model 1)

* **Endpoint**: `POST /api/stubble/predict`
* **Underlying Model**: Serialized `RandomForestRegressor` pipeline (`models/stubble_model/model.pkl`).
* **Audit Compliance**: Completely excludes target-leaking variables (`Production`, `gross_straw_tonnes`, `grain_yield_t_ha`).
* **Example Request**:
```json
{
  "Area": 3.5,
  "State_Name": "Punjab",
  "District_Name": "Ludhiana",
  "Crop_Year": 2024,
  "Season": "Kharif"
}
```
* **Field Specifications**:
  * `Area` (*float, required, > 0*): Parcel size in hectares ($ha$).
  * `State_Name` (*string, default "Punjab"*): State name.
  * `District_Name` (*string, required*): District name.
  * `Crop_Year` (*integer, optional, default 2024*): Harvest year.
  * `Season` (*string, optional, default "Kharif"*): Crop season.
  * `district_hist_yield` (*float, optional*): Historical baseline yield. Looked up automatically from the training baseline (e.g. 3.92 t/ha for Ludhiana) if omitted.
* **Example Response**:
```json
{
  "predicted_stubble_tonnes": 10.6,
  "predicted_gross_straw_tonnes": 13.25,
  "area_hectares": 3.5,
  "state_used": "Punjab",
  "district_used": "LUDHIANA",
  "district_baseline_yield_t_ha": 3.918,
  "model_version": "RandomForestRegressor"
}
```

---

### 3.3 Stubble Burning Risk Prediction (Model 3)

* **Endpoint**: `POST /api/risk/predict`
* **Underlying Model**: Serialized `RandomForestClassifier` (`models/burning_risk_model/model.pkl`).
* **Audit Compliance**: Excludes all future temporal leakage (`season_total_fires`) and post-ignition telemetry (`frp`, `brightness`).
* **Example Request**:
```json
{
  "latitude": 30.9010,
  "longitude": 75.8573,
  "date": "2024-10-28",
  "lag_fire_days_past_3d": 2,
  "lag_fire_days_past_7d": 5,
  "prior_cumulative_fires": 15
}
```
* **Field Specifications**:
  * `latitude` (*float, required*): Decimal latitude (North India domain: 20°N–38°N).
  * `longitude` (*float, required*): Decimal longitude (70°E–85°E).
  * `date` (*string, optional, format YYYY-MM-DD*): Prediction date.
  * `lag_fire_days_past_3d` (*integer, optional, default 1*): Observed fire occurrences in past 3 days ($t-3$ to $t-1$).
  * `lag_fire_days_past_7d` (*integer, optional, default 2*): Observed fire occurrences in past 7 days ($t-7$ to $t-1$).
  * `prior_cumulative_fires` (*integer, optional, default 5*): Cumulative seasonal fires up to day $t-1$.
* **Example Response**:
```json
{
  "burning_probability": 0.9124,
  "risk_level": "HIGH",
  "latitude": 30.901,
  "longitude": 75.8573,
  "grid_lat": 30.875,
  "grid_lon": 75.875,
  "date_analyzed": "2024-10-28",
  "day_of_harvest_season": 28,
  "is_peak_harvest_window": true,
  "thresholds": {
    "LOW": "probability < 0.33",
    "MEDIUM": "0.33 <= probability <= 0.66",
    "HIGH": "probability > 0.66"
  },
  "presentation_note": "Risk categories are operational presentation tiers based on decision thresholds, not calibrated scientific absolutes."
}
```

---

### 3.4 Smart Buyer Matching (Model 2 — Multi-Criteria Scoring)

* **Endpoint**: `POST /api/buyers/match`
* **Underlying Logic**: Deterministic, transparent multi-criteria ranking algorithm (Non-ML).
* **Example Request**:
```json
{
  "stubble_quantity": 10.6,
  "farmer_latitude": 30.9010,
  "farmer_longitude": 75.8573,
  "max_distance_km": 100.0
}
```
* **Scoring Methodology**:
  1. **Haversine Distance ($d$ in km)**:
     $$S_{\text{dist}} = \max\left(0, 1 - \frac{d}{\text{max\_distance\_km}}\right)$$
  2. **Price Score ($S_{\text{price}}$)**:
     $$S_{\text{price}} = \min\left(1, \frac{\text{offered\_price}}{2500.0}\right)$$
  3. **Capacity Score ($S_{\text{cap}}$)**:
     $$S_{\text{cap}} = \min\left(1, \frac{\text{capacity\_tonnes}}{\text{stubble\_quantity}}\right)$$
  4. **Availability Score ($S_{\text{avail}}$)**:
     $$S_{\text{avail}} = 1.0 \text{ if available else } 0.0$$
  5. **Composite Suitability Score**:
     $$\text{suitability\_score} = 0.35 \cdot S_{\text{dist}} + 0.35 \cdot S_{\text{price}} + 0.20 \cdot S_{\text{cap}} + 0.10 \cdot S_{\text{avail}}$$
* **Example Response**:
```json
{
  "algorithm_type": "Multi-Criteria Weighted Scoring (Transparent Non-ML)",
  "farmer_stubble_tonnes": 10.6,
  "search_radius_km": 100.0,
  "total_buyers_evaluated": 8,
  "matched_buyers_count": 5,
  "matches": [
    {
      "buyer_id": "BUYER-LDH-01",
      "buyer_name": "Ludhiana Bio-Pellet Manufacturing Ltd",
      "distance_km": 0.0,
      "offered_price": 2150.0,
      "capacity_tonnes": 500.0,
      "capacity_covered": true,
      "is_available": true,
      "contact_number": "+91 98765 43210",
      "district": "Ludhiana",
      "state": "Punjab",
      "distance_score": 1.0,
      "price_score": 0.86,
      "capacity_score": 1.0,
      "availability_score": 1.0,
      "suitability_score": 0.951
    },
    {
      "buyer_id": "BUYER-JLD-04",
      "buyer_name": "Jalandhar Eco-Straw Processing Mills",
      "distance_km": 54.38,
      "offered_price": 1950.0,
      "capacity_tonnes": 250.0,
      "capacity_covered": true,
      "is_available": true,
      "contact_number": "+91 98722 33445",
      "district": "Jalandhar",
      "state": "Punjab",
      "distance_score": 0.4562,
      "price_score": 0.78,
      "capacity_score": 1.0,
      "availability_score": 1.0,
      "suitability_score": 0.7327
    }
  ],
  "scoring_weights": {
    "distance_weight": 0.35,
    "price_weight": 0.35,
    "capacity_weight": 0.2,
    "availability_weight": 0.1
  }
}
```

---

### 3.5 Demo Buyers Directory

* **Endpoint**: `GET /api/buyers`
* **Purpose**: Retrieve the full list of active demo biomass buyers registered in the regional directory (`backend/data/demo_buyers.json`).

---

## 4. End-to-End Application Flows

### Flow 1: Farmer Stubble Listing & Instant Buyer Matching
```text
Farmer enters parcel area (3.5 ha) & location (Ludhiana)
                   ↓
POST /api/stubble/predict  → Returns predicted stubble (10.6 tonnes)
                   ↓
POST /api/buyers/match    → Scores local buyers and ranks by distance/price/capacity
                   ↓
Frontend displays top matched buyers with direct call/pickup details
```

### Flow 2: Proactive Burning Risk Alert
```text
District / Field coordinates submitted
                   ↓
POST /api/risk/predict
                   ↓
Random Forest Classifier calculates P(burn = 1) from seasonal momentum
                   ↓
Frontend renders Risk Gauge: LOW / MEDIUM / HIGH with intervention recommendation
```

---

## 5. Important Limitations

1. **Buyer Matching**: As strictly established in Prompt 1 and Prompt 2, buyer matching is non-ML. It evaluates realistic criteria but does not account for dynamic traffic conditions or unstated private contractor preferences.
2. **Presentation Risk Tiers**: The `LOW` ($< 0.33$), `MEDIUM` ($0.33\text{--}0.66$), and `HIGH` ($> 0.66$) classifications are operational presentation thresholds designed for decision support, not physical certainty.
3. **Demo Buyers**: Stored in `backend/data/demo_buyers.json` representing realistic industrial off-takers across Punjab and Haryana for prototype demonstration; not live commercial accounts.
