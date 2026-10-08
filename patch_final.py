import re

# 1. Fix CreateListing.jsx
file_cl = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\pages\CreateListing.jsx"
with open(file_cl, 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the try block completely
start_str = "    try {\n"
end_str = "    } catch (err) {\n"
start_idx = content.find(start_str)
end_idx = content.find(end_str)

new_try = """    try {
      await apiFetch('/api/listings', { method: 'POST', body: JSON.stringify(payload) });
      setSuccess(true);
"""
content = content[:start_idx] + new_try + content[end_idx:]

with open(file_cl, 'w', encoding='utf-8') as f:
    f.write(content)


# 2. Fix FarmerActivity.jsx
file_fa = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\pages\FarmerActivity.jsx"
with open(file_fa, 'r', encoding='utf-8') as f:
    content = f.read()

# Add viewingListing state
if "const [viewingListing, setViewingListing]" not in content:
    content = content.replace(
        "const [error, setError] = useState('');",
        "const [error, setError] = useState('');\n  const [viewingListing, setViewingListing] = useState(null);\n  const [editingListing, setEditingListing] = useState(null);\n  const [editForm, setEditForm] = useState({ quantity_tonnes: '', asking_price_per_tonne: '' });"
    )

with open(file_fa, 'w', encoding='utf-8') as f:
    f.write(content)

print("Both files fixed!")
