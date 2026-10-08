import re
content = open('backend/main.py', encoding='utf-8').read()
# Find the get_listings function body
idx = content.find("GET /api/listings")
# Find via route decorator
match = re.search(r'@app\.get\([\'\"]/api/listings[\'\"](.*?)(?=@app\.|$)', content, re.DOTALL)
if match:
    print(match.group(0)[:1500])
