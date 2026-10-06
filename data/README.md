# ParaliPay Data Repository

This directory contains the authentic real-world datasets used in the ParaliPay machine learning system.

## Directory Structure

```text
data/
├── raw/
│   ├── stubble/
│   │   └── crop_production_india.csv        # Official MoA&FW/DES Crop Production Data (15.3 MB, 246,091 records)
│   └── burning_risk/
│       ├── viirs-snpp_2023_India.csv        # Official NASA FIRMS VIIRS 375m 2023 Active Fire Archive (45.3 MB, 579,733 records)
│       └── SUOMI_VIIRS_C2_South_Asia_7d.csv # NASA FIRMS 7-Day Live Active Fire Stream (490 KB)
│
├── processed/
│   ├── stubble/
│   │   └── paddy_stubble_processed.csv      # Cleaned Kharif rice records for North India with ICAR stubble targets (2,412 rows)
│   └── burning_risk/
│       └── burning_risk_spatiotemporal_processed.csv # 0.25° grid spatiotemporal daily lattice for Punjab/Haryana (9,516 rows)
└── README.md
```

## Raw Dataset Provenance

### 1. Crop Production in India (Model 1)
* **Source**: Directorate of Economics and Statistics (DES), Ministry of Agriculture & Farmers Welfare, Government of India.
* **Access Date**: October 2026.
* **Coverage**: Pan-India agricultural statistics from 1997 to 2015+.
* **Usage**: Provides official district-wise paddy area, grain production, and yield figures.

### 2. NASA FIRMS VIIRS 375m Active Fire Detections (Model 3)
* **Source**: NASA Earth Science Data and Information System (ESDIS) / LANCE / FIRMS (Fire Information for Resource Management System).
* **Access Date**: October 2026.
* **Coverage**: India (Lat 8.0°N to 35.1°N, Lon 68.5°E to 97.2°E), daily observations for the year 2023.
* **Usage**: Provides satellite thermal detections of crop residue fires in Punjab and Haryana during the October–November harvest season.

## Processed Datasets

* `data/processed/stubble/paddy_stubble_processed.csv`: Cleaned regression dataset for paddy stubble quantity prediction in North India. Stubble target derived via ICAR/MNRE standard Residue-to-Product Ratio (RPR = 1.40, recovery efficiency = 0.80).
* `data/processed/burning_risk/burning_risk_spatiotemporal_processed.csv`: Spatiotemporal binary classification dataset tracking daily agricultural fire occurrences across 156 agrarian grid cells in Punjab/Haryana without data leakage.
