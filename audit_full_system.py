import sys
import json
import warnings
warnings.filterwarnings('ignore')

from fastapi.testclient import TestClient
from backend.main import app

def run_comprehensive_audit():
    print("=" * 70)
    print("PARALIPAY COMPREHENSIVE BACKEND & INTEGRATION AUDIT")
    print("=" * 70)

    with TestClient(app) as client:
        # 1. Health Endpoint
        print("\n[SECTION 1: HEALTH ENDPOINT]")
        r_health = client.get('/api/health')
        assert r_health.status_code == 200, f"Health check failed with {r_health.status_code}"
        h_data = r_health.json()
        print("  Status:", h_data.get("status"))
        print("  Models Loaded:", h_data.get("models_loaded"))
        print("  Model 1:", h_data.get("models", {}).get("model_1_stubble", {}).get("status"))
        print("  Model 3:", h_data.get("models", {}).get("model_3_burning_risk", {}).get("status"))
        print("  Model 2:", h_data.get("models", {}).get("model_2_buyer_matching", {}).get("status"))
        assert h_data.get("status") == "ok"
        assert h_data.get("models_loaded") is True
        print("  -> Section 1 Health Check: PASS")

        # 2. Farmer Workflow: Step 1 - Stubble Estimation (10 ha)
        print("\n[SECTION 2: FARMER WORKFLOW STEP 1 - Stubble 10ha]")
        payload_10ha = {
            "Area": 10.0,
            "State_Name": "Punjab",
            "District_Name": "Ludhiana",
            "Crop_Year": 2026,
            "Season": "Kharif"
        }
        r_stub10 = client.post('/api/stubble/predict', json=payload_10ha)
        assert r_stub10.status_code == 200, f"Stubble prediction 10ha failed: {r_stub10.text}"
        d_stub10 = r_stub10.json()
        print(f"  Predicted Stubble: {d_stub10.get('predicted_stubble_tonnes')} tonnes (Expected ~30.3t)")
        print(f"  State Used: {d_stub10.get('state_used')}")
        print(f"  District Used: {d_stub10.get('district_used')}")
        print(f"  Area Hectares: {d_stub10.get('area_hectares')}")
        print(f"  District Baseline Yield: {d_stub10.get('district_baseline_yield_t_ha')} t/ha")
        assert 28.0 <= d_stub10.get('predicted_stubble_tonnes', 0) <= 33.0, "Stubble estimate not near 30.3t"
        assert d_stub10.get('state_used') == "Punjab"
        assert d_stub10.get('district_used') == "LUDHIANA"
        assert d_stub10.get('area_hectares') == 10.0
        print("  -> Step 1 Stubble Estimation (10ha): PASS")

        # Step 2 - Change Area to 20 ha
        print("\n[SECTION 2: FARMER WORKFLOW STEP 2 - Change Area to 20ha]")
        payload_20ha = {
            "Area": 20.0,
            "State_Name": "Punjab",
            "District_Name": "Ludhiana",
            "Crop_Year": 2026,
            "Season": "Kharif"
        }
        r_stub20 = client.post('/api/stubble/predict', json=payload_20ha)
        assert r_stub20.status_code == 200
        d_stub20 = r_stub20.json()
        print(f"  Predicted Stubble: {d_stub20.get('predicted_stubble_tonnes')} tonnes (Expected ~60.6t)")
        print(f"  Area Hectares: {d_stub20.get('area_hectares')}")
        assert 58.0 <= d_stub20.get('predicted_stubble_tonnes', 0) <= 63.0, "Stubble estimate not near 60.6t"
        assert d_stub20.get('area_hectares') == 20.0
        print("  -> Step 2 Change Area (20ha): PASS")

        # Step 3 - Burning Risk (Lat 30.9000, Lon 75.8573, Date 2026-11-01)
        print("\n[SECTION 2: FARMER WORKFLOW STEP 3 - Burning Risk]")
        payload_risk = {
            "latitude": 30.9000,
            "longitude": 75.8573,
            "date": "2026-11-01"
        }
        r_risk = client.post('/api/risk/predict', json=payload_risk)
        assert r_risk.status_code == 200, f"Risk prediction failed: {r_risk.text}"
        d_risk = r_risk.json()
        prob = d_risk.get('burning_probability')
        risk_lvl = d_risk.get('risk_level')
        print(f"  Burning Probability: {prob} ({round(prob * 100, 2)}%)")
        print(f"  Risk Level: {risk_lvl}")
        print(f"  Snapping Grid: {d_risk.get('grid_lat')}N, {d_risk.get('grid_lon')}E")
        print(f"  Lag Source: {d_risk.get('lag_data_source')}")
        assert isinstance(prob, (int, float)) and not (prob != prob)
        assert 0.0 <= prob <= 1.0
        assert risk_lvl in ["LOW", "MEDIUM", "HIGH"]
        print("  -> Step 3 Burning Risk: PASS")

        # Step 4 - Buyer Matching (30.3t, Lat 30.9, Lon 75.8573, Max Dist 300 & 500 km)
        print("\n[SECTION 2: FARMER WORKFLOW STEP 4 - Buyer Matching]")
        payload_buyer300 = {
            "stubble_quantity": 30.3,
            "farmer_latitude": 30.9,
            "farmer_longitude": 75.8573,
            "max_distance_km": 300.0
        }
        r_b300 = client.post('/api/buyers/match', json=payload_buyer300)
        assert r_b300.status_code == 200, f"Buyer matching 300km failed: {r_b300.text}"
        d_b300 = r_b300.json()
        print(f"  Search Radius: {d_b300.get('search_radius_km')} km")
        print(f"  Farmer Stubble: {d_b300.get('farmer_stubble_tonnes')} tonnes")
        print(f"  Matched Buyers Count: {d_b300.get('matched_buyers_count')}")
        matches300 = d_b300.get("matches", [])
        assert d_b300.get('search_radius_km') == 300.0
        assert d_b300.get('farmer_stubble_tonnes') == 30.3
        assert len(matches300) == d_b300.get('matched_buyers_count')
        assert len(matches300) > 0, "Expected buyers within 300km of Ludhiana"
        top_buyer = matches300[0]
        print(f"  Top Match: {top_buyer.get('buyer_name')} | Dist: {top_buyer.get('distance_km')}km | Score: {top_buyer.get('suitability_score')}")

        payload_buyer500 = {
            "stubble_quantity": 30.3,
            "farmer_latitude": 30.9,
            "farmer_longitude": 75.8573,
            "max_distance_km": 500.0
        }
        r_b500 = client.post('/api/buyers/match', json=payload_buyer500)
        assert r_b500.status_code == 200
        d_b500 = r_b500.json()
        print(f"  Search Radius: {d_b500.get('search_radius_km')} km")
        print(f"  Matched Buyers Count: {d_b500.get('matched_buyers_count')}")
        assert d_b500.get('matched_buyers_count') >= d_b300.get('matched_buyers_count')
        print("  -> Step 4 Buyer Matching (300km & 500km): PASS")

        # 3. Input Validation & Negative Cases
        print("\n[SECTION 3: INPUT VALIDATION & ERROR HANDLING]")
        # Stubble Area <= 0
        r_neg_area = client.post('/api/stubble/predict', json={
            "Area": -10.0,
            "State_Name": "Punjab",
            "District_Name": "Ludhiana"
        })
        print(f"  Area=-10 HTTP Status: {r_neg_area.status_code} (Expected 422 Unprocessable Entity)")
        assert r_neg_area.status_code == 422

        # Risk Latitude outside range
        r_bad_lat = client.post('/api/risk/predict', json={
            "latitude": 15.0,  # Below 20.0
            "longitude": 75.8573,
            "date": "2026-11-01"
        })
        print(f"  Lat=15.0 HTTP Status: {r_bad_lat.status_code} (Expected 422 Unprocessable Entity)")
        assert r_bad_lat.status_code == 422

        # Buyer negative stubble quantity
        r_neg_stub = client.post('/api/buyers/match', json={
            "stubble_quantity": -5.0,
            "farmer_latitude": 30.9,
            "farmer_longitude": 75.8573
        })
        print(f"  Stubble=-5.0 HTTP Status: {r_neg_stub.status_code} (Expected 422 Unprocessable Entity)")
        assert r_neg_stub.status_code == 422
        print("  -> Section 3 Input Validation: PASS")

        # 4. Registered Buyers Directory
        print("\n[SECTION 4: DEMO BUYERS DIRECTORY]")
        r_buyers = client.get('/api/buyers')
        assert r_buyers.status_code == 200
        buyers_list = r_buyers.json()
        print(f"  Total Registered Demo Buyers: {len(buyers_list)}")
        assert len(buyers_list) == 8, f"Expected 8 demo buyers, found {len(buyers_list)}"
        print("  -> Section 4 Demo Buyers: PASS")

    print("\n" + "=" * 70)
    print("ALL BACKEND AUDIT CHECKS PASSED PERFECTLY")
    print("=" * 70)

if __name__ == "__main__":
    run_comprehensive_audit()
