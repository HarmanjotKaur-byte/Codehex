import os
import pandas as pd
import numpy as np

base_dir = r"c:\Users\hp\OneDrive\Desktop\Hackathon"
raw_stubble_file = os.path.join(base_dir, "data", "raw", "stubble", "crop_production_india.csv")
raw_firms_file = os.path.join(base_dir, "data", "raw", "burning_risk", "viirs-snpp_2023_India.csv")

proc_stubble_dir = os.path.join(base_dir, "data", "processed", "stubble")
proc_firms_dir = os.path.join(base_dir, "data", "processed", "burning_risk")

# ==============================================================================
# PREPARE MODEL 1 DATA: Stubble Quantity Estimation
# ==============================================================================
print("Preparing Model 1 (Stubble) data...")
df_crop = pd.read_csv(raw_stubble_file)

# Focus on Kharif Rice in Northern agricultural belt (Punjab, Haryana, UP, Rajasthan, Uttarakhand)
target_states = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Rajasthan', 'Uttarakhand']
df_stubble = df_crop[
    (df_crop['State_Name'].str.strip().isin(target_states)) &
    (df_crop['Crop'].str.strip().str.lower() == 'rice') &
    (df_crop['Season'].str.strip().str.lower().isin(['kharif', 'whole year']))
].copy()

# Clean strings
df_stubble['State_Name'] = df_stubble['State_Name'].str.strip()
df_stubble['District_Name'] = df_stubble['District_Name'].str.strip()
df_stubble['Season'] = df_stubble['Season'].str.strip()
df_stubble['Crop'] = df_stubble['Crop'].str.strip()

# Quality filter: Remove nulls, non-positive area, non-positive production
df_stubble = df_stubble.dropna(subset=['Area', 'Production'])
df_stubble = df_stubble[(df_stubble['Area'] > 0) & (df_stubble['Production'] > 0)]

# Calculate Grain Yield (tonnes / hectare)
df_stubble['grain_yield_t_ha'] = df_stubble['Production'] / df_stubble['Area']

# Remove extreme unrealistic outliers (Yield < 0.2 t/ha or > 8.0 t/ha for paddy)
df_stubble = df_stubble[
    (df_stubble['grain_yield_t_ha'] >= 0.2) &
    (df_stubble['grain_yield_t_ha'] <= 8.0)
]

# Calculate District Historical Average Yield (as a contextual feature)
district_avg_yield = df_stubble.groupby('District_Name')['grain_yield_t_ha'].transform('median')
df_stubble['district_median_yield_t_ha'] = district_avg_yield.round(3)

# Derive Target: stubble_quantity_tonnes
# Documented ICAR / MNRE standard:
# Residue-to-Product Ratio (RPR) for Paddy = 1.40
# Collection / Baling Recoverable efficiency = 0.80 (80% harvestable straw, 20% root/base stubble)
# stubble_quantity_tonnes = Production * 1.40 * 0.80 = Production * 1.12
RPR = 1.40
RECOVERY_EFFICIENCY = 0.80
df_stubble['gross_straw_tonnes'] = (df_stubble['Production'] * RPR).round(2)
df_stubble['stubble_quantity_tonnes'] = (df_stubble['Production'] * RPR * RECOVERY_EFFICIENCY).round(2)
df_stubble['stubble_yield_t_ha'] = (df_stubble['grain_yield_t_ha'] * RPR * RECOVERY_EFFICIENCY).round(2)

# Select and rename final columns for ML
m1_columns = [
    'State_Name',
    'District_Name',
    'Crop_Year',
    'Season',
    'Crop',
    'Area',
    'Production',
    'grain_yield_t_ha',
    'district_median_yield_t_ha',
    'gross_straw_tonnes',
    'stubble_quantity_tonnes'
]
df_m1_processed = df_stubble[m1_columns].copy()

# Sort and reset index
df_m1_processed = df_m1_processed.sort_values(by=['State_Name', 'District_Name', 'Crop_Year']).reset_index(drop=True)
m1_out_path = os.path.join(proc_stubble_dir, "paddy_stubble_processed.csv")
df_m1_processed.to_csv(m1_out_path, index=False)
print(f"Model 1 processed dataset saved: {m1_out_path}")
print(f"Model 1 records: {len(df_m1_processed)} rows, {df_m1_processed.shape[1]} columns")

# ==============================================================================
# PREPARE MODEL 3 DATA: Stubble Burning Risk
# ==============================================================================
print("\nPreparing Model 3 (Burning Risk) data...")
df_firms = pd.read_csv(raw_firms_file)

# 1. Spatiotemporal filter: North-Western agrarian belt (Punjab, Haryana, Western UP)
lat_min, lat_max = 28.5, 32.5
lon_min, lon_max = 73.5, 77.5
date_start, date_end = '2023-10-01', '2023-11-30'

# Filter to vegetation fires (type == 0: vegetation fire)
df_fires_filtered = df_firms[
    (df_firms['latitude'] >= lat_min) & (df_firms['latitude'] <= lat_max) &
    (df_firms['longitude'] >= lon_min) & (df_firms['longitude'] <= lon_max) &
    (df_firms['acq_date'] >= date_start) & (df_firms['acq_date'] <= date_end) &
    (df_firms['type'] == 0)
].copy()

print(f"Total confirmed vegetation fire detections in domain: {len(df_fires_filtered)}")

# 2. Define spatial grid (0.25 deg x 0.25 deg, approx 25km x 25km)
grid_step = 0.25
df_fires_filtered['grid_lat'] = (np.floor((df_fires_filtered['latitude'] - lat_min) / grid_step) * grid_step + lat_min + grid_step / 2).round(3)
df_fires_filtered['grid_lon'] = (np.floor((df_fires_filtered['longitude'] - lon_min) / grid_step) * grid_step + lon_min + grid_step / 2).round(3)

# 3. Aggregate daily fire counts per grid cell
daily_fire_counts = df_fires_filtered.groupby(['grid_lat', 'grid_lon', 'acq_date']).size().reset_index(name='fire_count')

# Find active agricultural grid cells (cells with at least 5 fires across season)
active_cells = df_fires_filtered.groupby(['grid_lat', 'grid_lon']).size().reset_index(name='season_total_fires')
active_cells = active_cells[active_cells['season_total_fires'] >= 5]
print(f"Active agricultural grid cells in Punjab/Haryana: {len(active_cells)}")

# 4. Generate complete spatiotemporal lattice (Each active cell x all 61 days)
all_dates = pd.date_range(date_start, date_end).strftime('%Y-%m-%d').tolist()

lattice_rows = []
for _, cell in active_cells.iterrows():
    c_lat = cell['grid_lat']
    c_lon = cell['grid_lon']
    s_tot = cell['season_total_fires']
    for d in all_dates:
        lattice_rows.append({
            'grid_lat': c_lat,
            'grid_lon': c_lon,
            'acq_date': d,
            'season_total_fires': s_tot
        })

spatiotemporal_df = pd.DataFrame(lattice_rows)

# Merge real fire counts (left join; missing dates = 0 fires)
spatiotemporal_df = spatiotemporal_df.merge(daily_fire_counts, on=['grid_lat', 'grid_lon', 'acq_date'], how='left')
spatiotemporal_df['fire_count'] = spatiotemporal_df['fire_count'].fillna(0).astype(int)

# Create Target: fire_event_occurred (Binary: 0 or 1)
spatiotemporal_df['fire_event_occurred'] = (spatiotemporal_df['fire_count'] > 0).astype(int)

# 5. Safe Feature Engineering (NO DATA LEAKAGE)
spatiotemporal_df['acq_date_dt'] = pd.to_datetime(spatiotemporal_df['acq_date'])
spatiotemporal_df = spatiotemporal_df.sort_values(by=['grid_lat', 'grid_lon', 'acq_date_dt']).reset_index(drop=True)

spatiotemporal_df['day_of_year'] = spatiotemporal_df['acq_date_dt'].dt.dayofyear
spatiotemporal_df['calendar_week'] = spatiotemporal_df['acq_date_dt'].dt.isocalendar().week.astype(int)
spatiotemporal_df['day_of_harvest_season'] = (spatiotemporal_df['acq_date_dt'] - pd.to_datetime(date_start)).dt.days + 1

# Peak burning window in Punjab/Haryana: October 20 to November 15 (Days 20 to 46 of season)
spatiotemporal_df['is_peak_harvest_window'] = (
    (spatiotemporal_df['day_of_harvest_season'] >= 20) &
    (spatiotemporal_df['day_of_harvest_season'] <= 46)
).astype(int)

# Calculate strictly past lags per grid cell without groupby.apply index issues
# We iterate by cell or use shift within group
spatiotemporal_df['prior_fire_day'] = spatiotemporal_df.groupby(['grid_lat', 'grid_lon'])['fire_event_occurred'].shift(1).fillna(0).astype(int)
spatiotemporal_df['lag_fire_days_past_3d'] = spatiotemporal_df.groupby(['grid_lat', 'grid_lon'])['prior_fire_day'].transform(lambda s: s.rolling(3, min_periods=1).sum()).astype(int)
spatiotemporal_df['lag_fire_days_past_7d'] = spatiotemporal_df.groupby(['grid_lat', 'grid_lon'])['prior_fire_day'].transform(lambda s: s.rolling(7, min_periods=1).sum()).astype(int)
spatiotemporal_df['prior_cumulative_fires'] = spatiotemporal_df.groupby(['grid_lat', 'grid_lon'])['prior_fire_day'].cumsum().astype(int)

# Reorder columns
m3_columns = [
    'grid_lat',
    'grid_lon',
    'acq_date',
    'day_of_year',
    'calendar_week',
    'day_of_harvest_season',
    'is_peak_harvest_window',
    'lag_fire_days_past_3d',
    'lag_fire_days_past_7d',
    'prior_cumulative_fires',
    'season_total_fires',
    'fire_count',
    'fire_event_occurred'
]
df_m3_processed = spatiotemporal_df[m3_columns].copy()

m3_out_path = os.path.join(proc_firms_dir, "burning_risk_spatiotemporal_processed.csv")
df_m3_processed.to_csv(m3_out_path, index=False)
print(f"Model 3 processed dataset saved: {m3_out_path}")
print(f"Model 3 records: {len(df_m3_processed)} rows, {df_m3_processed.shape[1]} columns")
print(f"Class distribution for fire_event_occurred:\n{df_m3_processed['fire_event_occurred'].value_counts(normalize=True)}")
print("\nSample records:")
print(df_m3_processed.head(5))
