from fastapi.testclient import TestClient
from main import app
from models import UserRole
import json

client = TestClient(app)

# Helper function to get token
def login(email, password="password123"):
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def test_gov_endpoints_unauthorized():
    # Attempt without token
    response = client.get("/api/government/overview")
    assert response.status_code == 401

def test_gov_endpoints_farmer_forbidden():
    # Assume farmer1@example.com exists (from test_auth)
    token = login("farmer1@example.com")
    if token:
        response = client.get("/api/government/overview", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 403

def test_gov_endpoints_gov_authorized():
    # Register a gov officer
    client.post("/api/auth/register", json={
        "full_name": "Gov Officer",
        "email": "gov_test@punjab.gov.in",
        "password": "password123",
        "role": "GOVERNMENT",
        "department": "Agriculture"
    })
    token = login("gov_test@punjab.gov.in")
    assert token is not None

    response = client.get("/api/government/overview", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert "marketplace" in response.json()

if __name__ == "__main__":
    test_gov_endpoints_unauthorized()
    test_gov_endpoints_farmer_forbidden()
    test_gov_endpoints_gov_authorized()
    print("Tests passed.")
