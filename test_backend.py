import os
import sys
import unittest
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from backend.main import app

class TestParaliPayBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Using context manager for TestClient ensures lifespan startup runs
        cls.client_cm = TestClient(app)
        cls.client = cls.client_cm.__enter__()

    @classmethod
    def tearDownClass(cls):
        cls.client_cm.__exit__(None, None, None)

    # --------------------------------------------------------------------------
    # 1. Health Check Test
    # --------------------------------------------------------------------------
    def test_01_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertTrue(data["models_loaded"])
        self.assertEqual(data["models"]["model_1_stubble"]["status"], "ready")
        self.assertEqual(data["models"]["model_3_burning_risk"]["status"], "ready")
        self.assertEqual(data["models"]["model_2_buyer_matching"]["status"], "ready")
        print("PASS: Health check verified.")

    # --------------------------------------------------------------------------
    # 2. Model 1 Stubble Prediction Test
    # --------------------------------------------------------------------------
    def test_02_stubble_prediction_valid(self):
        payload = {
            "Area": 3.5,
            "State_Name": "Punjab",
            "District_Name": "Ludhiana",
            "Crop_Year": 2024,
            "Season": "Kharif"
        }
        response = self.client.post("/api/stubble/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("predicted_stubble_tonnes", data)
        self.assertGreater(data["predicted_stubble_tonnes"], 0)
        self.assertEqual(data["district_used"], "LUDHIANA")
        self.assertEqual(data["state_used"], "Punjab")
        print(f"PASS: Model 1 Stubble Prediction -> Area: {payload['Area']} ha -> {data['predicted_stubble_tonnes']} tonnes")

    def test_03_stubble_prediction_invalid(self):
        payload = {
            "Area": -5.0, # Invalid negative area
            "State_Name": "Punjab",
            "District_Name": "Ludhiana"
        }
        response = self.client.post("/api/stubble/predict", json=payload)
        self.assertEqual(response.status_code, 422) # Pydantic validation error gt=0
        print("PASS: Model 1 Invalid area correctly rejected (HTTP 422).")

    # --------------------------------------------------------------------------
    # 3. Model 3 Burning Risk Prediction Test
    # --------------------------------------------------------------------------
    def test_04_burning_risk_valid(self):
        payload = {
            "latitude": 30.9010,
            "longitude": 75.8573,
            "date": "2024-10-28", # Peak harvest window
            "lag_fire_days_past_3d": 2,
            "lag_fire_days_past_7d": 5,
            "prior_cumulative_fires": 15
        }
        response = self.client.post("/api/risk/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("burning_probability", data)
        self.assertIn("risk_level", data)
        self.assertIn(data["risk_level"], ["LOW", "MEDIUM", "HIGH"])
        self.assertTrue(data["is_peak_harvest_window"])
        print(f"PASS: Model 3 Burning Risk -> Prob: {data['burning_probability']} -> Tier: {data['risk_level']}")

    def test_05_burning_risk_low_activity(self):
        payload = {
            "latitude": 30.1,
            "longitude": 74.5,
            "date": "2024-10-02", # Early season
            "lag_fire_days_past_3d": 0,
            "lag_fire_days_past_7d": 0,
            "prior_cumulative_fires": 0
        }
        response = self.client.post("/api/risk/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("burning_probability", data)
        print(f"PASS: Model 3 Early Season -> Prob: {data['burning_probability']} -> Tier: {data['risk_level']}")

    # --------------------------------------------------------------------------
    # 4. Model 2 Smart Buyer Matching Test
    # --------------------------------------------------------------------------
    def test_06_buyer_matching_ludhiana(self):
        # Farmer in Ludhiana (Lat: 30.90, Lon: 75.85) with 10.5 tonnes stubble
        payload = {
            "stubble_quantity": 10.5,
            "farmer_latitude": 30.9010,
            "farmer_longitude": 75.8573,
            "max_distance_km": 100.0
        }
        response = self.client.post("/api/buyers/match", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(data["matched_buyers_count"], 0)
        top_match = data["matches"][0]
        # Ludhiana buyer should be ranked #1 due to near-zero distance
        self.assertEqual(top_match["buyer_id"], "BUYER-LDH-01")
        self.assertLess(top_match["distance_km"], 5.0)
        self.assertGreater(top_match["suitability_score"], 0.80)
        print(f"PASS: Buyer Matching (Ludhiana Farmer) -> Top Match: {top_match['buyer_name']} ({top_match['distance_km']} km, Score: {top_match['suitability_score']})")

    def test_07_buyer_matching_karnal(self):
        # Farmer in Karnal, Haryana (Lat: 29.68, Lon: 76.99)
        payload = {
            "stubble_quantity": 15.0,
            "farmer_latitude": 29.6857,
            "farmer_longitude": 76.9905,
            "max_distance_km": 100.0
        }
        response = self.client.post("/api/buyers/match", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        top_match = data["matches"][0]
        # Karnal buyer should now be ranked #1
        self.assertEqual(top_match["buyer_id"], "BUYER-KRN-03")
        self.assertLess(top_match["distance_km"], 5.0)
        print(f"PASS: Buyer Matching (Karnal Farmer) -> Top Match dynamically shifted to: {top_match['buyer_name']} ({top_match['distance_km']} km, Score: {top_match['suitability_score']})")

    # --------------------------------------------------------------------------
    # 5. Demo Buyers Directory Test
    # --------------------------------------------------------------------------
    def test_08_get_demo_buyers(self):
        response = self.client.get("/api/buyers")
        self.assertEqual(response.status_code, 200)
        buyers = response.json()
        self.assertGreaterEqual(len(buyers), 6)
        print(f"PASS: Demo buyers directory returned {len(buyers)} active regional buyers.")

if __name__ == "__main__":
    unittest.main()
