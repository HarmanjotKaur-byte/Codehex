import re
c = open('backend/main.py', encoding='utf-8').read()
routes = re.findall(r"@app\.(get|post|patch|delete|put)\(['\"](/api[^'\"]*)", c)
for method, path in routes:
    print(f"{method.upper():8} {path}")
