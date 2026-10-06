import os
import pandas as pd
import numpy as np

base_dir = r"c:\Users\hp\OneDrive\Desktop\Hackathon"
stubble_raw_file = os.path.join(base_dir, "data", "raw", "stubble", "crop_production_india.csv")
firms_raw_file = os.path.join(base_dir, "data", "raw", "burning_risk", "viirs-snpp_2023_India.csv")

df_crop = pd.read_csv(stubble_raw_file)

# Inspect Rice in northern agricultural belt
target_states = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Rajasthan', 'Uttarakhand', 'Himachal Pradesh']
df_north_rice = df_crop[
    (df_crop['State_Name'].str.strip().isin(target_states)) &
    (df_crop['Crop'].str.strip().str.lower() == 'rice')
].copy()

print("North India Rice Records:")
print(f"Total rows: {len(df_north_rice)}")
print("By State:\n", df_north_rice['State_Name'].value_counts())
print("Missing Production:\n", df_north_rice['Production'].isnull().sum())
print("Seasons for Rice:\n", df_north_rice['Season'].value_counts())

# Filter to valid positive area and non-null production
df_valid_rice = df_north_rice[
    (df_north_rice['Area'] > 0) &
    (df_north_rice['Production'].notnull()) &
    (df_north_rice['Production'] > 0)
].copy()

df_valid_rice['Yield'] = df_valid_rice['Production'] / df_valid_rice['Area']
print("Yield Summary (tonnes/ha):")
print(df_valid_rice['Yield'].describe(percentiles=[0.01, 0.05, 0.5, 0.95, 0.99]))

# Check FIRMS details
df_firms = pd.read_csv(firms_raw_file)
nw_stubble_fires = df_firms[
    (df_firms['latitude'] >= 28.0) & (df_firms['latitude'] <= 33.0) &
    (df_firms['longitude'] >= 73.0) & (df_firms['longitude'] <= 78.0) &
    (df_firms['acq_date'] >= '2023-10-01') & (df_firms['acq_date'] <= '2023-11-30')
].copy()

print("\nFIRMS NW Stubble Fires (Oct-Nov 2023):")
print(f"Total detections: {len(nw_stubble_fires)}")
print("Type values (0=presumed vegetation fire, 1=active volcano, 2=other static land source, 3=offshore):\n", nw_stubble_fires['type'].value_counts())
print("Confidence values:\n", nw_stubble_fires['confidence'].value_counts())
print("Day/Night:\n", nw_stubble_fires['daynight'].value_counts())
print("Detections per day (first 5 and last 5):\n", nw_stubble_fires['acq_date'].value_counts().sort_index().iloc[[0, 1, 2, 3, 4, -5, -4, -3, -2, -1]])
