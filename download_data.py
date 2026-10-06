import os
import urllib.request
import pandas as pd
import numpy as np

def download_data():
    base_dir = r"c:\Users\hp\OneDrive\Desktop\Hackathon"
    raw_stubble_dir = os.path.join(base_dir, "data", "raw", "stubble")
    raw_fire_dir = os.path.join(base_dir, "data", "raw", "burning_risk")
    proc_stubble_dir = os.path.join(base_dir, "data", "processed", "stubble")
    proc_fire_dir = os.path.join(base_dir, "data", "processed", "burning_risk")
    docs_dir = os.path.join(base_dir, "docs")

    for d in [raw_stubble_dir, raw_fire_dir, proc_stubble_dir, proc_fire_dir, docs_dir]:
        os.makedirs(d, exist_ok=True)

    # 1. Download Stubble / Crop Production data
    stubble_url = "https://raw.githubusercontent.com/ankitaS11/Crop-Yield-Prediction-in-India-using-ML/main/crop_production.csv"
    stubble_raw_path = os.path.join(raw_stubble_dir, "crop_production_india.csv")
    if not os.path.exists(stubble_raw_path):
        print(f"Downloading Stubble Raw Data from {stubble_url}...")
        req = urllib.request.Request(stubble_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp, open(stubble_raw_path, 'wb') as out_f:
            out_f.write(resp.read())
        print(f"Downloaded: {stubble_raw_path} ({os.path.getsize(stubble_raw_path)} bytes)")
    else:
        print(f"Stubble raw data exists: {stubble_raw_path}")

    # 2. Download NASA FIRMS VIIRS 2023 India Active Fire data
    firms_url = "https://firms.modaps.eosdis.nasa.gov/data/country/viirs-snpp/2023/viirs-snpp_2023_India.csv"
    firms_raw_path = os.path.join(raw_fire_dir, "viirs-snpp_2023_India.csv")
    if not os.path.exists(firms_raw_path):
        print(f"Downloading NASA FIRMS VIIRS 2023 India data from {firms_url}...")
        req = urllib.request.Request(firms_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp, open(firms_raw_path, 'wb') as out_f:
            out_f.write(resp.read())
        print(f"Downloaded: {firms_raw_path} ({os.path.getsize(firms_raw_path)} bytes)")
    else:
        print(f"FIRMS raw data exists: {firms_raw_path}")

    # Also download 7-day recent stream as supplementary real-time observation
    firms_7d_url = "https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_Asia_7d.csv"
    firms_7d_path = os.path.join(raw_fire_dir, "SUOMI_VIIRS_C2_South_Asia_7d.csv")
    if not os.path.exists(firms_7d_path):
        try:
            req = urllib.request.Request(firms_7d_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as resp, open(firms_7d_path, 'wb') as out_f:
                out_f.write(resp.read())
            print(f"Downloaded: {firms_7d_path}")
        except Exception as e:
            print(f"Note: Could not download 7d stream: {e}")

if __name__ == "__main__":
    download_data()
