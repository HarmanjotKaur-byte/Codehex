# ParaliPay — Model Training & Leakage Audit Report

## Executive Summary

This report documents the final data leakage audit, validation methodology, and training results for the machine learning models of the **ParaliPay** platform:
* **Model 1 (Stubble Quantity Estimation)**: Machine Learning Regression (`RandomForestRegressor`).
* **Model 2 (Smart Buyer Matching)**: Confirmed Non-ML Multi-Criteria Ranking Algorithm.
* **Model 3 (Stubble Burning Risk Prediction)**: Machine Learning Classification (`RandomForestClassifier`).

Both ML models were trained strictly on authentic, verified real-world datasets without synthetic records, fabricated labels, or target leakage.

---

## 1. Model 1: Stubble Quantity Estimation (Regression)

### 1.1 Dataset Provenance & Scope
* **Source**: Directorate of Economics & Statistics (DES), Ministry of Agriculture & Farmers Welfare, Government of India.
* **Scope**: Cleaned Kharif rice cultivation records for the Northern agricultural belt (Punjab, Haryana, Uttar Pradesh, Rajasthan, Uttarakhand).
* **Sample Size**: 2,412 clean agricultural observations.

### 1.2 Data Leakage Audit & Removed Features
* **Critical Vulnerability Identified**: 
  The target variable `stubble_quantity_tonnes` is agronomically derived from grain production ($\text{Production} \times 1.12$). In standard agricultural survey datasets:
  $$\text{grain\_yield\_t\_ha} = \frac{\text{Production}}{\text{Area}} \implies \text{Production} = \text{Area} \times \text{grain\_yield\_t\_ha}$$
  If `grain_yield_t_ha` was included as a feature alongside `Area`, the model would trivially multiply the two inputs and achieve an artificial $R^2 = 1.000$, resulting in severe target leakage.
* **Features Removed Due to Leakage**:
  1. `Production`: Directly leaks the target.
  2. `gross_straw_tonnes`: Direct mathematical scalar of the target.
  3. `grain_yield_t_ha`: Indirect target leakage through multiplication with `Area`.

### 1.3 Final Usable Pre-Prediction Features
Only operational parameters known to a farmer and platform prior to harvest were retained:
1. `Area` (*float*): Parcel cultivated area in hectares.
2. `State_Name` (*categorical*): Administrative state.
3. `District_Name` (*categorical*): Local administrative district.
4. `Crop_Year` (*integer*): Harvest year.
5. `Season` (*categorical*): Kharif / Whole Year.
6. `district_hist_yield` (*float*): Historical median yield of the district computed strictly from historical training years to prevent out-of-fold contamination.

### 1.4 Train / Test Split Methodology
* **Strategy**: Chronological Time Split.
* **Training Partition**: Years $\le 2011$ (2,049 rows, ~85% of data).
* **Test Partition**: Years $2012\text{--}2014$ (363 rows, ~15% of data).
* **Rationale**: Tests whether the model can generalize to future harvest seasons without temporal data snooping.

### 1.5 Algorithm & Architecture
* **Algorithm**: `RandomForestRegressor` (`n_estimators=100`, `max_depth=12`, `min_samples_split=5`, `random_state=42`).
* **Preprocessing**: `ColumnTransformer` with `OneHotEncoder(handle_unknown='ignore')` for categorical identifiers and passthrough for numerical inputs.

### 1.6 Empirical Evaluation Results (Unseen Test Set: 2012–2014)
* **Mean Absolute Error (MAE)**: **23,705.91 tonnes** (Relative Mean Absolute Percentage Error: ~11.8% on regional district scales).
* **Root Mean Squared Error (RMSE)**: **39,046.67 tonnes**.
* **Coefficient of Determination ($R^2$)**: **0.9772** (97.72% of regional stubble variance explained).

### 1.7 Feature Importance
| Feature Variable | Relative Importance (%) |
| :--- | :--- |
| `Area` | 91.38% |
| `district_hist_yield` | 6.22% |
| `District_Name` | 1.36% |
| `Crop_Year` | 0.71% |
| `State_Name` | 0.33% |
| `Season` | 0.00% |

### 1.8 Limitations
* Trained on district-level aggregated farm surveys rather than individual field load-cell weighbridge records. Field-level parcel predictions scale linearly with parcel acreage.

---

## 2. Model 3: Stubble Burning Risk Prediction (Classification)

### 2.1 Dataset Provenance & Scope
* **Source**: NASA FIRMS Suomi-NPP VIIRS 375m Active Fire Archive.
* **Scope**: Spatial lattice covering Punjab, Haryana, and Western UP ($0.25^\circ \times 0.25^\circ$ grid cells) across the 61-day Kharif post-harvest burning season (October 1 to November 30, 2023).
* **Sample Size**: 9,516 spatiotemporal cell-day observations (156 active agrarian cells $\times$ 61 calendar days).

### 2.2 Data Leakage Audit & Removed Features
* **Vulnerabilities Identified & Eliminated**:
  1. `season_total_fires`: Summed fires across the entire 61-day season for each grid cell. Using this on October 10 leaked fires occurring in November (future temporal leakage). **Removed**.
  2. `fire_count`: Count of active fires detected on day $t$. Directly defined the target (`fire_event_occurred = fire_count > 0`). **Removed**.
  3. Post-event satellite measurements (`frp`, `brightness`, `confidence`, `scan`, `track`): Only exist once a fire is already ignited. **Strictly excluded**.

### 2.3 Final Usable Pre-Prediction Features
All retained features are strictly known at or before prediction time $t-1$:
1. `grid_lat`: Centroid latitude.
2. `grid_lon`: Centroid longitude.
3. `day_of_year`: Calendar day of year (274 to 334).
4. `calendar_week`: ISO calendar week.
5. `day_of_harvest_season`: Day counter within harvest season (Day 1 to 61).
6. `is_peak_harvest_window`: Binary indicator for peak combine harvesting (Oct 20 – Nov 15).
7. `lag_fire_days_past_3d`: Number of burning days in this cell over days $t-3$ to $t-1$.
8. `lag_fire_days_past_7d`: Number of burning days in this cell over days $t-7$ to $t-1$.
9. `prior_cumulative_fires`: Cumulative burning days in this cell from season start up to day $t-1$.

### 2.4 Train / Test Split Comparison & Honest Scientific Findings

We evaluated two distinct evaluation split methodologies:

#### Methodology A: Forward Chronological Time Split
* **Train**: October 1 – November 10, 2023 (Days 1 to 41, 6,396 rows).
* **Test**: November 11 – November 30, 2023 (Days 42 to 61, 3,120 rows).
* **Results**:
  * Accuracy: 0.6006
  * Precision: 0.6250
  * Recall: **0.0040** (TP = 5, FN = 1243)
  * ROC-AUC: **0.4506**
* **Root-Cause Analysis**: Decision tree models split on numerical thresholds of features. In the training set, `day_of_year` ranged from 274 to 314. When evaluated on future unseen days ($> 314$), decision trees cannot extrapolate into unseen numerical ranges and assign samples to the terminal right-hand leaf (which had no fires in October). Forward time splits with raw monotonic calendar integers are inherently invalid for tree-based extrapolation.

#### Methodology B: Spatial Grid Holdout Split (Selected Primary Architecture)
* **Train**: 80% of active agricultural grid cells (125 cells, 7,625 cell-day rows).
* **Test**: 20% unseen active agricultural grid cells (31 cells, 1,891 cell-day rows).
* **Evaluation Focus**: Measures the model's ability to predict daily fire risk on **completely unseen agricultural land parcels** throughout the harvest window.
* **Results**:
  * **Accuracy**: **78.74%**
  * **Precision**: **72.02%**
  * **Recall**: **77.14%** (Identifies over 77% of real burning days)
  * **F1-Score**: **74.49%**
  * **ROC-AUC**: **0.8612** (Strong discriminative ability)
  * **Confusion Matrix**: True Negatives = 902, False Positives = 228, False Negatives = 174, True Positives = 587.

### 2.5 Feature Importance (Model 3)
| Feature Variable | Relative Importance (%) |
| :--- | :--- |
| `lag_fire_days_past_7d` | 23.94% |
| `lag_fire_days_past_3d` | 18.19% |
| `day_of_year` | 13.92% |
| `day_of_harvest_season` | 13.48% |
| `prior_cumulative_fires` | 10.99% |
| `grid_lon` | 7.67% |
| `grid_lat` | 7.00% |
| `calendar_week` | 3.67% |
| `is_peak_harvest_window` | 1.14% |

### 2.6 Limitations
* Active fire satellite data has revisit gaps (overpasses occur at ~13:30 local solar time); small fires burning outside this window or under dense cloud cover are unobserved.

---

## 3. Buyer Matching: Non-ML Technical Specification

Because no public real-world training dataset of farmer-buyer transactions exists, **Model 2 is confirmed as Non-ML**. It will be implemented in future phases as a transparent, multi-criteria scoring algorithm.

### Multi-Criteria Scoring Architecture

```text
Farmer Stubble Listing (Location, Quantity, Harvest Date)
                            +
Registered Buyer Pool (Location, Offered Price, Intake Capacity, Max Distance)
                            ↓
               Multi-Criteria Scoring Engine
                            ↓
  1. Distance Score:      S_dist  = max(0, 1 - (Haversine Distance / Max Radius))
  2. Price Score:         S_price = min(1, Buyer Offered Price / Benchmark MSP)
  3. Capacity Score:      S_cap   = min(1, Buyer Available Capacity / Farmer Quantity)
  4. Operational Score:   S_ops   = Binary Verification & Truck Availability
                            ↓
  Weighted Composite Match Score = 0.35 * S_dist + 0.35 * S_price + 0.20 * S_cap + 0.10 * S_ops
                            ↓
                    Ranked Buyer List
```

---

## 4. Final Model Artifacts Generated

```text
models/
├── stubble_model/
│   ├── model.pkl        (Trained scikit-learn Pipeline with OneHotEncoder + RandomForestRegressor)
│   └── metadata.json    (Hyperparameters, features, metrics, train/test rows, audit records)
│
└── burning_risk_model/
    ├── model.pkl        (Trained RandomForestClassifier with balanced class weights)
    └── metadata.json    (Hyperparameters, features, dual-split metrics, ROC-AUC, audit records)
```
