import sys
import os
import unittest
from fastapi.testclient import TestClient

# Put backend directory on sys.path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app
from database import SessionLocal
from models import User, UserRole, GovernmentProfile, VerificationStatus, StubbleListing, BuyerInterest

client = TestClient(app)

class TestParaliPayFullSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Unique email suffix based on current time or random
        import time
        cls.suffix = int(time.time())
        cls.farmer_email = f"farmer_{cls.suffix}@test.com"
        cls.buyer_email = f"buyer_{cls.suffix}@test.com"
        cls.gov_email = f"gov_{cls.suffix}@test.com"
        cls.gov_reject_email = f"gov_reject_{cls.suffix}@test.com"
        cls.password = "SecurePass123!"

    # =========================================================================
    # SECTION 29: AUTHENTICATION TESTS (1-10)
    # =========================================================================

    def test_01_register_farmer(self):
        """1. Register Farmer -> PASS"""
        resp = client.post("/api/auth/register", json={
            "full_name": "Test Farmer",
            "email": self.farmer_email,
            "password": self.password,
            "role": "FARMER",
            "state": "Punjab",
            "district": "Ludhiana",
            "village": "Jagraon"
        })
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "FARMER")

    def test_02_register_buyer(self):
        """2. Register Buyer -> PASS"""
        resp = client.post("/api/auth/register", json={
            "full_name": "Test Buyer",
            "email": self.buyer_email,
            "password": self.password,
            "role": "BUYER",
            "business_name": "Ludhiana Bio Pellets",
            "buyer_type": "Biomass Aggregator",
            "state": "Punjab",
            "district": "Ludhiana"
        })
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "BUYER")

    def test_03_register_government(self):
        """3. Register Government -> PASS, Status = PENDING"""
        resp = client.post("/api/auth/register", json={
            "full_name": "Dr. Manpreet Singh",
            "email": self.gov_email,
            "password": self.password,
            "role": "GOVERNMENT",
            "department": "Agriculture & Farmers Welfare",
            "designation": "Chief Agricultural Officer",
            "employee_id": f"GOV-PUN-{self.suffix}",
            "official_email": f"officer_{self.suffix}@punjab.gov.in"
        })
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "GOVERNMENT")
        self.assertEqual(data["user"]["verification_status"], "PENDING")

    def test_04_attempt_public_super_admin_registration(self):
        """4. Attempt public Super Admin registration -> REJECTED"""
        resp = client.post("/api/auth/register", json={
            "full_name": "Imposter Admin",
            "email": f"imposter_{self.suffix}@test.com",
            "password": self.password,
            "role": "SUPER_ADMIN"
        })
        self.assertEqual(resp.status_code, 400)
        self.assertIn("prohibited", resp.json()["detail"].lower())

    def test_05_duplicate_email(self):
        """5. Duplicate email -> REJECTED"""
        resp = client.post("/api/auth/register", json={
            "full_name": "Duplicate Farmer",
            "email": self.farmer_email,
            "password": self.password,
            "role": "FARMER"
        })
        self.assertEqual(resp.status_code, 400)
        self.assertIn("already exists", resp.json()["detail"].lower())

    def test_06_wrong_password(self):
        """6. Wrong password -> 401"""
        resp = client.post("/api/auth/login", json={
            "email": self.farmer_email,
            "password": "WrongPassword999!"
        })
        self.assertEqual(resp.status_code, 401)

    def test_07_valid_farmer_login(self):
        """7. Valid Farmer login -> JWT"""
        resp = client.post("/api/auth/login", json={
            "email": self.farmer_email,
            "password": self.password
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "FARMER")
        TestParaliPayFullSuite.farmer_token = data["access_token"]
        TestParaliPayFullSuite.farmer_id = data["user"]["id"]

    def test_08_valid_buyer_login(self):
        """8. Valid Buyer login -> JWT"""
        resp = client.post("/api/auth/login", json={
            "email": self.buyer_email,
            "password": self.password
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "BUYER")
        TestParaliPayFullSuite.buyer_token = data["access_token"]
        TestParaliPayFullSuite.buyer_id = data["user"]["id"]

    def test_09_valid_government_login_while_pending(self):
        """9. Valid Government login while PENDING -> Login allowed with PENDING status"""
        resp = client.post("/api/auth/login", json={
            "email": self.gov_email,
            "password": self.password
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "GOVERNMENT")
        self.assertEqual(data["user"]["verification_status"], "PENDING")
        TestParaliPayFullSuite.gov_token = data["access_token"]
        TestParaliPayFullSuite.gov_id = data["user"]["id"]

    def test_10_invalid_jwt(self):
        """10. Invalid JWT -> 401"""
        resp = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid.fake.token"})
        self.assertEqual(resp.status_code, 401)

    # =========================================================================
    # SECTION 30: GOVERNMENT VERIFICATION TESTS (11-21)
    # =========================================================================

    def test_11_government_submits_verification_information(self):
        """11. Government submits verification information -> PENDING"""
        resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {self.gov_token}"})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["verification_status"], "PENDING")

    def test_12_government_attempts_government_dashboard_while_pending(self):
        """12. Government attempts Government verification endpoint / admin stats while PENDING -> 403"""
        resp = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {self.gov_token}"})
        self.assertEqual(resp.status_code, 403)

    def test_13_super_admin_logs_in(self):
        """13. Super Admin logs in -> Super Admin Dashboard credentials work"""
        resp = client.post("/api/auth/login", json={
            "email": "admin@paralipay.gov.in",
            "password": "Admin@ParaliPay2026"
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["user"]["role"], "SUPER_ADMIN")
        TestParaliPayFullSuite.admin_token = data["access_token"]

    def test_14_super_admin_views_pending_verification(self):
        """14. Super Admin views pending verification -> request visible"""
        resp = client.get("/api/admin/verifications?status_filter=PENDING", headers={
            "Authorization": f"Bearer {self.admin_token}"
        })
        self.assertEqual(resp.status_code, 200)
        items = resp.json()
        found = any(item["user_id"] == self.gov_id for item in items)
        self.assertTrue(found, "Pending officer request should be in the queue")

    def test_15_super_admin_approves_government_account(self):
        """15. Super Admin approves Government account -> verification_status = VERIFIED"""
        resp = client.post(f"/api/admin/verifications/{self.gov_id}/approve", headers={
            "Authorization": f"Bearer {self.admin_token}"
        })
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["verification_status"], "VERIFIED")

    def test_16_verified_government_logs_in(self):
        """16. Verified Government logs in -> Government Dashboard accessible"""
        resp = client.post("/api/auth/login", json={
            "email": self.gov_email,
            "password": self.password
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["user"]["verification_status"], "VERIFIED")

    def test_17_super_admin_rejects_another_government_account(self):
        """17. Super Admin rejects another Government account -> verification_status = REJECTED"""
        # Register second government account
        r = client.post("/api/auth/register", json={
            "full_name": "Rejected Officer",
            "email": self.gov_reject_email,
            "password": self.password,
            "role": "GOVERNMENT",
            "department": "External Agency",
            "designation": "Contractor",
            "employee_id": f"REJ-{self.suffix}"
        })
        reject_id = r.json()["user"]["id"]

        resp = client.post(f"/api/admin/verifications/{reject_id}/reject", json={
            "rejection_reason": "Unable to verify department credentials against state directory."
        }, headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["verification_status"], "REJECTED")
        TestParaliPayFullSuite.gov_reject_id = reject_id

    def test_18_rejected_government_attempts_dashboard(self):
        """18. Rejected Government attempts dashboard -> REJECTED status shown on login"""
        resp = client.post("/api/auth/login", json={
            "email": self.gov_reject_email,
            "password": self.password
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["user"]["verification_status"], "REJECTED")
        self.assertIn("directory", data["user"]["rejection_reason"])

    def test_19_farmer_attempts_super_admin_endpoint(self):
        """19. Farmer attempts Super Admin endpoint -> 403"""
        resp = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {self.farmer_token}"})
        self.assertEqual(resp.status_code, 403)

    def test_20_buyer_attempts_government_verification_endpoint(self):
        """20. Buyer attempts Government verification endpoint -> 403"""
        resp = client.get("/api/admin/verifications", headers={"Authorization": f"Bearer {self.buyer_token}"})
        self.assertEqual(resp.status_code, 403)

    def test_21_government_attempts_super_admin_endpoint(self):
        """21. Government attempts Super Admin endpoint -> 403"""
        resp = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {self.gov_token}"})
        self.assertEqual(resp.status_code, 403)

    # =========================================================================
    # SECTION 31: MARKETPLACE TESTS (22-27)
    # =========================================================================

    def test_22_farmer_creates_stubble_listing(self):
        """22. Farmer creates stubble listing -> stored in database"""
        resp = client.post("/api/listings", json={
            "quantity_tonnes": 30.5,
            "asking_price_per_tonne": 2200.0,
            "latitude": 30.9000,
            "longitude": 75.8573,
            "district": "Ludhiana",
            "state": "Punjab"
        }, headers={"Authorization": f"Bearer {self.farmer_token}"})
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertEqual(data["quantity_tonnes"], 30.5)
        self.assertEqual(data["status"], "AVAILABLE")
        TestParaliPayFullSuite.listing_id = data["id"]

    def test_23_farmer_views_own_listing(self):
        """23. Farmer views own listing -> visible"""
        resp = client.get("/api/listings/my", headers={"Authorization": f"Bearer {self.farmer_token}"})
        self.assertEqual(resp.status_code, 200)
        items = resp.json()
        self.assertTrue(any(l["id"] == self.listing_id for l in items))

    def test_24_buyer_views_available_listing(self):
        """24. Buyer views available listing -> visible"""
        resp = client.get("/api/listings?district=Ludhiana")
        self.assertEqual(resp.status_code, 200)
        items = resp.json()
        self.assertTrue(any(l["id"] == self.listing_id for l in items))

    def test_25_buyer_expresses_interest(self):
        """25. Buyer expresses interest -> buyer_interests record created"""
        resp = client.post("/api/interests", json={
            "listing_id": self.listing_id,
            "message": "Interested in 30 tonnes for biomass pelletization plant."
        }, headers={"Authorization": f"Bearer {self.buyer_token}"})
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertEqual(data["status"], "INTERESTED")
        self.assertEqual(data["buyer_id"], self.buyer_id)

    def test_26_another_farmer_attempts_to_edit_first_farmers_listing(self):
        """26. Another Farmer attempts to edit first Farmer's listing -> 403"""
        # Register second farmer
        r = client.post("/api/auth/register", json={
            "full_name": "Second Farmer",
            "email": f"farmer2_{self.suffix}@test.com",
            "password": self.password,
            "role": "FARMER"
        })
        f2_token = r.json()["access_token"]

        resp = client.patch(f"/api/listings/{self.listing_id}", json={
            "asking_price_per_tonne": 1500.0
        }, headers={"Authorization": f"Bearer {f2_token}"})
        self.assertEqual(resp.status_code, 403)

    def test_27_government_views_marketplace_data(self):
        """27. Government views marketplace data -> read-only available listings"""
        resp = client.get("/api/listings", headers={"Authorization": f"Bearer {self.gov_token}"})
        self.assertEqual(resp.status_code, 200)
        self.assertIsInstance(resp.json(), list)

if __name__ == "__main__":
    unittest.main()
