import sqlite3
import sys

def add_column(cursor, table, col, def_type="VARCHAR(100)"):
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {def_type}")
        print(f"Added {col} to {table}")
    except sqlite3.OperationalError as e:
        print(f"Skipped {col} in {table}: {e}")

try:
    conn = sqlite3.connect('backend/paralipay_v3.db')
    cursor = conn.cursor()
    
    add_column(cursor, 'farmer_profiles', 'state_id')
    add_column(cursor, 'farmer_profiles', 'district_id')
    add_column(cursor, 'farmer_profiles', 'village_id')
    
    add_column(cursor, 'buyer_profiles', 'state_id')
    add_column(cursor, 'buyer_profiles', 'district_id')
    
    add_column(cursor, 'government_profiles', 'state_id')
    add_column(cursor, 'government_profiles', 'district_id')
    
    conn.commit()
    conn.close()
    print("Database updated.")
except Exception as e:
    print(f"Error: {e}")
