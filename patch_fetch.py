import re

filepath = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\pages\CreateListing.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start_str = "    try {\n      await apiFetch('/api/listings', { method: 'POST', body: JSON.stringify(payload) });\n      setSuccess(true);\n"
end_str = "    } catch (err) {"

new_try = """    try {
      const token = localStorage.getItem('paralipay_token');
      const res = await fetch('http://localhost:8000/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
            const errData = await res.json();
            msg = errData.detail || JSON.stringify(errData);
        } catch(e) {}
        throw new Error(msg);
      }
      setSuccess(true);
"""

start_idx = content.find(start_str)
end_idx = content.find(end_str)
if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_try + content[end_idx:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("CreateListing patched with raw fetch.")
