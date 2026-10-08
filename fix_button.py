import re

with open('frontend/src/pages/auth/RegisterPage.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Fix the submit button text explicitly
c = re.sub(
    r'\{loading \? <LoadingSpinner text="Creating Account\.\.\." /> : .*?\}',
    '{loading ? <LoadingSpinner text="Creating Account..." /> : role === "FARMER" ? "Create Farmer / Seller Account" : role === "BUYER" ? "Create Biomass Buyer Account" : "Create Government Official Account"}',
    c
)

with open('frontend/src/pages/auth/RegisterPage.jsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Fixed")
