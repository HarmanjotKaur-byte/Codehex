import re

filepath = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\pages\CreateListing.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace imports
content = content.replace(
    "import { apiFetch } from '../services/api';",
    "import { createListing } from '../services/api';"
)

# Replace fetch logic
start_str = "    try {\n      const token = localStorage.getItem('paralipay_token');"
end_str = "    } catch (err) {"
start_idx = content.find("    try {\n      const token")
end_idx = content.find("    } catch (err) {")

if start_idx != -1 and end_idx != -1:
    new_try = """    try {
      await createListing(payload);
      setSuccess(true);
"""
    content = content[:start_idx] + new_try + content[end_idx:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Restored api.js createListing logic.")
