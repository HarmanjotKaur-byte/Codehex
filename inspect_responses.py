import sys
sys.path.insert(0, '.')
import json
import warnings
warnings.filterwarnings('ignore')

from fastapi.testclient import TestClient
from backend.main import app

with TestClient(app) as client:
    print("=== RAW stubble response ===")
    r = client.post('/api/stubble/predict', json={'Area':10,'State_Name':'Punjab','District_Name':'Ludhiana','Crop_Year':2026,'Season':'Kharif'})
    print("Status:", r.status_code)
    print(json.dumps(r.json(), indent=2))

    print()
    print("=== RAW risk response ===")
    r2 = client.post('/api/risk/predict', json={'latitude':30.9,'longitude':75.8573,'date':'2026-11-01'})
    print("Status:", r2.status_code)
    print(json.dumps(r2.json(), indent=2))

    print()
    print("=== RAW buyer match response ===")
    r3 = client.post('/api/buyers/match', json={'stubble_quantity':30.3,'farmer_latitude':30.9,'farmer_longitude':75.8573,'max_distance_km':300})
    print("Status:", r3.status_code)
    d3 = r3.json()
    if 'matches' in d3:
        d3_display = {k: v for k, v in d3.items() if k != 'matches'}
        d3_display['matches_sample'] = d3['matches'][:2] if d3['matches'] else []
        print(json.dumps(d3_display, indent=2))
    else:
        print(json.dumps(d3, indent=2))
