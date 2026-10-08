import os

filepath = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\pages\FarmerActivity.jsx"

# Read raw bytes
with open(filepath, 'rb') as f:
    raw = f.read()

# Try to decode from UTF-16 if it got corrupted
try:
    if raw.startswith(b'\xff\xfe') or b'\x00' in raw:
        text = raw.decode('utf-16le')
        # Re-save as UTF-8
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(text)
        print("Fixed UTF-16 corruption!")
    else:
        print("File is not UTF-16.")
except Exception as e:
    print(f"Error: {e}")
