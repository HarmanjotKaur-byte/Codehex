import re
import json

with open('frontend/src/i18n/locales/hi.js', 'r', encoding='utf-8') as f:
    hi_content = f.read()

# Replace export default { ... } with just { ... }
json_str = hi_content.replace('export default {', '{').strip()
if json_str.endswith(';'):
    json_str = json_str[:-1]

# Convert the JS object to valid JSON if possible, but JS objects have unquoted keys
# Instead of parsing, let's just use regex to extract key paths and translate them to english
import ast

def parse_js_object(js_string):
    # This is a bit hacky, but we can try to extract keys
    pass

lines = hi_content.split('\n')
en_lines = []
for line in lines:
    if ':' in line and '"' in line:
        match = re.search(r'([a-zA-Z0-9_]+):\s*"(.*?)"(,?)$', line)
        if match:
            key = match.group(1)
            # Create a sensible english translation based on the key
            # CamelCase to Title Case
            words = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?=[A-Z]|$)', key)
            if not words:
                words = [key]
            
            eng_text = " ".join(word.capitalize() for word in words)
            
            # Special overrides based on common knowledge
            overrides = {
                'appName': 'ParaliPay',
                'tagline': 'Empowering Farmers, Greening the Future',
                'signinBtn': 'Sign In',
                'signupBtn': 'Create Account',
                'createAccountBtn': 'Create Account',
                'dashboardBtn': 'Dashboard',
                'dashboard': 'Dashboard',
                'userProfile': 'My Profile',
                'logout': 'Logout',
                'login': 'Sign In',
                'register': 'Sign Up',
                'stubbleQuantity': 'Estimated Stubble Quantity',
                'buyerMatching': 'Smart Buyer Matching',
                'burningRisk': 'Stubble Burning Risk',
                'backendOnline': 'Backend is Online',
                'backendOffline': 'Backend is Offline',
                'rupees': '₹',
                'FARMER': 'Farmer / Seller',
                'BUYER': 'Biomass Buyer',
                'GOVERNMENT': 'Government Official'
            }
            if key in overrides:
                eng_text = overrides[key]
                
            en_lines.append(f'    {key}: "{eng_text}"{match.group(3)}')
        else:
            en_lines.append(line)
    else:
        en_lines.append(line)

with open('frontend/src/i18n/locales/en.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(en_lines))

print("Created en.js")
