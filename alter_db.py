import sqlite3

db_path = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\backend\paralipay.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE stubble_listings ADD COLUMN village VARCHAR(150)")
    cursor.execute("ALTER TABLE stubble_listings ADD COLUMN crop VARCHAR(100)")
    cursor.execute("ALTER TABLE stubble_listings ADD COLUMN residue_type VARCHAR(100)")
    cursor.execute("ALTER TABLE stubble_listings ADD COLUMN condition VARCHAR(100)")
    cursor.execute("ALTER TABLE stubble_listings ADD COLUMN harvest_date VARCHAR(50)")
    conn.commit()
    print("Database altered successfully.")
except Exception as e:
    print(f"Alter failed (might already exist): {e}")

conn.close()
