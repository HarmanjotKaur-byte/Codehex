import requests
import sqlite3

BASE = 'http://127.0.0.1:8000'
roles_to_test = [
    {
        'role': 'FARMER',
        'data': {
            'full_name': 'E2E Farmer Ram Singh',
            'email': 'e2e_farmer@punjab.in',
            'phone': '9876543210',
            'password': 'SecurePassword2026!',
            'role': 'FARMER',
            'state': 'Punjab',
            'district': 'Ludhiana',
            'village': 'Khamano Pind',
            'state_id': 'PB',
            'district_id': 'PB-LUDHIANA'
        }
    },
    {
        'role': 'BUYER',
        'data': {
            'full_name': 'E2E Buyer Vikram Patel',
            'email': 'e2e_buyer@biomassenergy.com',
            'phone': '9876543211',
            'password': 'SecurePassword2026!',
            'role': 'BUYER',
            'business_name': 'Patel Bio-Pellet Mills',
            'buyer_type': 'Biomass Aggregator',
            'preferred_material': 'Paddy Straw Bales',
            'state': 'Punjab',
            'district': 'Ludhiana',
            'state_id': 'PB',
            'district_id': 'PB-LUDHIANA'
        }
    },
    {
        'role': 'GOVERNMENT',
        'data': {
            'full_name': 'E2E Officer Simran Kaur',
            'email': 'e2e_gov@punjab.gov.in',
            'phone': '9876543212',
            'password': 'SecurePassword2026!',
            'role': 'GOVERNMENT',
            'department': 'Department of Agriculture & Farmers Welfare',
            'designation': 'District Agriculture Officer',
            'state': 'Punjab',
            'district': 'Ludhiana',
            'state_id': 'PB',
            'district_id': 'PB-LUDHIANA',
            'employee_id': 'DAO-PB-9988'
        }
    }
]

db_path = 'D:/Hackathon/CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni/backend/paralipay_v3.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Clean up any existing test records
for item in roles_to_test:
    cur.execute('DELETE FROM users WHERE email = ?', (item['data']['email'],))
conn.commit()

all_passed = True

for item in roles_to_test:
    role = item['role']
    d = item['data']
    print(f"\n==========================================")
    print(f"Testing Registration for {role}")
    print(f"==========================================")
    r_reg = requests.post(f"{BASE}/api/auth/register", json=d)
    if r_reg.status_code != 201:
        print(f"FAILED Register {role}: {r_reg.status_code} {r_reg.text}")
        all_passed = False
        continue
    reg_json = r_reg.json()
    token_reg = reg_json.get('access_token')
    user_id = reg_json.get('user', {}).get('id')
    print(f"SUCCESS Register {role}: User ID {user_id}, Token received: {bool(token_reg)}")

    # Direct SQLite verification
    cur.execute('SELECT id, full_name, email, role, password_hash, created_at FROM users WHERE id = ?', (user_id,))
    user_row = cur.fetchone()
    print(f"DB verification users table: ID={user_row[0]} | Name={user_row[1]} | Email={user_row[2]} | Role={user_row[3]} | Hash={user_row[4][:15]}... | Created={user_row[5]}")
    
    if role == 'FARMER':
        cur.execute('SELECT state, district, village, state_id, district_id FROM farmer_profiles WHERE user_id = ?', (user_id,))
        print('DB farmer_profile row:', cur.fetchone())
    elif role == 'BUYER':
        cur.execute('SELECT business_name, buyer_type, state_id, district_id FROM buyer_profiles WHERE user_id = ?', (user_id,))
        print('DB buyer_profile row:', cur.fetchone())
    elif role == 'GOVERNMENT':
        cur.execute('SELECT department, designation, employee_id, verification_status, state_id, district_id FROM government_profiles WHERE user_id = ?', (user_id,))
        print('DB government_profile row:', cur.fetchone())

    # Now test Sign-In
    print(f"\nTesting Sign-In for {role}...")
    r_login = requests.post(f"{BASE}/api/auth/login", json={'email': d['email'], 'password': d['password']})
    if r_login.status_code != 200:
        print(f"FAILED Login {role}: {r_login.status_code} {r_login.text}")
        all_passed = False
        continue
    login_json = r_login.json()
    token_login = login_json.get('access_token')
    user_name = login_json.get('user', {}).get('full_name')
    print(f"SUCCESS Login {role}: Status {r_login.status_code}, User={user_name}")

    # Test Authenticated /api/auth/me
    r_me = requests.get(f"{BASE}/api/auth/me", headers={'Authorization': f"Bearer {token_login}"})
    print(f"/api/auth/me Status: {r_me.status_code}, Role: {r_me.json().get('role')}")

conn.close()
print("\n==========================================")
print("OVERALL TEST RESULT:", "ALL PASSED!" if all_passed else "SOME FAILED!")
print("==========================================")
