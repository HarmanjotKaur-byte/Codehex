# Dataset and Preprocessing Documentation — ParaliPay

## 1. Dataset Sources

### 1.1 Model 1: Stubble Estimation
* **Primary Source**: Ministry of Agriculture & Farmers Welfare (MoA&FW) / Directorate of Economics and Statistics (DES), Government of India (accessed via [data.gov.in](https://data.gov.in) and official crop statistics archives).
* **Reference Agronomic Standards**: Indian Council of Agricultural Research (ICAR) & Ministry of New and Renewable Energy (MNRE) Biomass Resource Atlas of India.
* **Raw File**: `data/raw/stubble/crop_production_india.csv` (15.3 MB, 246,091 total records).

### 1.2 Model 3: Stubble Burning Risk
* **Primary Source**: NASA Earth Science Data and Information System (ESDIS) / LANCE / FIRMS (Fire Information for Resource Management System).
* **Sensor / Instrument**: Visible Infrared Imaging Radiometer Suite (VIIRS 375m) aboard Suomi-NPP.
* **Validation Baseline**: ICAR-IARI CREAMS (Consortium for Research on Agroecosystem Monitoring and Modelling from Space) Kharif crop residue monitoring bulletins.
* **Raw File**: `data/raw/burning_risk/viirs-snpp_2023_India.csv` (45.3 MB, 579,733 total records).

---

## 2. Dataset Descriptions

| Attribute | Model 1: Crop Production (Stubble) | Model 3: NASA FIRMS Active Fire (Burning Risk) |
| :--- | :--- | :--- |
| **Raw Observation Level** | District-level annual agricultural reporting | Satellite thermal pixel detection (375m ground footprint) |
| **Geographic Coverage** | Pan-India (filtered to Punjab, Haryana, UP, Rajasthan, Uttarakhand) | Pan-India (filtered to Lat 28.5°N–32.5°N, Lon 73.5°E–77.5°E) |
| **Temporal Coverage** | 1997–2015+ historical harvest seasons | Calendar Year 2023 (filtered to Oct 1 – Nov 30 harvest window) |
| **Raw File Size** | 15,316,741 bytes (246,091 rows × 7 cols) | 45,363,702 bytes (579,733 rows × 15 cols) |
| **Raw Missing Values** | 3,730 in `Production` (0 in remaining 6 columns) | 0 missing values across all 15 columns |
| **Raw Duplicates** | 0 duplicates | 0 duplicates |

---

## 3. Actual Columns Used & Selected Features

### 3.1 Model 1 (Stubble Quantity Estimation — Regression)
* **`State_Name`** (string/category): Administrative state (Punjab, Haryana, etc.), capturing state-level policy and irrigation infrastructure.
* **`District_Name`** (string/category): District name, capturing localized soil classification and agro-climatic zone.
* **`Crop_Year`** (integer): Harvest year, capturing technological/mechanization trends.
* **`Season`** (string/category): Agricultural season (`Kharif`, `Whole Year`).
* **`Crop`** (string): Filtered to `Rice` (paddy).
* **`Area`** (float): Cultivated land area in hectares ($ha$).
* **`district_median_yield_t_ha`** (float): Contextual baseline productivity for the district in metric tonnes per hectare.
* **`grain_yield_t_ha`** (float): Calculated yield ($\text{Production} / \text{Area}$).

### 3.2 Model 3 (Burning Risk — Binary Classification)
* **`grid_lat`** (float): Centroid latitude of $0.25^\circ \times 0.25^\circ$ spatial grid cell.
* **`grid_lon`** (float): Centroid longitude of $0.25^\circ \times 0.25^\circ$ spatial grid cell.
* **`day_of_year`** (integer): Calendar day of year (274 to 334).
* **`calendar_week`** (integer): ISO calendar week (weeks 39 to 48).
* **`day_of_harvest_season`** (integer): Day counter within harvest window (Day 1 = Oct 1, Day 61 = Nov 30).
* **`is_peak_harvest_window`** (binary): Indicator flag (1 if day is between Oct 20 and Nov 15; 0 otherwise).
* **`lag_fire_days_past_3d`** (integer): Number of days with active fire in this grid cell over the preceding 3 days ($t-3$ to $t-1$).
* **`lag_fire_days_past_7d`** (integer): Number of days with active fire in this grid cell over the preceding 7 days ($t-7$ to $t-1$).
* **`prior_cumulative_fires`** (integer): Cumulative burning events recorded in this grid cell from the start of the season up to day $t-1$.
* **`season_total_fires`** (integer): Historical baseline density of fire activity in this cell.

---

## 4. Target Definitions & Derivation Methodology

### 4.1 Model 1 Target: `stubble_quantity_tonnes`
* **Directly Measured or Derived?**: **Derived**. The official agricultural dataset records paddy grain production.
* **Agronomic Formula**:
  $$\text{Gross Straw (tonnes)} = \text{Paddy Production (tonnes)} \times \text{RPR}$$
  $$\text{Recoverable Stubble (tonnes)} = \text{Paddy Production (tonnes)} \times \text{RPR} \times \eta_{\text{recovery}}$$
* **Scientific Reference Parameters**:
  * **Residue-to-Product Ratio (RPR)**: Established by ICAR and MNRE for Indian semi-dwarf paddy cultivars as **$1.40$** (1.4 tonnes of straw per tonne of paddy grain).
  * **Baler Recovery Efficiency ($\eta_{\text{recovery}}$)**: Established in agricultural mechanization studies as **$0.80$** (80% of aboveground residue is collectible straw/stubble; 20% remains as deep stubble and root crowns below combine cutting height).
  * **Effective Target Multiplier**: $\text{Target} = \text{Production} \times 1.12$.
  * Both `gross_straw_tonnes` and `stubble_quantity_tonnes` are stored in the processed file.

### 4.2 Model 3 Target: `fire_event_occurred`
* **Target Type**: Binary classification label ($\{0, 1\}$).
* **Ground-Truth Construction**:
  * Positive instances ($Y = 1$): On calendar date $D$, one or more confirmed agricultural vegetation fire detections (`type == 0`) were registered by VIIRS within the $0.25^\circ \times 0.25^\circ$ cell.
  * Negative instances ($Y = 0$): On calendar date $D$, zero active fire detections were registered by VIIRS within the monitored agrarian cell.
* **No Artificial Negatives**: Negative examples are not randomly hallucinated; they are the genuine observed non-burning days across the active agricultural lattice in Punjab and Haryana.

---

## 5. Cleaning & Filtering Performed

### 5.1 Model 1 Cleaning
1. Filtered records to northern agrarian belt states: Punjab, Haryana, Uttar Pradesh, Rajasthan, Uttarakhand.
2. Filtered crop strictly to `Rice` (paddy) in `Kharif` or `Whole Year` seasons.
3. Removed records with missing or non-positive values for `Area` or `Production`.
4. Calculated grain yield ($\text{Production} / \text{Area}$).
5. Removed unrealistic data entry outliers ($\text{Yield} < 0.2\text{ t/ha}$ or $\text{Yield} > 8.0\text{ t/ha}$).
6. Computed district median baseline yield.

### 5.2 Model 3 Cleaning & Spatiotemporal Lattice
1. Filtered FIRMS data spatially to the North-Western agrarian belt: Lat $28.5^\circ\text{N}\text{--}32.5^\circ\text{N}$, Lon $73.5^\circ\text{E}\text{--}77.5^\circ\text{E}$.
2. Filtered temporally to the Kharif post-harvest window: October 1, 2023 to November 30, 2023 (61 days).
3. Filtered fire detection types strictly to `type == 0` (presumed vegetation fires), eliminating 168 static industrial heat sources (`type == 2`).
4. Gridded spatial coordinates into $0.25^\circ \times 0.25^\circ$ cells (approx. $25\text{ km} \times 25\text{ km}$).
5. Identified 156 active agricultural grid cells with historical crop fire activity ($\ge 5$ seasonal fires).
6. Formed a complete $156 \times 61 = 9,516$ row spatiotemporal daily lattice.
7. Constructed strictly backward-looking lag features (lag 3-day, lag 7-day, prior cumulative sum) shifted by 1 day to **completely eliminate data leakage**.

---

## 6. Record Counts & Data Quality Summary

| Metric | Model 1: Stubble Regression | Model 3: Burning Risk Classification |
| :--- | :--- | :--- |
| **Original Records** | 246,091 rows (Pan-India all crops) | 579,733 rows (Pan-India annual fires) |
| **Filtered Domain Records** | 2,931 rows (North India Rice) | 34,639 confirmed vegetation fires |
| **Final Clean Processed Records** | **2,412 rows** | **9,516 cell-days** |
| **Removed / Filtered Out** | 519 rows (non-Kharif, null production, outlier yields) | Non-agricultural cells / non-harvest dates |
| **Missing Values in Processed Data**| **0** | **0** |
| **Duplicate Rows in Processed Data**| **0** | **0** |
| **Target Distribution** | Continuous: Min 1.4 t, Mean 184,821 t, Max 1,768,480 t | Binary: Class 0 = 60.71%, Class 1 = 39.29% |

---

## 7. Important Limitations

1. **Model 1**: Stubble quantity is derived using empirical agronomic ratios (RPR = 1.40, recovery = 0.80) rather than physical load-cell weighbridge records for individual fields.
2. **Model 3**: Satellite thermal sensors cannot detect fires obscured by dense cloud cover or fires ignited and extinguished between satellite overpass times (typically 13:30 local time for Suomi-NPP VIIRS).
3. **Model 2**: Confirmed non-ML component. Buyer matching will rely on a transparent multi-criteria scoring algorithm due to the complete lack of public transaction records.

---

## 8. Reproducibility Notes

Both data pipelines are fully reproducible using the standalone Python scripts:
* `download_data.py`: Downloads the exact raw CSV files from their official URLs into `data/raw/`.
* `process_data.py`: Applies data cleaning, domain filtering, target derivation, and spatiotemporal feature engineering, saving clean datasets to `data/processed/`.
