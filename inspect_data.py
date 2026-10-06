import os
import pandas as pd
import numpy as np

base_dir = r"c:\Users\hp\OneDrive\Desktop\Hackathon"
stubble_raw_file = os.path.join(base_dir, "data", "raw", "stubble", "crop_production_india.csv")
firms_raw_file = os.path.join(base_dir, "data", "raw", "burning_risk", "viirs-snpp_2023_India.csv")

print("="*60)
print("INSPECTING MODEL 1 RAW DATA: Crop Production India")
print("="*60)
df_crop = pd.read_csv(stubble_raw_file)
print(f"Shape: {df_crop.shape[0]} rows, {df_crop.shape[1]} columns")
print(f"Columns: {list(df_crop.columns)}")
print(f"Data types:\n{df_crop.dtypes}")
print(f"Missing values:\n{df_crop.isnull().sum()}")
print(f"Duplicates: {df_crop.duplicated().sum()}")
print(f"Unique states: {df_crop['State_Name'].nunique()} states")
print("Top states by record count:\n", df_crop['State_Name'].value_counts().head(10))

# Check Punjab and Haryana records
punjab_records = df_crop[df_crop['State_Name'].str.strip().str.lower() == 'punjab']
haryana_records = df_crop[df_crop['State_Name'].str.strip().str.lower() == 'haryana']
print(f"Punjab records: {len(punjab_records)}, Haryana records: {len(haryana_records)}")

# Check Rice records
rice_records = df_crop[df_crop['Crop'].str.strip().str.lower() == 'rice']
print(f"Total Rice records in India: {len(rice_records)}")
print(f"Rice records in Punjab: {len(punjab_records[punjab_records['Crop'].str.strip().str.lower() == 'rice'])}")
print(f"Rice records in Haryana: {len(haryana_records[haryana_records['Crop'].str.strip().str.lower() == 'rice'])}")

print("\n" + "="*60)
print("INSPECTING MODEL 3 RAW DATA: NASA FIRMS VIIRS 2023 India")
print("="*60)
df_firms = pd.read_csv(firms_raw_file)
print(f"Shape: {df_firms.shape[0]} rows, {df_firms.shape[1]} columns")
print(f"Columns: {list(df_firms.columns)}")
print(f"Data types:\n{df_firms.dtypes}")
print(f"Missing values:\n{df_firms.isnull().sum()}")
print(f"Date range: {df_firms['acq_date'].min()} to {df_firms['acq_date'].max()}")
print(f"Lat range: {df_firms['latitude'].min():.3f} to {df_firms['latitude'].max():.3f}")
print(f"Lon range: {df_firms['longitude'].min():.3f} to {df_firms['longitude'].max():.3f}")
print("Confidence counts:\n", df_firms['confidence'].value_counts())

# Filter to North-Western agrarian belt (Punjab/Haryana: Lat 28-33, Lon 73-78)
nw_fires = df_firms[
    (df_firms['latitude'] >= 28.0) & (df_firms['latitude'] <= 33.0) &
    (df_firms['longitude'] >= 73.0) & (df_firms['longitude'] <= 78.0)
]
print(f"Fires in North-Western agrarian belt (entire 2023): {len(nw_fires)}")

# Filter to Stubble burning window (Oct 1 to Nov 30)
nw_stubble_fires = nw_fires[
    (nw_fires['acq_date'] >= '2023-10-01') & (nw_fires['acq_date'] <= '2023-11-30')
]
print(f"Fires in NW agrarian belt during post-Kharif harvest window (Oct 1 - Nov 30, 2023): {len(nw_stubble_fires)}")
print(f"FRP stats in stubble window:\n{nw_stubble_fires['frp'].describe()}")
