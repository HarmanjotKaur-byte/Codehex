import os
import sqlite3

db_path = os.path.join(os.path.dirname(__file__), "backend", "paralipay.db")

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

print("=" * 80)
print(f"PARALIPAY DATABASE VIEWER: {db_path}")
print("=" * 80)

# 1. USERS TABLE
print("\n--- [1] ALL USERS (users table) ---")
cur.execute("SELECT id, full_name, email, role, is_active, created_at FROM users")
users = cur.fetchall()
if not users:
    print("No users found.")
else:
    for u in users:
        print(f"ID: {u[0]:<3} | Role: {u[3]:<12} | Name: {u[1]:<20} | Email: {u[2]:<30}")

# 2. FARMER PROFILES
print("\n--- [2] FARMER PROFILES (farmer_profiles) ---")
cur.execute("SELECT user_id, state, district, village FROM farmer_profiles")
farmers = cur.fetchall()
for f in farmers:
    print(f"User ID: {f[0]:<3} | State: {f[1]} | District: {f[2]} | Village: {f[3] or 'N/A'}")

# 3. BUYER PROFILES
print("\n--- [3] BUYER PROFILES (buyer_profiles) ---")
cur.execute("SELECT user_id, business_name, buyer_type, state, district FROM buyer_profiles")
buyers = cur.fetchall()
for b in buyers:
    print(f"User ID: {b[0]:<3} | Business: {b[1]} | Type: {b[2]} | District: {b[4]}")

# 4. GOVERNMENT PROFILES & VERIFICATION STATUS
print("\n--- [4] GOVERNMENT PROFILES & VERIFICATION (government_profiles) ---")
cur.execute("SELECT user_id, department, designation, employee_id, verification_status, rejection_reason FROM government_profiles")
govs = cur.fetchall()
for g in govs:
    print(f"User ID: {g[0]:<3} | Status: {g[4]:<10} | ID: {g[3]:<12} | Dept: {g[1]} | Reason: {g[5] or 'None'}")

# 5. MARKETPLACE STUBBLE LISTINGS
print("\n--- [5] STUBBLE LISTINGS (stubble_listings) ---")
cur.execute("SELECT id, farmer_id, quantity_tonnes, asking_price_per_tonne, district, status FROM stubble_listings")
listings = cur.fetchall()
if not listings:
    print("No listings found yet.")
else:
    for l in listings:
        print(f"Listing #{l[0]} | Farmer ID: {l[1]} | {l[2]} tonnes @ Rs.{l[3]}/t | District: {l[4]} | Status: {l[5]}")

print("=" * 80)
conn.close()
